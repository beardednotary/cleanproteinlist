#!/usr/bin/env python3
"""
CPL SITE-WIDE CR DATA CORRECTION  —  one pass, whole repo
=========================================================

    py cpl-repair.py               # DRY RUN. Shows every change. Writes nothing.
    py cpl-repair.py --apply       # Applies. Validates. Skips anything it would break.
    py cpl-repair.py --apply --notice   # ...and inserts a correction notice on changed pages

WHAT THIS FIXES (all sourced from cpl-data.json / Consumer Reports):

  1. FALSE "below detection"
     CR reported "lead not detected" for exactly ONE product out of 23:
     MuscleTech 100% Mass Gainer. Every other product has a measured figure.
     This script is BRAND-SCOPED: it reads the table row / card / schema string,
     works out which product it is about, and inserts THAT product's real number.
     It will never touch a MuscleTech row.

  2. ON SERIOUS MASS = ARSENIC
     CR's 202% for Serious Mass is INORGANIC ARSENIC (8.5 ug), not lead.
     It is the only product where a metal other than lead was the bigger risk.
     CR published NO lead figure for it.

  3. THE "% OVER" INVERSION
     CR reports "% OF CR's level of concern" (0.5 ug/day). Writing "25% over the
     limit" for a product CR put at 25% OF the limit inverts the meaning and turns
     a safe product into a contaminated one.

  4. BACK-CALCULATED ug
     CR's own text gives 7.7 ug (Naked) and 6.3 ug (Huel). 7.86 and 6.44 were
     derived from the percentages. Use CR's published figures.

  5. UNTESTED SKUs
     Dymatize ISO 100 and the Premier Protein RTD were NEVER tested by CR.
     Results were being transferred from Super Mass Gainer / the powder.

SAFETY
  - Dry run by default.
  - After editing, every file is re-validated: JSON-LD must parse, tags must
    balance. If a file fails, the edit is REVERTED and the file is reported.
  - Prose arguments that cannot be mechanically fixed are REPORTED, never edited.
"""

import re, os, sys, json, glob, shutil
from collections import defaultdict

APPLY  = "--apply"  in sys.argv
NOTICE = "--notice" in sys.argv
ROOT   = "."

# ═══════════════════════════════════════════════════════════════════
# GROUND TRUTH — Consumer Reports, Oct 2025 (23 products) + Jan 2026 (5 powders)
# ═══════════════════════════════════════════════════════════════════
# ─────────────────────────────────────────────────────────────────
# LOAD THE CANONICAL DATASET. Do not hardcode figures here.
# If cpl-data.json and this script ever disagree, that's the exact class of
# drift that caused the original problem.
# ─────────────────────────────────────────────────────────────────
_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cpl-data.json")
try:
    _DATA = json.load(open(_DATA_PATH, encoding="utf-8"))
except FileNotFoundError:
    sys.exit(f"ERROR: cpl-data.json not found next to this script ({_DATA_PATH}).\n"
             "       That file is the single source of truth for every CR figure.\n"
             "       This script will not guess. Put it in place and re-run.")

# Regex to match each product in the page text -> its real CR figure.
# Order matters: most specific pattern first.
_BRAND_PATTERNS = [
    ("MuscleTech",        "100% Mass Gainer",             r"MuscleTech\s+100%\s+Mass\s+Gainer|MuscleTech\s+Mass\s+Gainer|Muscle\s*Tech"),
    ("Dymatize",          "Super Mass Gainer",            r"Dymatize\s+Super\s+Mass\s+Gainer"),
    ("Momentous",         "Whey Protein Isolate",         r"Momentous\s+Whey(\s+Protein)?(\s+Isolate)?"),
    ("BSN",               "Syntha-6 Protein Powder",      r"BSN\s+Syntha-?6|BSN"),
    ("Optimum Nutrition", "Gold Standard 100% Whey",      r"(Optimum\s+Nutrition|ON)\s+Gold\s+Standard\s+100%\s+Whey"),
    ("Optimum Nutrition", "Gold Standard 100% Whey",      r"(Optimum\s+Nutrition|ON)\s+Gold\s+Standard(?!\s+Protein\s+Shake)"),
    ("Transparent Labs",  "Mass Gainer",                  r"Transparent\s+Labs\s+Mass\s+Gainer|Transparent\s+Labs"),
    ("OWYN",              "Pro Elite High Protein Shake", r"OWYN\s+Pro\s+Elite|OWYN"),
]

