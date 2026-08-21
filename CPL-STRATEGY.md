# SEO/Fact Strategy Log — cleanproteinlist.com

Rolling log the audit loop (`CPL-AUDIT-LOOP.md`) reads before every run and
appends to after every run. Newest entry on top. Don't delete old entries —
future runs need to see what was already tried, rejected, or fixed.

---

## 2026-08-21 — Second full loop run: Prop-65 phrasing, precision cleanup, new-page monetization, tool false-positives diagnosed

**Context:** First loop run since 2026-08-10, and since two off-loop sessions
that shipped `best-cheap-protein-powder-low-heavy-metals.html`,
`legion-whey-protein-lead-testing-safety-2026.html`, and
`thorne-whey-protein-isolate-nsf-certified-safety-2026.html`, plus a language
fix on `safe-protein-powder-teenagers-kids-2025.html`. Ran Steps 1-4 fresh
against the current 92-file site plus pasted GSC/Bing exports. Approved in
full by the site owner ("all").

**Shipped:**

- **Sitewide "X over the safe/Prop 65 limit" phrasing** — CR explicitly
  states no Prop 65 judgment can be made from its findings (`cpl-data.json`
  `_README` note 2); this phrasing implies one anyway. Fixed on the 6 files
  directly verified this run: `lead-in-protein-powder-list.html` (the site's
  #1-trafficked page — "25% of the Prop 65 limit" → "25% of CR's level of
  concern," plus a "safe annual limit" rewrite in the Naked Nutrition FAQ),
  `best-protein-powder-2025.html` (4 instances in the AVOID box),
  `best-protein-powder-weight-loss-2025.html`, `ascent-protein-powder-lead-
  testing-safety-2025.html` (2 instances), `bsn-syntha-6-safety-analysis.html`,
  `momentous-protein-safety-analysis.html`. A broader grep found this pattern
  in ~129 instances across ~40 live files total — **not fully swept this
  run**, see "Not shipped" below.
- **Vague `<0.5µg` precision replaced with real derived figures** — the item
  flagged "not shipped" on 2026-08-10, now located and fixed: ON Gold
  Standard (→ 0.28µg/56%) and Momentous Whey Isolate (→ 0.15µg/30% derived)
  on `lead-poisoning-protein-powder-symptoms.html` and
  `momentous-protein-safety-analysis.html`; OWYN Pro Elite (→ 0.44µg/88%) on
  `lead-poisoning-protein-powder-symptoms.html`; Truvani (→ 0.46µg/93%) on
  `lead-free-protein-brands-ranked-2025.html`. **Correction to the original
  proposal**: I'd initially misattributed the Momentous/Huel instances to
  `bsn-syntha-6-safety-analysis.html` — they're actually on
  `momentous-protein-safety-analysis.html`; caught and fixed on the correct
  file before shipping.
- **3 monetization gaps fixed** on pages shipped in the prior off-loop
  session: `best-cheap-protein-powder-low-heavy-metals.html` got real Amazon
  buy buttons for Body Fortress and ON Gold Standard (reusing the exact
  verified links from their own dedicated pages — no new ASINs invented).
  `legion-whey-protein-lead-testing-safety-2026.html` and `thorne-whey-
  protein-isolate-nsf-certified-safety-2026.html` got generic
  tag-only Amazon search links (the same pattern already used on the NOW
  Sports page) since no verified product-specific ASIN exists for either —
  deliberately not guessing one. Re-run of `cpl-audit.py`'s monetization
  check confirms all 3 no longer flagged; only the 2 already-documented
  correctly-unmonetized pages remain.
- **Diagnosed, not content bugs**: re-verified every one of the 8 `check_data()`
  "conflicts" and all 8 `check_ranks()` "conflicts" from this run's `cpl-
  audit.py` output against `cpl-data.json` and the live pages. Confirmed:
  Garden of Life 2.76/2.82µg and Naked Nutrition 15.4/7.7µg were already
  correctly explained (legit lawsuit citation; legit 2-serving/day
  calculation). Quest's 0.65/2.90µg lawsuit figures are a real, separate,
  correctly-attributed Nov-2025 ISO-lab source distinct from CR's own 161%
  — not conflated on the page, no fix needed. Vega/Quest's other flagged
  conflicts, and **all 8 rank conflicts**, are `cpl-audit.py` false
  positives (substring brand matching, and `check_ranks()` not requiring
  brand+rank in the same cell) — full diagnosis and a rebuilt canonical
  rank table (23 Oct-2025-round products sorted by `pct_of_concern`,
  cross-checked against `lead-in-protein-powder-list.html`'s own table,
  100% match) written up as new Standing Rule 9 in `CPL-AUDIT-LOOP.md` so
  future runs don't re-chase these.
- **GSC/Bing review**: pasted exports show two different windows — an older
  one still dominated by "premier protein lead" brand queries, and a current
  (8/21/2026) one showing the traffic mix has shifted to
  `lead-in-protein-powder-list.html` (now #1 by far, 1,658 clicks/14,503
  impressions) plus the creatine cluster and `best-protein-powder-
  costco-2025.html`. `SearchPerformanceOverview` shows daily clicks
  recovering from the ~10/day Dec-2025 trough to a ~50-80/day range through
  August (with a 430-click spike on 7/10 that predates this loop's work) —
  real but partial recovery, still well below the ~3k/month Dec-2025 peak.
  Indexing status: 67 indexed, 13 "Crawled — not indexed" (a Google quality
  signal, no mechanical fix identified, logged as a watch item), 10
  "Discovered — not indexed" including the 3 pages from the prior off-loop
  session — flagged to the site owner that IndexNow never reaches Google
  (Bing/Yandex/Seznam/Naver only, per Step 6) and those 3 need a manual GSC
  URL Inspection → Request Indexing if faster Google indexing is wanted.
- **Step 6 housekeeping:** bumped `dateModified`, visible "Last Updated" /
  "📅 Updated" text, and `sitemap.xml` `lastmod` on all 11 changed pages;
  re-ran `cpl-audit.py` full + `--only schema` + `--only links` post-fix
  (0 schema issues, 0 link issues, data conflicts down from 8 to 7 brands
  with the resolved ones gone, monetization gap down from 5 to 2 pages);
  submitted all 11 URLs to IndexNow (HTTP 200, accepted).

**Not shipped / deferred:**

- **~34 files / ~100 remaining instances** of the "over the safe/Prop 65
  limit" phrasing pattern (item 1 above covered 6 files as a first
  verified batch). Full file list from `grep -lE "over (the )?safe limit|
  over limit|x over|% of the (Prop 65 )?limit" blog/*.html` (excluding
  `.bak`) is in this run's working notes, not reproduced here — re-grep at
  the start of the next run rather than trusting this count to still be
  accurate. Some fraction of any re-grep's hits will be false positives
  (the site's own "LIMIT USE" risk-tier badge language is legitimate and
  must not be rewritten) — read context per-instance, same as this run.
