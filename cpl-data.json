#!/usr/bin/env python3
"""
CPL DATA CORRECTION
===================
Fixes CR figures against cpl-data.json (the canonical dataset).

    py cpl-fix-data.py                 # DRY RUN — shows everything, changes nothing
    py cpl-fix-data.py --apply         # applies ONLY the safe mechanical fixes
    py cpl-fix-data.py --worklist      # writes cpl-worklist.md — the prose you must rewrite

DESIGN PRINCIPLE
----------------
This script will NOT touch anything it cannot fix with certainty.

  SAFE   = an unambiguous number swap (7.86 ug -> 7.7 ug). Scripted.
  UNSAFE = anything where the surrounding SENTENCE carries an argument.
           Reported with file + line, never auto-edited.

Why: "below detection" appears 264 times. It is CORRECT for MuscleTech (the only
product CR reported as not detected) and WRONG for OWYN / ON Gold Standard /
Momentous Whey. A blind replace would break the one true instance and would leave
behind sentences like "OWYN is infinitely safer" that are simply false at 88%.
An argument cannot be find-and-replaced. It has to be rewritten.
"""

import re, os, sys, json, glob

ROOT = "."
DATA = json.load(open("cpl-data.json", encoding="utf-8"))
BY_KEY = {(p["brand"], p["product"]): p for p in DATA["products"]}


# ─────────────────────────────────────────────────────────────
# SAFE: unambiguous number swaps. CR published these in article text.
# ─────────────────────────────────────────────────────────────
SAFE = [
    (r"7\.86\s*(µg|mcg|ug)", "7.7 µg",
     "Naked Nutrition: CR's text says 7.7 µg. 7.86 was back-calculated from 1,572%."),
    (r"6\.44\s*(µg|mcg|ug)", "6.3 µg",
     "Huel: CR's text says 6.3 µg. 6.44 was back-calculated from 1,288%."),
]


# ─────────────────────────────────────────────────────────────
# UNSAFE: report only. Each needs a human to rewrite the sentence.
# ─────────────────────────────────────────────────────────────
UNSAFE = [
    ("FALSE 'below detection' — OWYN",
     r"owyn[^.<]{0,120}?(below detection|non-detect|not detected)|"
     r"(below detection|non-detect|not detected)[^.<]{0,60}?owyn",
     "CR found OWYN Pro Elite at 88% of its level of concern. NOT below detection. "
     "It is still the cleanest plant product tested and cleared for daily use — but it is not lead-free."),

    ("FALSE 'below detection' — ON Gold Standard 100% Whey",
     r"gold standard[^.<]{0,120}?(below detection|non-detect|not detected)|"
     r"(below detection|non-detect|not detected)[^.<]{0,60}?gold standard",
     "CR found ON Gold Standard 100% Whey at 56%. NOT below detection. "
     "Still 'better for daily use' (1.75 servings/day) — but it is not lead-free."),

    ("FALSE 'below detection' — Momentous Whey Isolate",
     r"momentous[^.<]{0,120}?(below detection|non-detect|not detected)|"
     r"(below detection|non-detect|not detected)[^.<]{0,60}?momentous",
     "CR found Momentous Whey Isolate at 30%. NOT below detection."),

    ("COLLAPSED ARGUMENT — 'infinitely safer'",
     r"infinitely safer",
     "This phrase depends on OWYN being below detection. At 88% vs Orgain's 143%, "
     "OWYN is ~1.6x cleaner, not infinitely. THE ARGUMENT MUST BE REWRITTEN, not patched."),

    ("WRONG METAL — ON Serious Mass 202% is ARSENIC",
     r"serious mass",
     "CR: 'This recommendation is based on the 8.5 mcg of INORGANIC ARSENIC found in this "
     "product... the only product where another heavy metal posed a comparatively higher risk "
     "than lead.' The 202% is ARSENIC. Do not present it as a lead figure."),

    ("WRONG FIGURE — Quest Protein Shake",
     r"quest[^.<]{0,80}?(130\s*%|0\.65\s*µg)",
     "CR says Quest Protein Shake = 161% of level of concern. Not 130% / 0.65 µg."),

    ("WRONG FIGURE — Muscle Milk Pro Advanced",
     r"muscle milk[^.<]{0,80}?(0\.51|2\s*%\s*over)",
     "CR says Muscle Milk Pro Advanced = 128%. Not 0.51 µg / 2% over."),

    ("WRONG FIGURE — Ensure Plant-Based",
     r"ensure plant[^.<]{0,80}?(0\.57|14\s*%)",
     "CR says Ensure Plant-Based = 132% (≈0.66 µg). Not 0.57 µg / 14%."),

    ("UNSOURCED — Premier Protein RTD",
     r"premier protein[^.<]{0,100}?(rtd|shake|11\s*oz|0\.59|3\.32)",
     "CR NEVER TESTED the Premier Protein RTD. Not in October (23 products), not in January "
     "(powders only — 'no premade shakes'). The ONLY real figure is the POWDER: 0.38 µg / 77%. "
     "Remove every CR attribution to the RTD."),

    ("SOURCING ERROR — Prop 65 framing",
     r"(%\s*(?:over|of)\s*(?:the\s*)?(?:safe\s*|daily\s*)?(?:prop\s*65\s*)?limit|prop\s*65\s*(?:daily\s*)?limit)",
     "CR states explicitly: 'no Prop 65 judgments can be made from CR's findings.' "
     "CR reports '% of CR's LEVEL OF CONCERN' (0.5 µg/day). Reframe accordingly."),
]


