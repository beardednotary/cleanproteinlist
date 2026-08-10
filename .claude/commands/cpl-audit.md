---
description: Run the cleanproteinlist.com fact/SEO audit loop (CPL-AUDIT-LOOP.md)
---

Run the CPL audit loop for this repo.

1. Read `CPL-STRATEGY.md` first, in full — don't re-derive or re-propose
   anything already tried, rejected, or fixed.
2. Read `CPL-AUDIT-LOOP.md` and follow Steps 1–4 exactly:
   - Step 1: run `py cpl-audit.py` (full report). Read the output in full —
     don't summarize away conflicts.
   - Step 2: for each real conflict (see Rule 0's note on legitimate
     different-product splits before assuming it's a bug), resolve against
     `cpl-data.json`. Use `cpl-fix-data.py` / `cpl-repair.py` (dry run first)
     for anything they can handle mechanically; note what still needs a
     manual rewrite and why.
   - Step 3: pull Search Console if a fresh export is available; if not, say
     so explicitly and skip rather than guessing.
   - Step 4: stop here and present the numbered proposal, each item with its
     `cpl-data.json` source. Do not ship anything yet — wait for the user to
     approve a subset (Step 5).
3. Once approved: ship the approved items, verify JSON-LD on every changed
   file, bump `dateModified`/"Last Updated"/`sitemap.xml` `lastmod` for
   changed URLs, run `python3 indexnow.py <urls>` for them, and append a
   dated entry to `CPL-STRATEGY.md` per Step 6 — what shipped, what was
   rejected and why, and any new standing rule this run surfaced (append to
   the rules list in `CPL-AUDIT-LOOP.md` too, if so).
