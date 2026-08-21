# SEO/Fact Audit Loop — cleanproteinlist.com

A written procedure a coding agent (Claude Code) runs against this repo on a
recurring basis, proposes changes from, and the human approves a subset of.
Modeled on lipidlog.com's `SEO-AUDIT-LOOP.md`, adapted for CPL's actual
failure mode: this is an affiliate site built on Consumer Reports lead-testing
data, and its main risk isn't thin content — it's **factual drift**. CR ran
two separate testing rounds and a prior pass at merging them into one ranking
fabricated ranks, swapped products, and inverted percentages across dozens of
pages. That's the thing this loop exists to catch before it happens again.

Every run:
1. Reads this file and `CPL-STRATEGY.md` first, so it never re-derives or
   re-proposes something already tried, rejected, or fixed.
2. Does the six steps below.
3. Writes a dated entry to `CPL-STRATEGY.md` before finishing.

If a step needs a data source that isn't wired up yet (Search Console API,
DataForSEO, etc.), say so explicitly in the audit output and fall back to the
manual equivalent noted under that step — don't skip the step silently.

---

## Rule 0 — `cpl-data.json` is the single source of truth

Every lead figure, percentage, rank, and guidance level on this site must
trace back to `cpl-data.json`. That file is hand-built from CR's two
published articles and is authoritative — if a page says something
`cpl-data.json` doesn't corroborate, **the page is wrong, not the data file**.

Non-negotiable facts baked into that dataset (repeating them here because
they're the ones that get silently violated one sentence at a time):

- CR ran **two separate rounds**: October 2025 (23 products, powders + RTD)
  and January 2026 (5 products, powders only, "no premade shakes"). They do
  not combine into a single ranked list. Nothing is "#24–28." Nothing is "of
  28 tested."
- CR reports **"% of CR's level of concern"** (baseline 0.5 µg/day), not
  "% over the Prop 65 limit" and not a Prop 65 judgment at all — CR says
  explicitly no Prop 65 judgment can be made from its findings.
- CR published a raw µg figure in article text for exactly two products:
  Naked Nutrition (7.7 µg) and Huel Black Edition (6.3 µg). Every other µg
  figure on the site is back-calculated from a percentage and should be
  labeled as derived, or dropped in favor of the percentage.
- **Only one product** — MuscleTech 100% Mass Gainer — was reported as "lead
  not detected." No other product gets "below detection," "non-detect," or
  "infinitely safer" language.
- Optimum Nutrition Serious Mass's 202% figure is **inorganic arsenic**, not
  lead. CR published no lead percentage for it. It is the one product where
  a different metal was the bigger risk.
- Premier Protein's **RTD shakes have never been tested** by CR, in either
  round. Only the powder was tested (Jan 2026, 77% / 0.38 µg). A rank or
  figure attributed to the RTD is fabricated by construction.
- A brand can legitimately have multiple different figures site-wide if
  they're **different products** (Garden of Life Whey vs. Garden of Life
  Sport Organic Plant; Vega One vs. Vega Premium Sport vs. Vega Protein &
  Greens; Premier Protein powder vs. RTD). Same product, different number on
  two pages is a bug. Different product, different number is not — but check
  which one it is before touching anything.

## Step 1 — Run the mechanical audit

```
py cpl-audit.py            # full report
py cpl-audit.py --only data # just data-consistency
py cpl-audit.py --csv       # also writes cpl-audit-report.csv
```

This catches, mechanically, most of what took an entire manual multi-day
sweep to find the first time:
1. **Data conflicts** — same brand, different µg/% on different pages.
2. **Rank conflicts** — same brand, different CR rank on different pages.
3. **Phantom CR data** — ranks above #23, "of 28" phrasing, figures
   attributed to products CR never tested (Premier RTD, the fabricated
   Garden of Life 3.32/4.24 µg, etc.).
4. **Schema** — invalid JSON-LD (silently discarded by Google/Bing), pages
   with a visible FAQ but no `FAQPage` schema, blog pages with no `Article`
   schema.
5. **Links** — Amazon links missing the affiliate tag (`beardednotary-20`),
   malformed URLs.
6. **Structure** — unbalanced HTML tags.
7. **Monetization** — blog pages with zero affiliate links (check before
   "fixing" — some are deliberately unmonetized, e.g. pages recommending
   against a product).