def html_files():
    out = []
    for pat in ("*.html", "blog/*.html", "blog\\*.html"):
        out += glob.glob(os.path.join(ROOT, pat))
    return sorted(set(os.path.normpath(f) for f in out))


def line_of(h, i):
    return h[:i].count("\n") + 1


def context(h, i, j, width=70):
    s = re.sub(r"<[^>]+>", " ", h[max(0, i - width): j + width])
    return re.sub(r"\s+", " ", s).strip()


def main():
    apply_fixes = "--apply" in sys.argv
    worklist    = "--worklist" in sys.argv

    files = html_files()
    if not files:
        print("No HTML found. Run from the repo root.")
        return

    print(f"\nCPL DATA CORRECTION — {len(files)} files")
    print("DRY RUN (nothing changed). Use --apply for the safe fixes.\n" if not apply_fixes
          else "APPLYING SAFE FIXES.\n")

    # ── SAFE ──
    print("=" * 78)
    print("SAFE — unambiguous number swaps")
    print("=" * 78)
    total_safe = 0
    for pat, repl, why in SAFE:
        hits = []
        for f in files:
            h = open(f, encoding="utf-8", errors="ignore").read()
            n = len(re.findall(pat, h, re.I))
            if n:
                hits.append((f, n))
                if apply_fixes:
                    h = re.sub(pat, repl, h, flags=re.I)
                    open(f, "w", encoding="utf-8").write(h)
        if hits:
            n = sum(x[1] for x in hits)
            total_safe += n
            print(f"\n  -> {repl}   ({n} instances, {len(hits)} files)")
            print(f"     {why}")
            for f, c in hits:
                print(f"        {os.path.basename(f)}  x{c}")
    print(f"\n  {total_safe} safe fix(es) {'APPLIED' if apply_fixes else 'available'}.")

    # ── UNSAFE: report per LINE, not per error type ──
    # A single sentence can carry several false claims. Reporting by error type
    # means you fix half a sentence and leave the rest. Group by file+line so a
    # broken sentence is rewritten ONCE, whole.
    print("\n" + "=" * 78)
    print("NEEDS A HUMAN — grouped by line, because sentences carry more than one error")
    print("=" * 78)

    from collections import defaultdict
    lines = defaultdict(lambda: {"labels": set(), "why": set(), "ctx": ""})

    for label, pat, why in UNSAFE:
        for f in files:
            h = open(f, encoding="utf-8", errors="ignore").read()
            for m in re.finditer(pat, h, re.I):
                key = (os.path.basename(f), line_of(h, m.start()))
                lines[key]["labels"].add(label)
                lines[key]["why"].add(why)
                if not lines[key]["ctx"]:
                    lines[key]["ctx"] = context(h, m.start(), m.end(), 90)

    multi  = {k: v for k, v in lines.items() if len(v["labels"]) > 1}
    single = {k: v for k, v in lines.items() if len(v["labels"]) == 1}

    report = ["# CPL Data Correction Worklist\n\n",
              "Generated from `cpl-data.json` (canonical Consumer Reports figures).\n\n",
              "**Grouped by line.** A single sentence can carry several false claims — "
              "fix the whole sentence once, don't patch it twice.\n"]

    if multi:
        print(f"\n  !!! {len(multi)} LINE(S) WITH MULTIPLE FALSE CLAIMS — rewrite whole, do not patch\n")
        report.append("\n## ⚠️ Lines with MULTIPLE false claims — rewrite the whole sentence\n")
        for (f, ln), d in sorted(multi.items()):
            print(f"  {f}:{ln}")
            print(f'      "{d["ctx"][:104]}"')
            for l in sorted(d["labels"]):
                print(f"        + {l}")
            print()
            report.append(f"\n### `{f}` line {ln}\n\n```\n{d['ctx'][:200]}\n```\n\n")
            for l in sorted(d["labels"]):
                report.append(f"- **{l}**\n")
            for w in sorted(d["why"]):
                report.append(f"  - {w}\n")

    print(f"\n  {len(single)} line(s) with a single error:\n")
    report.append("\n## Single-error lines\n")
    by_label = defaultdict(list)
    for (f, ln), d in single.items():
        by_label[list(d["labels"])[0]].append((f, ln, d["ctx"]))
    for label in sorted(by_label, key=lambda x: -len(by_label[x])):
        items = by_label[label]
        print(f"    {len(items):>3}  {label}")
        report.append(f"\n### {label} — {len(items)} instance(s)\n\n")
        for w in [u[2] for u in UNSAFE if u[0] == label]:
            report.append(f"> {w}\n\n")
        for f, ln, ctx in sorted(items)[:12]:
            report.append(f"- `{f}` **line {ln}** — `{ctx[:100]}`\n")

    grand = len(lines)
    print(f"\n  {grand} broken line(s) total.")

    if worklist:
        open("cpl-worklist.md", "w", encoding="utf-8").write("".join(report))
        print("  -> cpl-worklist.md written.")

    print("\n" + "=" * 78)
    print("ORDER OF WORK")
    print("=" * 78)
    print("""
  1. FALSE 'below detection' on OWYN / ON Gold Standard / Momentous Whey.
     These understate lead in products you EARN COMMISSION ON. Highest exposure.
     Only MuscleTech was 'lead not detected' — do not break that one.

  2. 'infinitely safer' — rewrite the argument. OWYN at 88% vs Orgain at 143%
     is ~1.6x cleaner. The claim still stands; the language does not.

  3. Premier Protein RTD — never tested. Strip every CR attribution.

  4. ON Serious Mass — the 202% is ARSENIC, not lead.

  5. Prop 65 framing — CR disclaims it. Use '% of CR's level of concern'.
""")


if __name__ == "__main__":
    main()