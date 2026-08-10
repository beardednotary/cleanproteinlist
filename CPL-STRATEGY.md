# SEO/Fact Strategy Log — cleanproteinlist.com

Rolling log the audit loop (`CPL-AUDIT-LOOP.md`) reads before every run and
appends to after every run. Newest entry on top. Don't delete old entries —
future runs need to see what was already tried, rejected, or fixed.

---

## 2026-08-09 — Loop bootstrapped; mechanical audit surfaces 43 open items

**Context:** Google's December 2025 core update collapsed CPL's traffic from
~3k clicks/month (Dec 2025) to ~10/day. Diagnosis (via live web search,
matching the exact date range of the traffic cliff) pointed at the core
update itself, not an indexing or crawl problem. Separately, and the bigger
finding: a prior attempt to merge Consumer Reports' two separate testing
rounds (Oct 2025, 23 products; Jan 2026, 5 products) into one fabricated
"#1–28" ranking had corrupted numbers across the site — wrong products
attributed to real percentages, fabricated ranks, inverted "% over" vs "% of"
language, and "Correction" boxes that admitted an error while leaving it live
elsewhere on the same page.

**What happened before this entry (multi-session, not itemized here in
full):** hand-audited ~49 blog files against CR's two real source articles,
fixed the pattern above across roughly 30 files, removed all "Correction"
boxes per site-owner instruction (state the fact plainly instead), fixed the
Consumer Reports vs. Clean Label Project misattributions, bumped
`dateModified`/sitemap `lastmod` for every touched page, and pushed IndexNow
after each batch.

**This entry:** built the actual loop infrastructure (`CPL-AUDIT-LOOP.md`,
this file, `.claude/commands/cpl-audit.md`) so future runs don't re-derive
the ground truth from scratch. In the process, discovered this repo already
had a mature toolchain from an earlier round of work that wasn't referenced
in the hand-audit above: `cpl-data.json` (the canonical CR dataset),
`cpl-audit.py` (mechanical conflict/schema/link checker), `cpl-repair.py`
and `cpl-fix-data.py` (safe auto-fixers for unambiguous number swaps).
Running `cpl-audit.py` cold confirmed the hand-audit's conclusions — **zero
conflicts** with `cpl-data.json` across everything fixed so far — and
surfaced additional items the hand-audit's file list didn't cover:

- **43 total items** across data conflicts, rank conflicts, invalid JSON-LD,
  missing FAQPage/Article schema, untagged Amazon links, and unbalanced tags.
- Confirmed real bug, not yet fixed: `optimum-nutrition-gold-standard-whey-
  lead-testing-results-2025.html` itself still says "56% of CR's level of
  concern (<0.1 µg/serving)" — self-contradictory; ON Gold Standard is not
  "below detection" (only MuscleTech 100% Mass Gainer is), the real derived
  figure is 0.28 µg.
- One invalid JSON-LD block: `muscletech-protein-powder-ranking-analysis.
  html` (parse error at line 6, silently dropping schema from Google/Bing).
- Several flagged "conflicts" are legitimate different-product splits (Vega
  One vs. Vega Premium Sport vs. Vega Protein & Greens; Garden of Life Whey
  vs. Sport Organic Plant) — not bugs, don't touch.
- 16 blog pages missing `Article` schema, 13 pages with a visible FAQ but no
  `FAQPage` schema — pure upside, no risk, good candidate for a future
  "safe wins" batch.
- 6 untagged/dead Amazon links, all on `ebt-protein-powder-complete-guide-
  2025.html` — earning $0 on paid traffic.

**Not shipped this entry** — these are logged as the loop's first real
backlog, not fixed ad hoc tonight. Next run should triage the 43 items
through Steps 1–4 of `CPL-AUDIT-LOOP.md` and bring a proposal.

---