Every conflict the tool reports needs a human/agent read of the context
before touching anything — see Rule 0's last bullet. `cpl-audit.py` already
prints the surrounding row/list-item text for exactly this reason.

## Step 2 — Resolve conflicts against ground truth

For each real conflict (not a legitimate different-product split):
- Look up the correct figure in `cpl-data.json`.
- `py cpl-fix-data.py` (dry run by default) mechanically fixes the subset of
  errors that are unambiguous number swaps — e.g. 7.86 µg → 7.7 µg. It will
  not touch anything where the surrounding sentence carries an argument
  (e.g. "OWYN is infinitely safer" is false at 88% and has to be rewritten,
  not swapped).
- `py cpl-repair.py` (dry run by default, `--apply` to write) handles the
  broader brand-scoped corrections described in its docstring: false "below
  detection," the arsenic/lead mislabel, the "% over" inversion, and
  untested-SKU transfers.
- Anything neither script can safely auto-fix gets fixed by hand, following
  the conventions in the Standing Rules section below — this is most of the
  actual work. Fix both the visible HTML and any duplicate JSON-LD text.
- After every manual edit, validate JSON-LD parses:
  `python3 -c "import re,json; ..."` block-extraction check (see any commit
  from the 2026-08-08/09 audit for the exact one-liner), or just re-run
  `cpl-audit.py --only schema`.

## Step 3 — Pull Search Console (if available)

CPL doesn't have GSC API access wired up. Ask for a pasted export, or open
Search Console manually: Performance report (top queries, position, CTR),
Pages report (indexing status), and compare current 28 days vs. prior 28
days. CPL's traffic collapsed after Google's December 2025 core update
(~3k clicks/month in Dec 2025 → ~10/day by the time this loop was built) —
that recovery, if any, is the top-line metric to watch. Core-update recovery
plays out over weeks to months, so don't over-read week-to-week noise.

No GSC data pasted in → skip this step explicitly in the output rather than
guessing, and note it as a gap.

## Step 4 — Propose with evidence

Numbered list. Each item: the page(s), the conflict or issue, the
`cpl-data.json` entry (or CR source) that resolves it, and what specifically
changes. No source, no place on the list.

## Step 5 — Human approves a subset

Reply with something like "1, 3, fixes all" — approval is the whole job.
Anything not explicitly approved doesn't ship.

## Step 6 — Ship and record

After shipping approved items:
1. Bump `dateModified` (JSON-LD) and visible "Last Updated" text on every
   changed page, and `sitemap.xml`'s `lastmod` for the same URLs.
2. `PYTHONIOENCODING=utf-8 python3 indexnow.py <url1> <url2> ...` for the
   changed URLs (Bing/Yandex/Seznam/Naver only — no effect on Google; there's
   no IndexNow-equivalent lever for GSC beyond manual URL Inspection →
   Request Indexing and sitemap resubmission).
