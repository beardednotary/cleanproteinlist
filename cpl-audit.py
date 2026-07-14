#!/usr/bin/env python3
"""
CPL SITE AUDIT
==============
Scans the whole repo and reports problems that are invisible by eye.

Usage (from repo root):
    py cpl-audit.py
    py cpl-audit.py --only data      # just the data-consistency check
    py cpl-audit.py --only schema
    py cpl-audit.py --only links
    py cpl-audit.py --csv            # also write cpl-audit-report.csv

Checks:
  1. DATA CONSISTENCY  - same brand, different lead figures across pages  <-- the important one
  2. SCHEMA            - invalid JSON-LD, missing FAQPage, missing Article
  3. LINKS             - placeholder/dead affiliate links, malformed URLs
  4. STRUCTURE         - unbalanced tags
  5. MONETIZATION      - pages with zero affiliate links
"""

import re, os, sys, json, glob, csv
from collections import defaultdict

ROOT = "."
AFFILIATE_TAG = "beardednotary-20"

# ── brands to track for numeric consistency ─────────────────────────────
# add any brand whose lead figure appears on more than one page
BRANDS = [
    "Garden of Life", "Jocko Fuel", "Jocko", "Naked Nutrition", "Huel",
    "Momentous", "Orgain", "Vega", "OWYN", "Optimum Nutrition", "Dymatize",
    "MuscleTech", "Transparent Labs", "Quest", "Ritual", "Truvani",
    "Body Fortress", "BSN", "Ghost", "Isopure", "Premier Protein",
    "Ensure", "Muscle Milk", "Core Power", "Fairlife", "Bob's Red Mill",
]

# figures we care about: "2.82 µg", "564% over", "1,572% of daily limit"
UG   = re.compile(r"(?<![$\d.,])(\d+\.\d+)\s*(?:µg|mcg|ug)\b(?!\s*/?\s*(?:yr|year|per year))", re.I)
PCT  = re.compile(r"([\d,]+)\s*%\s*(?:over|of|above)", re.I)


def strip_tags(s):
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s)


def html_files():
    out = []
    for pat in ("*.html", "blog/*.html", "blog\\*.html"):
        out += glob.glob(os.path.join(ROOT, pat))
    return sorted(set(os.path.normpath(f) for f in out))


# ═══════════════════════════════════════════════════════════════════
# 1. DATA CONSISTENCY  — the check that protects the brand
# ═══════════════════════════════════════════════════════════════════
def _cells(row):
    return [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", c)).strip()
            for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row, re.S)]


def check_data(files):
    """Extract brand -> figure pairs from the SAME table row (or the same <li>).
    A character window bleeds into neighbouring rows and produces garbage, so
    we only ever compare a brand to a number that sits in its own row."""
    found = defaultdict(lambda: defaultdict(set))   # brand -> figure -> {(file, context)}

    for f in files:
        try:
            h = open(f, encoding="utf-8", errors="ignore").read()
        except Exception:
            continue
        base = os.path.basename(f)

        # strip machine content first — JSON-LD, JS and CSS contain numbers
        # that are not lead figures and will poison the comparison
        h = re.sub(r"<script.*?</script>", " ", h, flags=re.S)
        h = re.sub(r"<style.*?</style>", " ", h, flags=re.S)
        h = re.sub(r"<head>.*?</head>", " ", h, flags=re.S)

        units = []   # (brand, figure, context)

        # --- table rows: brand and figure must share a row ---
        for row in re.findall(r"<tr[^>]*>(.*?)</tr>", h, re.S):
            cells = _cells(row)
            if len(cells) < 2:
                continue
            text = " | ".join(cells)
            # comparison rows name two brands; a figure can't be attributed safely
            if sum(1 for b in BRANDS if re.search(re.escape(b), text, re.I)) > 1:
                continue
            for brand in BRANDS:
                # brand must appear in one of the first two cells (the label cells)
                if not any(re.search(re.escape(brand), c, re.I) for c in cells[:2]):
                    continue
                for c in cells:
                    for ug in UG.findall(c):
                        units.append((brand, f"{float(ug):.2f} ug", text[:90]))
                    for pct in PCT.findall(c):
                        units.append((brand, f"{pct}%", text[:90]))

        # --- list items: brand and figure must share one <li> ---
        for li in re.findall(r"<li[^>]*>(.*?)</li>", h, re.S):
            t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", li)).strip()
            if sum(1 for b in BRANDS if re.search(re.escape(b), t, re.I)) > 1:
                continue
            for brand in BRANDS:
                if not re.search(re.escape(brand), t, re.I):
                    continue
                for ug in UG.findall(t):
                    units.append((brand, f"{float(ug):.2f} ug", t[:90]))
                for pct in PCT.findall(t):
                    units.append((brand, f"{pct}%", t[:90]))

        for brand, fig, ctx in units:
            found[brand][fig].add((base, ctx))

    print("\n" + "=" * 74)
    print("1. DATA CONSISTENCY — same brand, conflicting figures?")
    print("=" * 74)

    conflicts = 0
    for brand in sorted(found):
        ugs = {k: v for k, v in found[brand].items() if k.endswith("ug")}
        if len(ugs) > 1:
            conflicts += 1
            print(f"\n  *** CONFLICT: {brand}")
            for val, entries in sorted(ugs.items()):
                print(f"        {val}")
                for base, ctx in sorted(entries)[:4]:
                    print(f"            {base}")
                    print(f"                \"{ctx}\"")

    if not conflicts:
        print("\n  No conflicts. Every brand states one consistent lead figure site-wide.")
    else:
        print(f"\n  >> {conflicts} brand(s) with conflicting figures.")
        print("     READ THE CONTEXT BEFORE FIXING. A 'conflict' is legitimate when the")
        print("     figures belong to DIFFERENT PRODUCTS from the same brand:")
        print("        Garden of Life WHEY  = non-detect   (safe)")
        print("        Garden of Life PLANT = 2.82 ug      (564% over)")
        print("     Those are two products. Do NOT merge them. That is the #1 rule.")
        print("     A real conflict is the SAME product with two different numbers.")
    return conflicts


