#!/usr/bin/env python3
"""Pull California Prop 65 60-day notices for protein products into data/prop65.json.

Source: California Attorney General's public 60-Day Notice Search
(https://oag.ca.gov/prop65/60-day-notice-search). A 60-day notice is an
*allegation* by a private enforcer that a product needs a Prop 65 warning.
It is not a lab result, a recall, or a finding by the state.

Politeness: oag.ca.gov/robots.txt sets Crawl-delay: 10, so every request
waits DELAY seconds. A full backfill since 2025 is ~7 requests per term.

Usage:
  python3 scripts/prop65_scrape.py                 # refresh the last 120 days
  python3 scripts/prop65_scrape.py --since 2025-01-01   # backfill
Stdlib only, so it runs in GitHub Actions without installs.
"""
import argparse
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "prop65.json"
BASE = "https://oag.ca.gov/prop65/60-day-notice-search-results"
USER_AGENT = "CleanProteinList-Prop65-Tracker/1.0 (+https://cleanproteinlist.com/prop65/)"
DELAY = 10  # seconds, per robots.txt Crawl-delay
PER_PAGE = 100
REFRESH_DAYS = 120  # re-read recent notices so settlements/withdrawals update

# Product-text search terms. Each notice is kept once even if several terms match.
TERMS = ["protein"]


def fetch(term: str, since: dt.date, until: dt.date, page: int) -> str:
    params = {
        "field_prop65_product_value": term,
        "date_filter[min][date]": since.strftime("%m/%d/%Y"),
        "date_filter[max][date]": until.strftime("%m/%d/%Y"),
        "sort_by": "field_prop65_date_value",
        "items_per_page": str(PER_PAGE),
        "page": str(page),
    }
    url = BASE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def text(fragment: str) -> str:
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(fragment)).strip()


def field(row: str, label: str) -> str:
    m = re.search(
        r'<div class="[^"]*details[^"]*">\s*' + re.escape(label) + r':\s*</div>\s*<div[^>]*>(.*?)</div>\s*</div>',
        row,
        re.S,
    )
    return text(m.group(1)) if m else ""


def parse(page_html: str) -> tuple[list[dict], int]:
    total_m = re.search(r"Showing \d+ to \d+ of (\d+) Notices", page_html)
    total = int(total_m.group(1)) if total_m else 0
    rows = re.split(r'<div class="views-row ', page_html)[1:]
    out = []
    for row in rows:
        ag = re.search(r"AG Number (\d{4}-\d{5})", row)
        if not ag:
            continue
        date_m = re.search(r'content="(\d{4}-\d{2}-\d{2})T', row)
        counts = {
            k: int(v)
            for k, v in re.findall(r"(Complaint|Settlements?|Judgment)\s*\((\d+)\)", text(row))
        }
        flags = [
            text(m)
            for m in re.findall(r'views-conditional(?:-1)?">\s*<span class="field-content">(.*?)</span>', row, re.S)
            if text(m)
        ]
        out.append(
            {
                "ag": ag.group(1),
                "date": date_m.group(1) if date_m else "",
                "noticing_party": field(row, "Noticing Party"),
                "violators": field(row, "Alleged Violators"),
                "chemicals": [c.strip() for c in re.split(r",\s*(?=[A-Z])", field(row, "Chemical")) if c.strip()],
                "source": field(row, "Source"),
                "comments": field(row, "Comments"),
                "complaints": counts.get("Complaint", 0),
                "settlements": counts.get("Settlement", counts.get("Settlements", 0)),
                "judgments": counts.get("Judgment", 0),
                "flags": flags,
                "url": f"https://oag.ca.gov/prop65/60-Day-Notice-{ag.group(1)}",
                "pdf": f"https://oag.ca.gov/system/files/prop65/notices/{ag.group(1)}.pdf",
            }
        )
    return out, total


def merge(existing: dict, fresh: list[dict]) -> int:
    """Upsert by AG number; the AG lists a notice once per chemical, so union those."""
    added = 0
    for n in fresh:
        old = existing.get(n["ag"])
        if old is None:
            existing[n["ag"]] = n
            added += 1
            continue
        chems = old["chemicals"] + [c for c in n["chemicals"] if c not in old["chemicals"]]
        old.update(n)
        old["chemicals"] = chems
    return added


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--since", help="YYYY-MM-DD (default: last %d days)" % REFRESH_DAYS)
    args = ap.parse_args()

    store = json.loads(DATA.read_text()) if DATA.exists() else {"notices": {}}
    notices = store["notices"]
    until = dt.date.today()
    since = (
        dt.date.fromisoformat(args.since)
        if args.since
        else until - dt.timedelta(days=REFRESH_DAYS)
    )

    first = True
    added = 0
    for term in TERMS:
        page, seen, total = 0, 0, None
        while total is None or seen < total:
            if not first:
                time.sleep(DELAY)
            first = False
            rows, total = parse(fetch(term, since, until, page))
            print(f"{term!r} page {page}: {len(rows)} rows (total {total})", file=sys.stderr)
            if not rows:
                break
            added += merge(notices, rows)
            seen += len(rows)
            page += 1

    store["updated"] = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    store["source"] = "California Attorney General, Prop 65 60-Day Notice Search"
    store["terms"] = TERMS
    DATA.parent.mkdir(exist_ok=True)
    DATA.write_text(json.dumps(store, indent=1, sort_keys=True) + "\n")
    print(f"{added} new notices; {len(notices)} total", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