- **13 "Crawled — currently not indexed" GSC pages** — no mechanical fix
  identified; flagged as a quality/content-depth question for a future
  content-focused pass, not a data-accuracy issue this loop is built to
  catch.
- **`cpl-audit.py` script tightening** (word-boundary brand matching in
  `check_data()`, same-cell requirement in `check_ranks()`) — diagnosed and
  documented (Standing Rule 9) but not implemented; the false positives are
  now known and don't need re-chasing, so this is lower urgency than
  content fixes.

**New standing rule added to `CPL-AUDIT-LOOP.md`:**
- Rule 9 (new): `cpl-audit.py`'s `check_data()` substring-matching and
  `check_ranks()` same-row-not-same-cell false positives, with the full
  diagnosis and the verified canonical rank table.

---

## 2026-08-10 — First full loop run: 43-item backlog triaged, ~50 files shipped

**Context:** First complete run of Steps 1–6 against the backlog `CPL-
STRATEGY.md`'s 2026-08-09 entry logged. Started from a 15-item Step 4
proposal; every item expanded significantly once actually fixed, because
each fix surfaced adjacent instances of the same bug that the original
mechanical audit hadn't isolated (either because it doesn't do cross-page
prose analysis, or because of audit-tool bugs found and fixed mid-run — see
below). Approved in full by the site owner ("I agree with all assessments.
Let's tackle in priority order. No need to ask permission.").

**Shipped (grouped by root cause, not by original item number):**

- **Fabricated Vega One / Vega Protein & Greens data removed.** Neither
  product was ever tested by CR — confirmed against the real CR source
  article. Only "Vega Premium Sport" (185%, #16) is real. Fixed 2 files
  (`owyn-pro-elite-...`, `orgain-organic-...`). This also **overturned an
  existing Standing Rule 4 example** in `CPL-AUDIT-LOOP.md` that had cited
  the three-Vega split as a legitimate different-SKU case — it wasn't;
  two of the three products don't exist in CR's data at all. Rule 4
  rewritten with the correction and a warning to verify "different SKU"
  claims against real testing, not just real product existence.
- **`consumer-reports-new-protein-powder-tests-january-2026.html` had a
  structural Rule-0 violation**: a table titled "All 28 Protein Powders
  Tested" merging the two CR rounds into one fake continuous ranking,
  plus two entirely fabricated products inserted into it (Body Fortress
  Whey "#7, non-detect" and "Pure Protein Shake #8, 0.68µg/136%" — neither
  was CR-tested). Rewrote the table to present the two rounds separately
  with a "Round" column instead of merged rank numbers, removed both fake
  rows. The same page also had a 3-way copy-paste corruption in an
  unrelated list: ON Gold Standard's real 56% had been duplicated onto
  Body Fortress (fabricated) and onto Dymatize Super Mass Gainer (real
  figure is 25%, not 56%), while Momentous got mislabeled 25% (its real
  figure is 30%). All four corrected against `cpl-data.json`.
- **Muscle Milk Pro Advanced's real figure (128% / #9 / ~0.64µg derived)
  was replaced sitewide with a phantom "1.25µg / #17 / 250%" figure.**
  Traced and fixed across 10 files (not the 3 originally scoped):
  `rtd-protein-shakes-safety-guide-2025.html` (11 instances incl. a
  duplicate JSON-LD FAQ block), `stats.html` (also reordered the table row
  — it was physically out of ascending-% order), `new-year-fitness-guide-
  2026-...html`, `premier-protein-lead-testing.html`,
  `ensure-protein-shakes-safety-lead-testing-2025.html`,
  `boost-protein-shakes-safety-lead-testing-2025.html`, and removed a
  "Correction" box on `premier-protein-vs-muscle-milk-comparison-2025.html`
  that violated Standing Rule 3 (the facts were already stated plainly
  right above it).
- **OWYN's real CR rank (#7) had been written as #3** on 2 files
  (`genepro-whey-protein-fda-recall-...`, `protein-powder-recalls-
  2025.html`); fixed. Also fixed one instance of ambiguous "#1" phrasing
  for OWYN (meant "#1 plant option," read like a CR rank) on the
  January-2026 page.
- **`optimum-nutrition-gold-standard-whey-lead-testing-results-2025.html`
  was internally self-contradictory and needed a real rewrite, not a
  value swap**: the entire page asserted "below detection / <0.1µg /
  unlimited daily use" for ON Gold Standard, which is exclusively
  MuscleTech's status per Rule 0. Real figure is 56% of CR's level of
  concern (~0.28µg derived), cleared for ~1.75 servings/day, not
  unlimited. Rewrote ~15 instances across the FAQ, JSON-LD, comparison
  tables, and body copy. Also caught a mislabeled Momentous row inside
  this same page's comparison table ("below detection" → its real 30%).
  Same false "below detection" pattern for ON also fixed on 2 more pages
  (`naked-nutrition-vegan-mass-gainer-lead.html`,
  `heavy-metals-protein-shakes-brands-2025-report.html`).
- **Garden of Life's real 2.82µg had been written as 2.76µg** on
  `stats.html` — fixed. **Correction to the original Step 4 proposal:**
  `protein-powder-recalls-2025.html` was also flagged for this, but its
  2.76µg figure is a legitimate citation from the DeHerrera v. Garden of
  Life lawsuit filing (its own number, not CR's) — left untouched.
- **OWYN's 88%/derived-µg self-contradiction** (`<0.1µg` next to `88%
  of CR's level of concern` — 88% of 0.5µg is 0.44µg, not <0.1µg) fixed
  on `lead-free-protein-brands-ranked-2025.html`.
- **Invalid JSON-LD on `muscletech-protein-powder-ranking-analysis.html`**
  fixed — unescaped `"low"` inside a description string. Verified all 4
  blocks on the page now parse.
- **7 untagged Amazon links** on `ebt-protein-powder-complete-guide-
  2025.html` (wrong tag `cleanprotein-20`) retagged to `beardednotary-20`.
- **Two files had a "duplicate related-articles block" corruption** —
  `heavy-metals-protein-shakes-brands-2025-report.html` and `prop-65-
  warning-protein-powder.html` each had a second `<h3>Related Articles</h3>
  <div class="related-grid">` pasted mid-section without closing the
  first, silently leaving one `<div>` permanently unclosed. Same bad-
  find-replace signature as the original fabrication incident. Fixed by
  removing the duplicate header/div-open and keeping all cards under the
  original div. `ensure-protein-shakes-safety-lead-testing-2025.html`'s
  unbalanced `<a>` was a different bug — a broken Quiz footer link
  missing its text and closing tag.
- **FAQPage schema added to 8 pages** that had a real, visible FAQ section
  and no schema for it: `about.html`, `best-protein-powder-2025.html`,
  `creapure-vs-regular-creatine-comparison.html`, `dcd-dicyandiamide-
  creatine-contamination.html`, `huel-black-edition-lead-content.html`,
  `lead-poisoning-protein-powder-symptoms.html`, `momentous-protein-
  safety-analysis.html`, `nsf-certified-creatine-athletes-guide.html`.
  While adding schema to the Momentous page, found and fixed one more
  false "below detection" claim about Momentous buried in an FAQ answer
  (real figure: 30% of CR's level of concern).
- **4 genuine monetization gaps fixed** of the original 6 flagged
  zero-affiliate-link pages: `huel-black-edition-lead-content.html`,
  `lead-poisoning-protein-powder-symptoms.html`, `momentous-protein-
  safety-analysis.html`, `protein-pancakes-lead-free-safe-protein-powder-
  2025.html` — all repeatedly recommended specific safe products (OWYN,
  ON Gold Standard, Body Fortress) with zero links to them, including one
  page whose affiliate disclosure claimed links existed that didn't. Added
  real Amazon links using the same ASINs already verified elsewhere on the
  site. The other 2 (`blog.html`, `beyond-lead-heavy-metals-protein-
  powders.html`) are correctly unmonetized — an index page and a redirect
  stub, respectively.
- **Transparent Labs Mass Gainer's real rank (#6) had been written as
  #3** in 5 places on its own dedicated article
  (`transparent-labs-whey-protein-lead-testing-safety-2026.html`) — found
  during the post-fix re-audit, not the original Step 1 pass. #3 is
  actually Momentous Whey Isolate (30%); Transparent Labs is 87%.
- **Step 6 housekeeping:** bumped `dateModified` (JSON-LD) and visible
  "Last Updated" text on all 29 changed pages, bumped `sitemap.xml`
  `lastmod` for the same 29 URLs, submitted all 29 to IndexNow (HTTP 200,
  accepted).

**Not shipped / deferred:**

- **Vague `<0.5µg` precision** (OWYN, Momentous, Truvani, ON Gold
  Standard in a handful of pages) — not incorrect, just imprecise (every
  instance checked is genuinely under 0.5µg). Lower priority than the
  fabrication-class bugs above; left for a future "safe wins" pass.
- Several sitewide grep hits on `cpl-repair.py`'s "% over" and "arsenic"
  rules were not individually re-verified this run — they weren't part of
  the approved 15, and `cpl-repair.py --apply` was never run (see below).

**Tooling fixes made mid-run (not site content, but load-bearing for every
future run):**

1. **`cpl-repair.py`'s rule 5 (Dymatize ISO 100 → Super Mass Gainer) is
   now stale and unsafe to `--apply`.** Its regex matches the literal
   product name with no context check. The site has since been hand-
   corrected (`dymatize-iso-100-safety-analysis.html` and others now
   correctly explain ISO 100 was never CR-tested) — re-running this rule
   would rewrite dozens of already-accurate sentences into false ones.
   Verified by grep: every live "Dymatize ISO 100" mention sitewide is
   already correct. Documented as Standing Rule 8 in `CPL-AUDIT-LOOP.md`.
   Did not run `cpl-repair.py --apply` at all this run as a result —
   every fix above was hand-applied with full context instead.
2. **`cpl-audit.py`'s schema checker had three false-positive bugs**,
   fixed in place (not just worked around):
   - It only read the top-level `@type` of each JSON-LD block, so any
     page using a `@graph` array (common on this site) was always
     flagged as missing FAQPage/Article schema even when it had both.
   - Its "is this a blog page" check for the Article-schema rule was
     `"blog" in f`, a substring match that also caught `blog.html` (the
     index page, not an article).
   - It didn't recognize `NewsArticle` (a valid Article subtype) as
     satisfying the Article-schema check.
   Combined, these inflated the real schema backlog from **8 genuine
   gaps to a reported 29** (13 FAQPage + 16 Article). After the fix, the
   Article-schema list dropped to zero real gaps and FAQPage dropped to 8
   — which is what actually got shipped. Re-run `cpl-audit.py --only
   schema` on any future run should show these lower, correct counts.

**New standing rules added to `CPL-AUDIT-LOOP.md`:**
- Rule 4 corrected: verify a "different SKU" claim against real CR
  testing data, not just real product existence, before treating a
  same-brand numeric split as legitimate.
- Rule 8 (new): don't `--apply` `cpl-repair.py`'s Dymatize ISO 100 rule;
  it's stale as of 2026-08-10.

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