# ═══════════════════════════════════════════════════════════════════
# 1b. RANK CONFLICTS — the check no unit convention can excuse
#
#     NOTE: do NOT bother checking "ug vs %" arithmetically. The site uses
#     BOTH "% OF limit" (ug/0.5*100) and "% OVER limit" (that minus 100),
#     so almost any pair can be made to look valid. That check produces
#     false confidence. Rank conflicts cannot be explained away.
# ═══════════════════════════════════════════════════════════════════
RANK = re.compile(r"#\s*(\d{1,2})\b(?!\s*(?:of|/))")

def check_ranks(files):
    print("\n" + "=" * 74)
    print("1b. RANK CONFLICTS — same brand, different Consumer Reports rank")
    print("=" * 74)

    seen = defaultdict(lambda: defaultdict(set))   # brand -> rank -> {(file, ctx)}

    for f in files:
        h = open(f, encoding="utf-8", errors="ignore").read()
        h = re.sub(r"<script.*?</script>", " ", h, flags=re.S)
        h = re.sub(r"<style.*?</style>", " ", h, flags=re.S)
        base = os.path.basename(f)

        units = re.findall(r"<tr[^>]*>(.*?)</tr>", h, re.S) + \
                re.findall(r"<li[^>]*>(.*?)</li>", h, re.S)

        for u in units:
            t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " | ", u)).strip()
            brands = [b for b in BRANDS if re.search(re.escape(b), t, re.I)]
            if len(brands) != 1:
                continue                      # ambiguous row
            for r in RANK.findall(t):
                r = int(r)
                if 1 <= r <= 30:
                    seen[brands[0]][r].add((base, t[:88]))

    conflicts = 0
    for brand in sorted(seen):
        if len(seen[brand]) > 1:
            conflicts += 1
            print(f"\n  *** {brand} — ranked differently on different pages:")
            for rank in sorted(seen[brand]):
                print(f"        #{rank}")
                for base, ctx in sorted(seen[brand][rank])[:3]:
                    print(f"            {base}")
                    print(f"                \"{ctx}\"")

    if not conflicts:
        print("\n  No rank conflicts.")
    else:
        print(f"\n  >> {conflicts} brand(s) with conflicting ranks.")
        print("     A rank conflict is legitimate ONLY if the two rows are different")
        print("     PRODUCTS (Premier Protein POWDER #11 vs Premier Protein RTD #6).")
        print("     If it's the same product, one page is wrong. Check Consumer Reports.")
    return conflicts


# ═══════════════════════════════════════════════════════════════════
# 2. SCHEMA
# ═══════════════════════════════════════════════════════════════════
def check_schema(files):
    print("\n" + "=" * 74)
    print("2. SCHEMA — invalid JSON-LD / missing FAQPage")
    print("=" * 74)

    bad_json, no_faq, no_article = [], [], []

    for f in files:
        h = open(f, encoding="utf-8", errors="ignore").read()
        blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
        types = set()
        for b in blocks:
            try:
                d = json.loads(b)
                t = d.get("@type")
                if t:
                    types.add(t)
            except Exception as e:
                bad_json.append((os.path.basename(f), str(e)[:58]))

        # visible FAQ but no FAQPage schema?
        has_visible_faq = bool(re.search(r"Frequently Asked|FAQ", h, re.I)) and \
                          len(re.findall(r"<h[34][^>]*>\s*(?:❓|Q:)?[^<]*\?", h)) >= 3
        if has_visible_faq and "FAQPage" not in types:
            no_faq.append(os.path.basename(f))

        if "blog" in f and "Article" not in types and "BlogPosting" not in types:
            no_article.append(os.path.basename(f))

    if bad_json:
        print(f"\n  *** {len(bad_json)} INVALID JSON-LD block(s) — silently discarded by Google/Bing:")
        for f, e in bad_json:
            print(f"        {f}")
            print(f"            {e}")
    else:
        print("\n  JSON-LD: all blocks parse.")

    if no_faq:
        print(f"\n  *** {len(no_faq)} page(s) with a visible FAQ but NO FAQPage schema")
        print("      (invisible to AI answer engines — your fastest-growing channel):")
        for f in no_faq:
            print(f"        {f}")

    if no_article:
        print(f"\n  {len(no_article)} blog page(s) with no Article schema:")
        for f in no_article[:12]:
            print(f"        {f}")
        if len(no_article) > 12:
            print(f"        ... +{len(no_article)-12} more")

    return len(bad_json) + len(no_faq)