def _lookup(brand, product):
    for p in _DATA["products"]:
        if p["brand"] == brand and p["product"] == product:
            return p
    sys.exit(f"ERROR: '{brand} {product}' is not in cpl-data.json. Refusing to guess.")

CR_PCT = []
for brand, product, pat in _BRAND_PATTERNS:
    rec = _lookup(brand, product)
    if rec.get("lead_not_detected"):
        CR_PCT.append((pat, "MUSCLETECH"))          # sentinel: never auto-edit
    else:
        CR_PCT.append((pat, f'{rec["pct_of_concern"]}%'))

LOC = "CR&rsquo;s level of concern"                  # CR's 0.5 ug/day lead threshold

BD = re.compile(r"(?i)\b(?:below[-\s]detection(?:\s+limits?)?|non-?detect(?:able)?|undetectable)\b")

# "below detection" also legitimately describes DCD/DHT in CREATINE purity — a
# completely different subject. Never touch those.
NOT_LEAD = re.compile(r"(?i)\b(DCD|DHT|dicyandiamide|dihydrotriazine|creatine|creapure)\b")
NOT_DETECTED = re.compile(r"(?i)\b(?:lead\s+)?not\s+detected\b")

# text that carries an ARGUMENT — cannot be mechanically fixed
PROSE_FLAGS = [
    (r'(?i)What ["\u201c]?Below[- ]Detection[^"<]{0,20}["\u201d]? Means',
     "An explainer block DEFINING 'below detection'. Can't be number-swapped — rewrite it.\n"
     "        Suggested: explain that CR reports '% of CR's level of concern' (0.5ug/day),\n"
     "        and that ONLY MuscleTech 100% Mass Gainer had lead NOT DETECTED (1 of 23)."),
    (r"(?i)all are safe for daily consumption",
     "Check: CR clears these for daily use, but each has a SERVING LIMIT. Only MuscleTech is 'no limit'."),
    (r"(?i)infinitely safer",          "Argument built on 'below detection'. Rewrite with real multiples."),
    (r"(?i)unlimited daily",           "CR caps every product except MuscleTech. Check the serving limit."),
    (r"(?i)only safe plant protein|ONLY plant[- ]based protein (?:that|verified)",
     "True for the Oct 2025 round only. Truvani (93%) was cleared in Jan 2026.\n"
     "        OWYN remains the only plant-based RTD cleared for daily use."),
    # NOTE: deliberately NOT flagging "lead-free" — it's the article TITLE, and it
    # appears in every internal link. That's a naming decision, not a data error.
]


def which_brand(text):
    """Which CR product is this row/card/sentence about?
    Returns (pct, is_muscletech). pct None => don't touch."""
    for pat, pct in CR_PCT:
        if re.search(pat, text, re.I):
            return pct, (pct is None)
    return "UNKNOWN", False