3. Append a dated entry to `CPL-STRATEGY.md`: what shipped, what was
   rejected and why (so it isn't re-proposed next run), and any new standing
   rule this run surfaced (add it to the list below too).

---

## Standing rules (grows over time — add one every time something goes wrong)

1. **`cpl-data.json` is canonical; a page is wrong before the data file is.**
   Established 2025-07 (pre-existing tooling) and re-confirmed 2026-08-09
   after an independent hand-audit of ~40 files matched the file exactly
   with zero conflicts.
2. **Never merge CR's two testing rounds into one ranking.** This is the
   root cause of nearly every fabrication found on this site — a prior pass
   combined 23 October products + 5 January products into a fake "#1–28"
   list, which required inventing ranks, swapping products between rows, and
   in several places left literal unfixed placeholder text after a bad
   find-replace. Added 2026-08 after the multi-day recovery from exactly
   this.
3. **No "Correction" boxes — state the fact plainly.** Per explicit site-
   owner instruction (2026-08-09): don't admit a past error in-page, just
   say what's true now. Applies to any box, notice, or FAQ answer that
   currently reads "we previously said X, that was wrong."
4. **A same-brand numeric "conflict" is only a bug if it's the same
   product.** `cpl-audit.py`'s data/rank checks flag brand-level collisions;
   check whether the two figures belong to different SKUs (powder vs. RTD,
   different flavor, different product line) before touching either page.
   Verify the "different SKU" against `cpl-data.json` (or the real CR
   source) before assuming it's legitimate — **"Vega One" and "Vega Protein
   & Greens" were never tested by CR at all** (confirmed 2026-08-10 via the
   real CR source article); only "Vega Premium Sport" (185%/0.93µg, #16) has
   a real result. A prior version of this rule cited the three Vega products
   as a legitimate different-SKU example — that was itself a fabrication
   that had propagated into two blog pages (fake #18/#19 rows, a fake
   0.93-1.83µg range). Not every same-brand split is real; check the brand
   actually has multiple *tested* products, not just multiple *products*.
5. **Distinguish product variants explicitly in the copy, not just in your
   head.** "Optimum Nutrition" alone is ambiguous between Gold Standard
   Whey powder (56%), the Gold Standard RTD shake (150%), and Serious Mass
   (arsenic, not lead). Name the specific product every time a figure is
   stated.
6. **Verify JSON-LD after every edit, not just at the end of a session.** A
   single malformed edit silently drops the entire schema block from
   Google/Bing's view — `cpl-audit.py --only schema` or the block-parse
   one-liner, every time.
7. **Never assert a µg figure CR didn't publish.** Use the percentage unless
   the product is one of the few (Naked, Huel in Oct 2025; all 5 in Jan
   2026) where CR's own article text gives a raw µg number.
8. **`cpl-repair.py`'s rule 5 (Dymatize ISO 100 → Super Mass Gainer) is
   stale — do not `--apply` it.** Added 2026-08-10. Its regex
   (`Dymatize\s+ISO-?\s?100`) matches the literal product name with no
   context check, so it can't tell a false CR-attribution claim from a
   correct "ISO 100 was never tested" sentence. The site has since been
   hand-corrected (`dymatize-iso-100-safety-analysis.html` and others now
   correctly explain ISO 100 was never CR-tested and Super Mass Gainer was)
   — re-running this rule would rewrite dozens of already-accurate sentences
   into false ones (e.g. turning "ISO 100 holds a Clean Label Purity Award"
   into a false claim about Super Mass Gainer, which doesn't hold that
   award). Verified by grep across all live (non-`.bak`) instances of
   "Dymatize ISO 100" on 2026-08-10 — every one was already correct. If this
   rule is ever needed again, it must be scoped to only fire near an
   explicit CR-percentage/rank claim, not on any mention of the product
   name.
9. **`cpl-audit.py`'s conflict checkers have two known classes of false
   positive — read the context before treating either as a real bug.**
   Found and fully diagnosed 2026-08-21:
   - **`check_data()` does unbounded substring brand matching**
     (`re.search(re.escape(brand), text, re.I)`), so "Vega" matches inside
     "Naked **Vega**n Mass Gainer" and "Quest" matches inside "the
     que**quest**ion isn't...". Every Vega/Quest "conflict" traced this run
     was one of these two false matches, not a real content error.
   - **`check_ranks()` only requires a brand name to appear once anywhere
     in a table row or `<li>`, and does not require the rank number to be
     adjacent to it** (unlike `check_data()`, which does require the brand
     in `cells[:2]`). A row naming two products (a comparison row) or a
     completely unrelated ranking system that happens to share a brand name
     (the site's own creatine-brand rank tables, e.g. "Dymatize Creatine
     Monohydrate #9", "MuscleTech Platinum Creatine #5" — a different
     ranking scheme from CR's protein-powder ranks) gets its rank
     attributed to the wrong bucket. **Verified this run**: independently
     rebuilt the canonical CR Oct-2025 rank order by sorting all 23 round-1
     `cpl-data.json` products by `pct_of_concern` ascending, and cross-checked
     it against the site's own published table
     (`lead-in-protein-powder-list.html` rows 1-23) — every single rank
     matched exactly, including all 8 brands `check_ranks()` flagged as
     "conflicting." None were real.
   Do not hand-fix a `check_ranks()` or Vega/Quest `check_data()` flag
   without first checking whether it's one of these two patterns. A real
   fix to the script would tighten `check_ranks()` to require brand+rank in
   the same cell, and switch `check_data()`'s `BRANDS` matching to
   word-boundary (`\bVega\b`) — not done as of this entry, logged as an
   open backlog item instead.