# ═══════════════════════════════════════════════════════════════════
# 3. LINKS
# ═══════════════════════════════════════════════════════════════════
def check_links(files):
    print("\n" + "=" * 74)
    print("3. LINKS — dead affiliate links & malformed URLs")
    print("=" * 74)

    issues = 0
    PLACEHOLDER = re.compile(r"amzn\.to/[A-Z][A-Z\-]{5,}")     # amzn.to/THORNE-CREATINE
    MALFORMED   = re.compile(r'href="h{2,}ttp|href="ttp|href="htp')
    NOTAG       = re.compile(r'href="https://(?:www\.)?amazon\.com/[^"]*"')

    for f in files:
        h = open(f, encoding="utf-8", errors="ignore").read()
        b = os.path.basename(f)

        for m in PLACEHOLDER.findall(h):
            print(f"  *** DEAD placeholder link  {b}: {m}")
            issues += 1
        for m in MALFORMED.findall(h):
            print(f"  *** MALFORMED url          {b}: {m}")
            issues += 1
        for m in NOTAG.findall(h):
            if AFFILIATE_TAG not in m:
                print(f"  *** AMAZON LINK, NO TAG    {b}: {m[:64]}  <- earns $0")
                issues += 1

    if not issues:
        print("\n  No dead, malformed, or untagged affiliate links.")
    return issues


# ═══════════════════════════════════════════════════════════════════
# 4. STRUCTURE
# ═══════════════════════════════════════════════════════════════════
def check_structure(files):
    print("\n" + "=" * 74)
    print("4. STRUCTURE — unbalanced tags")
    print("=" * 74)
    issues = 0
    for f in files:
        h = open(f, encoding="utf-8", errors="ignore").read()
        bad = []
        for t in ("div", "a", "p", "table", "tr", "td", "section"):
            o = len(re.findall(r"<" + t + r"[ >]", h))
            c = len(re.findall(r"</" + t + r">", h))
            if o != c:
                bad.append(f"{t} {o}/{c}")
        if bad:
            print(f"  *** {os.path.basename(f)}: {', '.join(bad)}")
            issues += 1
    if not issues:
        print("\n  All tags balanced.")
    return issues


# ═══════════════════════════════════════════════════════════════════
# 5. MONETIZATION
# ═══════════════════════════════════════════════════════════════════
def check_money(files):
    print("\n" + "=" * 74)
    print("5. MONETIZATION — blog pages with zero affiliate links")
    print("=" * 74)
    zero = []
    for f in files:
        if "blog" not in f:
            continue
        h = open(f, encoding="utf-8", errors="ignore").read()
        n = h.count(AFFILIATE_TAG) + len(re.findall(r"amzn\.to/", h))
        if n == 0:
            zero.append(os.path.basename(f))
    if zero:
        print(f"\n  {len(zero)} blog page(s) earning nothing:")
        for f in zero:
            print(f"        {f}")
        print("\n  (Some of these are correct — e.g. pages about products we won't")
        print("   recommend. Check before adding links.)")
    else:
        print("\n  Every blog page has at least one affiliate link.")
    return len(zero)


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]

    files = html_files()
    if not files:
        print("No HTML files found. Run this from the repo root.")
        return

    print(f"\nCPL SITE AUDIT  —  {len(files)} HTML files\n")

    total = 0
    if only in (None, "data"):      total += check_data(files)
    if only in (None, "data"):      total += check_ranks(files)
    if only in (None, "schema"):    total += check_schema(files)
    if only in (None, "links"):     total += check_links(files)
    if only in (None, "structure"): total += check_structure(files)
    if only in (None, "money"):     check_money(files)

    print("\n" + "=" * 74)
    print(f"TOTAL ISSUES NEEDING A DECISION: {total}")
    print("=" * 74)
    print("\nPriority order:")
    print("  1. DATA conflicts   - a page contradicting another page. Fix first.")
    print("  2. Dead/untagged links - traffic you already paid for, earning $0.")
    print("  3. Invalid JSON-LD  - schema silently discarded by Google & Bing.")
    print("  4. Missing FAQPage  - invisible to AI answer engines.")
    print()


if __name__ == "__main__":
    main()