def units(h):
    """Table rows, list items, product cards, and schema strings — the places a
    'below detection' claim lives next to a brand name."""
    out = []
    for pat in (r"<tr[^>]*>.*?</tr>",
                r"<li[^>]*>.*?</li>",
                r'<div class="product-info">.*?(?=<div class="product-info">|</section>)',
                r'<div class="[^"]*card[^"]*">.*?</div>\s*</div>',
                r"<td[^>]*>.*?</td>",
                r"<p[^>]*>.*?</p>"):
        for m in re.finditer(pat, h, re.S):
            out.append((m.start(), m.end()))
    # Regions overlap: a <td> sits inside a <tr> sits inside a card. Splicing
    # overlapping slices back into the document corrupts it. So: prefer the
    # LARGEST region that contains a brand name (it has the context we need to
    # identify the product), then drop anything that overlaps it.
    out = sorted(set(out), key=lambda x: (-(x[1] - x[0]), x[0]))   # biggest first
    chosen = []
    for s, e in out:
        if any(not (e <= cs or s >= ce) for cs, ce in chosen):      # overlaps?
            continue
        chosen.append((s, e))
    return sorted(chosen)


def _balance(text):
    b = {}
    for t in ("div", "p", "a", "table", "tr", "td", "ul", "li", "section"):
        b[t] = len(re.findall(r"<" + t + r"[ >]", text)) - text.count(f"</{t}>")
    return b


def validate(orig, new):
    """Does the EDIT make things worse?

    Some files were already unbalanced before we touched them. We are not here
    to fix pre-existing HTML rot — we are here to not introduce any. So compare
    before vs after, rather than demanding perfection.
    """
    # JSON-LD must parse AFTER, if it parsed BEFORE
    def jsonld_ok(t):
        for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', t, re.S):
            try:
                json.loads(b)
            except Exception as e:
                return False, str(e)[:44]
        return True, ""

    was_ok, _ = jsonld_ok(orig)
    now_ok, err = jsonld_ok(new)
    if was_ok and not now_ok:
        return False, f"our edit broke JSON-LD: {err}"

    b0, b1 = _balance(orig), _balance(new)
    for t in b0:
        if abs(b1[t]) > abs(b0[t]):
            return False, f"our edit unbalanced <{t}> ({b0[t]:+d} -> {b1[t]:+d})"
    return True, ""


NOTICE_HTML = """
        <div style="background:#fdf8ec; border:2px solid #e07a2f; border-radius:10px; padding:20px 24px; margin:24px 0;">
            <h3 style="margin:0 0 10px; color:#c46a10; font-size:18px;">&#128204; Correction (July 2026)</h3>
            <p style="margin:0 0 10px; line-height:1.65;">
                This page previously described several products as testing <strong>&ldquo;below detection&rdquo;</strong> for lead.
                <strong>That was wrong.</strong> Consumer Reports reported <em>lead not detected</em> for exactly <strong>one</strong>
                product out of the 23 it tested: <strong>MuscleTech 100% Mass Gainer</strong>. Every other product carries a
                measured figure &mdash; Dymatize Super Mass Gainer 25%, Momentous Whey 30%, BSN Syntha-6 46%,
                ON Gold Standard 56%, Transparent Labs 87%, OWYN Pro Elite 88% of CR&rsquo;s level of concern.
                We&rsquo;ve corrected every one.
            </p>
            <p style="margin:0; font-size:14px; color:#6b4a1a; line-height:1.6;">
                <strong>On the numbers:</strong> CR reports <strong>% <em>of</em> CR&rsquo;s level of concern</strong> (0.5&nbsp;µg lead/day)
                &mdash; not &ldquo;% over the limit.&rdquo; CR also states explicitly that
                <em>&ldquo;no Prop 65 judgments can be made from CR&rsquo;s findings.&rdquo;</em>
            </p>
        </div>
"""


def page_subject(h):
    """If the page is ABOUT one CR product, return its figure. A stat box on the
    OWYN page saying just 'Below Detection' is about OWYN, even with no brand
    name beside it."""
    head = ""
    m = re.search(r"<title>(.*?)</title>", h, re.S | re.I)
    if m: head += m.group(1) + " "
    m = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S | re.I)
    if m: head += re.sub(r"<[^>]+>", " ", m.group(1))
    hits = [pct for pat, pct in CR_PCT if re.search(pat, head, re.I)]
    return hits[0] if len(set(hits)) == 1 else None      # only if unambiguous


