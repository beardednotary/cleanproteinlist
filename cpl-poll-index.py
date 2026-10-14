#!/usr/bin/env python3
"""
CPL POLL INDEX
==============
Rebuilds the Protein Brand Safety Search Index numbers from the raw
Formspree poll (form xeopynkp), so monthly updates are reproducible.

Usage (from repo root):
    py cpl-poll-index.py                          # fetch live via API, all-time
    py cpl-poll-index.py --until 2026-08-29T20:56:59Z
    py cpl-poll-index.py --since 2026-08-30 --until 2026-10-13T23:59:59Z
    py cpl-poll-index.py --input export.json      # use a saved export instead of the API
    py cpl-poll-index.py --save raw.json          # also save the raw pull
    py cpl-poll-index.py --top 30 --json out.json

API access reads two env vars (never hard-code the key):
    FORMSPREE_READONLY_KEY   read-only key from the form's Settings > HTTP API
    FORMSPREE_HASHID         xeopynkp

Method (matches the published methodology table):
  1. Brand text normalized: lowercase, accents/punctuation stripped, then
     mapped to a parent brand via ALIASES (spelling + product-line variants).
     Anything unmatched stays as its own normalized string, ungrouped.
  2. Dedup: a submission is dropped if the same normalized brand was last
     submitted less than 6 minutes earlier (chained, so a burst collapses to one).
  3. Submissions with no brand field (pre-Jan 21, 2026) count toward totals
     but not the brand ranking.
"""

import re, os, sys, json, base64, argparse, unicodedata, urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

DEDUP_WINDOW = timedelta(minutes=6)
API = "https://formspree.io/api/0/forms/{}/submissions?limit=100&offset={}"

# ── parent-brand aliases, checked in order against the normalized string ──
# keep patterns anchored; "organic" must never match Orgain
ALIASES = [
    ("Orgain",             r"^org(ain|ian|ane|in)\b"),
    ("Premier Protein",    r"^prem(ier|iere|eir|ire|eire|ere|ior)\b"),
    ("Levels",             r"^levels?\b"),
    ("Naked Nutrition",    r"^naked\b"),
    ("Garden of Life",     r"^garden of life\b|^gol\b"),
    ("Optimum Nutrition",  r"^optimum\b|^on\b|^gold standard\b"),
    ("Isopure",            r"^iso ?pure\b"),
    ("Nutricost",          r"^nutri ?cost\b"),
    ("OWYN",               r"^owyn\b|^only what you need\b"),
    ("Sunwarrior",         r"^sun ?warrior\b"),
    ("Fairlife",           r"^fair ?life\b|^core ?power\b"),
    ("Transparent Labs",   r"^transparent\b"),
    ("Vital Proteins",     r"^vital\b"),
    ("Truvani",            r"^truvani\b"),
    ("Ascent",             r"^ascent\b"),
    ("Muscle Milk",        r"^muscle ?milk\b"),
    ("Vega",               r"^vega\b"),
    ("NOW Sports",         r"^now\b"),
    ("MyProtein",          r"^my ?protein\b"),
    ("LeanFit",            r"^lean ?fit\b"),
    ("Nurri",              r"^nurri\b"),
    ("FlavCity",           r"^flav ?city\b"),
    ("Just Ingredients",   r"^just ingredients?\b"),
    ("Clean Simple Eats",  r"^clean simple\b"),
    ("Oikos",              r"^oikos\b"),
    ("Pure Protein",       r"^pure protein\b"),
    ("Thorne",             r"^thorne\b"),
    ("Body Fortress",      r"^body fortress\b"),
    ("Ancient Nutrition",  r"^ancient nutrition\b"),
    ("Promix",             r"^pro ?mix\b"),
    ("Ka'Chava",           r"^ka ?chava\b"),
    ("Jocko",              r"^jocko\b"),
    ("Legion",             r"^legion\b"),
    ("Designer Wellness",  r"^designer\b"),
    ("Ensure",             r"^ensure\b"),
    ("MuscleTech",         r"^muscle ?tech\b"),
    ("Six Star",           r"^six ?star\b"),
    ("Good Protein",       r"^good ?protein\b"),
    ("Plant Fusion",       r"^plant ?fusion\b"),
]
ALIASES = [(name, re.compile(p)) for name, p in ALIASES]


def norm(text):
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-z0-9 ]+", " ", t.lower())
    return re.sub(r"\s+", " ", t).strip()


def canonical(raw):
    t = norm(raw)
    if not t:
        return None
    for name, rx in ALIASES:
        if rx.search(t):
            return name
    return t


