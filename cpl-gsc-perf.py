#!/usr/bin/env python3
"""
=============================================================================
 CLEANPROTEINLIST -- GOOGLE SEARCH PERFORMANCE PULL (Search Analytics API)
=============================================================================
 Step 3 of CPL-AUDIT-LOOP.md, without a pasted export. Read-only.

 Pulls Google Search Console performance data for the domain property and
 compares the latest 28 days of FINAL data against the 28 days before it:
   * site totals (clicks, impressions, CTR) + the last eight 28-day blocks
   * pages and queries with the biggest click changes
 Saves the raw rows to gsc_reports/perf-<today>.json (gitignored).

 Uses the same OAuth client/token as cpl-gsc-index.py (gsc_client.json,
 gsc_token.json, webmasters.readonly). Testing-mode refresh tokens expire
 after 7 days; when that happens the browser sign-in opens, same as the
 index checker.

 USAGE
   py cpl-gsc-perf.py            # summary + snapshot
   py cpl-gsc-perf.py --top 25   # longer page/query lists

 Google is ~10% of CPL's search clicks as of Nov 2026 -- read this next to
 the Bing Webmaster export (Rule 10), never instead of it.
=============================================================================
"""
import os
import sys
import json
import datetime
import importlib.util
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
_spec = importlib.util.spec_from_file_location(
    "cpl_gsc_index", os.path.join(HERE, "cpl-gsc-index.py"))
gsc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gsc)

REPORT_DIR = os.path.join(HERE, "gsc_reports")
TOP = int(sys.argv[sys.argv.index("--top") + 1]) if "--top" in sys.argv else 12


def query(token, site, start, end, dims, limit=25000):
    url = ("https://www.googleapis.com/webmasters/v3/sites/"
           + urllib.parse.quote(site, safe="") + "/searchAnalytics/query")
    rows, start_row = [], 0
    while True:
        r = gsc.api(url, token, {
            "startDate": str(start), "endDate": str(end), "dimensions": dims,
            "rowLimit": limit, "startRow": start_row, "dataState": "final",
        }).get("rows", [])
        rows += r
        if len(r) < limit:
            return rows
        start_row += limit


def short(u):
    return u.replace(f"https://{gsc.HOST}", "") or "/"


def compare(cur, prev, top, label, key=lambda k: k):
    c = {r["keys"][0]: r for r in cur}
    p = {r["keys"][0]: r for r in prev}
    rows = []
    for k in set(c) | set(p):
        a, b = p.get(k, {}), c.get(k, {})
        rows.append((b.get("clicks", 0) - a.get("clicks", 0), k,
                     a.get("clicks", 0), b.get("clicks", 0),
                     a.get("impressions", 0), b.get("impressions", 0),
                     a.get("position", 0), b.get("position", 0)))
    print(f"\n  {label} — by current clicks (prev -> cur | impressions | position)")
    for d, k, pc, cc, pi, ci, pp, cp in sorted(rows, key=lambda r: (-r[3], -r[5]))[:top]:
        print(f"    {pc:4.0f} -> {cc:4.0f} | {pi:5.0f} -> {ci:5.0f} | "
              f"{pp:5.1f} -> {cp:5.1f}  {key(k)[:70]}")
    movers = sorted(rows, key=lambda r: -abs(r[0]))[:top // 2]
    print(f"  {label} — biggest click changes")
    for d, k, pc, cc, pi, ci, pp, cp in movers:
        if d:
            print(f"    {d:+4.0f}  {key(k)[:70]}")


def main():
    token = gsc.get_access_token()
    site = gsc.find_property(token)
    today = datetime.date.today()

    daily = query(token, site, today - datetime.timedelta(days=480), today, ["date"])
    if not daily:
        print("\n  No performance rows returned.\n")
        sys.exit(1)
    by = {datetime.date.fromisoformat(r["keys"][0]): r for r in daily}
    last = max(by)
    cur = (last - datetime.timedelta(days=27), last)
    prev = (cur[0] - datetime.timedelta(days=28), cur[0] - datetime.timedelta(days=1))

    print("\n" + "=" * 74)
    print(f" GOOGLE SEARCH PERFORMANCE — {site}  (final data through {last})")
    print("=" * 74)
    print("\n  28-day blocks (newest first):")
    for n in range(8):
        e = last - datetime.timedelta(days=28 * n)
        s = e - datetime.timedelta(days=27)
        days = [by.get(s + datetime.timedelta(days=x), {}) for x in range(28)]
        c = sum(d.get("clicks", 0) for d in days)
        i = sum(d.get("impressions", 0) for d in days)
        print(f"    {s} -> {e}   clicks {c:5.0f}   impr {i:7.0f}   "
              f"ctr {100 * c / i if i else 0:5.2f}%")

    snap = {"site": site, "last": str(last), "cur": [str(x) for x in cur],
            "prev": [str(x) for x in prev], "daily": daily}
    for name, (a, b) in (("cur", cur), ("prev", prev)):
        for dim in ("page", "query", "country", "device"):
            snap[f"{name}_{dim}"] = query(token, site, a, b, [dim])

    compare(snap["cur_page"], snap["prev_page"], TOP, "PAGES", short)
    compare(snap["cur_query"], snap["prev_query"], TOP, "QUERIES")
    anon_c = sum(by[d]["clicks"] for d in by if cur[0] <= d <= cur[1]) - \
        sum(r["clicks"] for r in snap["cur_query"])
    print(f"\n  ({anon_c:.0f} of this window's clicks are on anonymized queries)")

    os.makedirs(REPORT_DIR, exist_ok=True)
    out = os.path.join(REPORT_DIR, f"perf-{today}.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(snap, f, indent=1)
    print(f"\n  Snapshot saved: {os.path.relpath(out, HERE)}\n")


if __name__ == "__main__":
    main()