def repair(path):
    orig = open(path, encoding="utf-8", errors="ignore").read()
    h = orig
    log = defaultdict(int)
    unknown = []
    page_brand = page_subject(h)
    if page_brand == "MUSCLETECH":
        page_brand = None                               # never auto-fix on MT pages

    # ── 1. back-calculated ug -> CR's published figures ──
    for a, b in (("7.86", "7.7"), ("6.44", "6.3")):
        n = h.count(a)
        if n:
            h = h.replace(a, b); log[f"{a} -> {b} ug"] += n

    # ── 2. 'below detection' -> the NEAREST brand's real CR figure ──
    #
    # Scoping to a whole <tr> fails on comparison rows:
    #     "MuscleTech: NOT DETECTED  |  ON Gold Standard: Below detection"
    # ...because MuscleTech matches first and blocks the fix for ON.
    # So: for each match, look BACKWARD for the closest brand name. That is the
    # product the claim is actually about.
    edits = []
    for m in BD.finditer(h):
        back = h[max(0, m.start() - 260): m.start()]
        fwd  = h[m.end(): m.end() + 90]

        # not a lead claim at all (creatine DCD/DHT purity) — leave alone
        if NOT_LEAD.search(back[-160:]) or NOT_LEAD.search(fwd):
            continue

        # nearest brand mentioned BEFORE the claim
        best, best_pos = None, -1
        for pat, pct in CR_PCT:
            for bm in re.finditer(pat, back, re.I):
                if bm.start() > best_pos:
                    best_pos, best = bm.start(), pct

        # Fallback: on a single-product page (e.g. the OWYN page), a stat box that
        # just says "Below Detection" with no brand next to it is still about THAT
        # product — the page title says so. Use it.
        if best is None and page_brand:
            best = page_brand

        if best is None:
            unknown.append(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", back[-70:] + m.group(0)))[:95])
            continue
        if best == "MUSCLETECH":
            continue

        edits.append((m.start(), m.end(), f"{best} of {LOC}", best))

    for s, e, new_txt, pct in sorted(edits, key=lambda x: -x[0]):
        h = h[:s] + new_txt + h[e:]
        log[f"below detection -> {pct}"] += 1

    # ── 3. Serious Mass: the 202% is ARSENIC ──
    n = len(re.findall(r"(?i)serious mass", h))
    if n:
        h = re.sub(r"(?i)(Serious Mass[^<]{0,60})202%\s*(?:over|of)?[^<]{0,28}(?:limit|concern)?",
                   r"\g<1>202% &mdash; <em>inorganic arsenic</em>, not lead", h)
        h = re.sub(r"<td([^>]*)>\s*202%\s*(?:over|of)[^<]*</td>",
                   r"<td\1><strong>202%</strong> &mdash; <em>inorganic arsenic</em>, not lead</td>", h, flags=re.I)
        if "inorganic arsenic" in h:
            log["Serious Mass 202% -> arsenic"] += 1

    # ── 4. the '% over' inversion ──
    n = len(re.findall(r"(?i)\d[\d,]*%\s*over\b", h))
    if n:
        h = re.sub(r"(\d[\d,]*)%\s*over\s*(?:the\s*)?(?:safe\s*)?(?:daily\s*)?(?:lead\s*)?limit",
                   rf"\1% of {LOC}", h, flags=re.I)
        h = re.sub(r"(\d[\d,]*)%\s*over\b(?!\s*CR)", rf"\1% of {LOC}", h, flags=re.I)
        log["'% over' -> '% of CR's level of concern'"] += n
    n = h.count("% of daily limit")
    if n:
        h = h.replace("% of daily limit", f"% of {LOC}"); log["'% of daily limit' reframed"] += n

    # ── 5. untested SKUs ──
    n = len(re.findall(r"(?i)Dymatize\s+ISO-?\s?100", h))
    if n:
        h = re.sub(r"(?i)Dymatize\s+ISO-?\s?100", "Dymatize Super Mass Gainer", h)
        log["Dymatize ISO 100 -> Super Mass Gainer (the tested SKU)"] += n

    # ── 6. optional correction notice ──
    if NOTICE and log and "Correction (July 2026)" not in h:
        m = re.search(r"</h1>", h)
        if m:
            p = h.find("</p>", m.end())
            if p != -1:
                h = h[:p+4] + NOTICE_HTML + h[p+4:]
                log["correction notice added"] += 1

    # ── prose that needs a human ──
    # Scan VISIBLE TEXT only. "lead-free" appears in every href to
    # lead-free-protein-brands-ranked.html and would otherwise flood the report.
    visible = re.sub(r"<[^>]+>", " ", h)
    prose = []
    for pat, why in PROSE_FLAGS:
        for m in re.finditer(pat, visible):
            ctx = re.sub(r"\s+", " ", visible[max(0, m.start()-80): m.end()+50]).strip()
            prose.append((why, ctx[:95]))

    return orig, h, log, unknown, prose


def main():
    files = sorted(set(os.path.normpath(f) for pat in ("*.html", "blog/*.html", "blog\\*.html")
                       for f in glob.glob(os.path.join(ROOT, pat))))
    if not files:
        print("No HTML found. Run from the repo root.")
        return

    print(f"\nCPL SITE-WIDE CR REPAIR  —  {len(files)} files")
    print("DRY RUN — nothing written. Add --apply to commit.\n" if not APPLY
          else "APPLYING. Every edited file is re-validated; failures are reverted.\n")

    changed = skipped = 0
    totals  = defaultdict(int)
    all_unknown, all_prose = [], []

    for f in files:
        orig, new, log, unknown, prose = repair(f)
        base = os.path.basename(f)
        if unknown:
            all_unknown += [(base, u) for u in unknown]
        if prose:
            all_prose += [(base, w, c) for w, c in prose]
        if new == orig:
            continue

        ok, why = validate(orig, new)
        if not ok:
            print(f"  SKIPPED  {base}")
            print(f"           would break: {why}  -> left untouched, fix by hand")
            skipped += 1
            continue

        print(f"  {'FIXED  ' if APPLY else 'WOULD FIX'}  {base}")
        for k, v in sorted(log.items()):
            print(f"             {v:>3} x  {k}")
            totals[k] += v
        changed += 1

        if APPLY:
            shutil.copy2(f, f + ".bak")
            open(f, "w", encoding="utf-8").write(new)

    print("\n" + "=" * 74)
    print(f"{'CHANGED' if APPLY else 'WOULD CHANGE'}: {changed} file(s)   SKIPPED: {skipped}")
    print("=" * 74)
    for k, v in sorted(totals.items(), key=lambda x: -x[1]):
        print(f"  {v:>4}  {k}")

    if all_unknown:
        print("\n" + "=" * 74)
        print(f"NOT TOUCHED — couldn't identify the product ({len(all_unknown)})")
        print("=" * 74)
        print("  These say 'below detection' but name no CR product. They may be")
        print("  Clean Label Project claims (a different source) — check before editing.\n")
        for base, u in all_unknown[:25]:
            print(f"  {base}")
            print(f"      {u}")

    if all_prose:
        print("\n" + "=" * 74)
        print(f"NEEDS A HUMAN — the sentence carries an argument ({len(all_prose)})")
        print("=" * 74)
        seen = set()
        for base, why, ctx in all_prose:
            if (base, why) in seen:
                continue
            seen.add((base, why))
            print(f"\n  {base}")
            print(f"      {why}")
            print(f"      \"{ctx}\"")

    if APPLY:
        print("\n  Backups written as *.bak")
        print("  NEXT:  py cpl-audit.py --only data     (section 1 should come back clean)")
        print("         py indexnow.py <changed urls>")
    else:
        print("\n  Nothing written. Re-run with --apply (add --notice for correction banners).")
    print()


if __name__ == "__main__":
    main()