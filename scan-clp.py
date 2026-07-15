#!/usr/bin/env python3
"""
Scan every HTML file for the Clean Label Project corruption my repair script caused:
a claim that attributes a Consumer Reports figure to Clean Label Project, or converts
a CLP 'non-detect' into a CR percentage.

Run from the repo root:  python scan-clp.py
"""
import re, glob, os

# The corruption signatures:
PATTERNS = [
    # "Clean Label ... 56% of CR's level of concern"  (CLP doesn't publish percentages)
    (r"Clean\s*Label(?:\s*Project)?[^.<]{0,70}?\d{1,3}%\s*of\s*CR",
     "CLP claim carrying a CR percentage"),
    # "verified safe by Clean Label Project with NN% ..."
    (r"(?:verified|certified)[^.<]{0,40}?Clean\s*Label[^.<]{0,40}?\d{1,3}%\s*of",
     "CLP verification carrying a percentage"),
    # "Clean Label ... level of concern"  (the phrase 'level of concern' is CR's, not CLP's)
    (r"Clean\s*Label(?:\s*Project)?[^.<]{0,60}?level of concern",
     "CLP claim carrying CR's 'level of concern' phrasing"),
    # reverse order: "NN% of CR's level of concern ... Clean Label certified"  — only if same clause
    (r"\d{1,3}%\s*of\s*CR[^.<]{0,50}?Clean\s*Label\s*(?:Project)?\s*certif",
     "CR percentage fused into a CLP certification claim"),
]

# Legitimate: "X has Clean Label certification AND Consumer Reports #N (56%)" — two
# sources correctly distinguished. Don't flag those.
LEGIT = re.compile(r"AND\s+Consumer\s+Reports|Clean\s*Label\s+certification\s+AND", re.I)

def scan(files):
    hits = []
    for f in files:
        h = open(f, encoding="utf-8", errors="ignore").read()
        for pat, label in PATTERNS:
            for m in re.finditer(pat, h, re.I):
                seg = h[max(0, m.start()-60): m.end()+60]
                if LEGIT.search(seg):
                    continue
                ctx = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", seg)).strip()
                ln = h[:m.start()].count("\n") + 1
                hits.append((os.path.basename(f), ln, label, ctx))
    return hits

files = sorted(set(os.path.normpath(f) for pat in ("*.html","blog/*.html","blog\\*.html")
                   for f in glob.glob(pat)))
print(f"Scanning {len(files)} files for Clean Label / Consumer Reports source corruption\n")
hits = scan(files)
if not hits:
    print("  CLEAN. No CLP-as-CR corruption found.")
else:
    by_file = {}
    for base, ln, label, ctx in hits:
        by_file.setdefault(base, []).append((ln, label, ctx))
    print(f"  {len(hits)} suspect claim(s) across {len(by_file)} file(s):\n")
    for base in sorted(by_file):
        print(f"  {base}")
        for ln, label, ctx in by_file[base]:
            print(f"      line {ln} — {label}")
            print(f"        \"{ctx[:110]}\"")
        print()