def parse_ts(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def fetch_api():
    key, hashid = os.environ.get("FORMSPREE_READONLY_KEY"), os.environ.get("FORMSPREE_HASHID")
    if not key or not hashid:
        sys.exit("Set FORMSPREE_READONLY_KEY and FORMSPREE_HASHID, or pass --input.")
    auth = base64.b64encode(f":{key}".encode()).decode()
    rows, offset = [], 0
    while True:
        req = urllib.request.Request(API.format(hashid, offset), headers={"Authorization": f"Basic {auth}"})
        with urllib.request.urlopen(req) as r:
            batch = json.load(r).get("submissions", [])
        if not batch:
            break
        rows += batch
        offset += len(batch)
        if len(batch) < 100:
            break
    return rows


def load_input(path):
    with open(path, encoding="utf-8-sig") as f:
        data = json.load(f)
    return data["submissions"] if isinstance(data, dict) else data


def build(rows, since=None, until=None):
    rows = [r for r in rows if r.get("_date")]
    for r in rows:
        r["_ts"] = parse_ts(r["_date"])
    rows = [r for r in rows if (not since or r["_ts"] >= since) and (not until or r["_ts"] <= until)]
    rows.sort(key=lambda r: r["_ts"])

    last_seen, kept, raw_branded = {}, [], 0
    for r in rows:
        b = canonical(r.get("brand") or "")
        if not b:
            continue
        raw_branded += 1
        prev = last_seen.get(b)
        last_seen[b] = r["_ts"]
        if prev and r["_ts"] - prev < DEDUP_WINDOW:
            continue
        kept.append((r, b))

    counts = Counter(b for _, b in kept)
    types = Counter((r.get("type") or r.get("choice") or "").strip() or "(none)" for r in rows)
    monthly = defaultdict(lambda: [0, 0])          # month -> [raw, deduped brand]
    for r in rows:
        monthly[r["_ts"].strftime("%Y-%m")][0] += 1
    for r, _ in kept:
        monthly[r["_ts"].strftime("%Y-%m")][1] += 1

    days = {r["_ts"].date() for r in rows}
    gaps = []
    if rows:
        d, end = rows[0]["_ts"].date(), rows[-1]["_ts"].date()
        while d <= end:
            if d not in days:
                gaps.append(d.isoformat())
            d += timedelta(days=1)

    return {
        "window": [rows[0]["_date"] if rows else None, rows[-1]["_date"] if rows else None],
        "raw_total": len(rows),
        "raw_branded": raw_branded,
        "deduped_branded": len(kept),
        "ranking": counts.most_common(),
        "types": dict(types),
        "monthly": {m: {"raw": v[0], "deduped_branded": v[1]} for m, v in sorted(monthly.items())},
        "zero_days": gaps,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input")
    ap.add_argument("--save")
    ap.add_argument("--since")
    ap.add_argument("--until")
    ap.add_argument("--top", type=int, default=20)
    ap.add_argument("--json")
    a = ap.parse_args()

    def when(s, end=False):
        if not s:
            return None
        if len(s) == 10:
            s += "T23:59:59.999999+00:00" if end else "T00:00:00+00:00"
        return parse_ts(s)

    rows = load_input(a.input) if a.input else fetch_api()
    if a.save:
        with open(a.save, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=1)

    res = build(rows, when(a.since), when(a.until, end=True))
    total = res["deduped_branded"]

    print(f"Window:            {res['window'][0]}  ->  {res['window'][1]}")
    print(f"Raw submissions:   {res['raw_total']:,}")
    print(f"Raw naming brand:  {res['raw_branded']:,}")
    print(f"Deduped branded:   {total:,}")
    print(f"\nTop {a.top}:")
    for i, (b, n) in enumerate(res["ranking"][:a.top], 1):
        print(f"  {i:>2}. {b:<22} {n:>5}   {n / total:6.1%}")
    tail = res["ranking"][a.top:]
    print(f"\nOutside top {a.top}: {len(tail)} distinct entries, {sum(n for _, n in tail):,} deduped submissions")
    print("\nProduct type:", ", ".join(f"{k} {v}" for k, v in sorted(res["types"].items(), key=lambda x: -x[1])))
    print("\nMonth     raw  deduped-branded")
    for m, v in res["monthly"].items():
        print(f"  {m}  {v['raw']:>5}  {v['deduped_branded']:>5}")
    if res["zero_days"]:
        print(f"\nDays with zero submissions ({len(res['zero_days'])}): {', '.join(res['zero_days'])}")

    if a.json:
        with open(a.json, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=1)


if __name__ == "__main__":
    main()
