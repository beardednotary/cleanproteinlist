# SEO/Fact Strategy Log — cleanproteinlist.com

Rolling log the audit loop (`CPL-AUDIT-LOOP.md`) reads before every run and
appends to after every run. Newest entry on top. Don't delete old entries —
future runs need to see what was already tried, rejected, or fixed.

---

## 2026-10-21 — First Google index check; internal-linking + sitemap fixes

**Context:** New `cpl-gsc-index.py` (Search Console URL Inspection API,
read-only) gives the loop a Google-side lever it didn't have — the earlier
"no IndexNow-equivalent for GSC" note still holds for *submitting*, but
index status is now checkable per URL. First run over the 94-URL sitemap
(snapshot `gsc_reports/index-2026-10-21.csv`, gitignored):
63 indexed, 14 Crawled - not indexed, 13 Discovered - not indexed,
3 Unknown, 1 Alternate (`/index.html`).

**Diagnosis — two different problems:**
- **Discovered - not indexed (13): links.** 8 of 13 were creatine posts.
  The indexed creatine hubs linked only to Thorne / NSF guide / Momentous;
  BulkSupplements, Myprotein, Muscle Feast and NOW reviews had zero hub
  links (even `thorne-creatine-vs-bulksupplements-comparison` didn't link
  the BulkSupplements review). Ghost, EBT and Boost posts weren't on
  `blog.html` at all (Ghost and EBT had 0 internal links).
- **Crawled - not indexed (14): quality/overlap, not links** (median 4
  internal links vs 7 for indexed). Most overlap an indexed page:
  vega-vs-orgain ↔ owyn-vs-vega-orgain-garden-of-life; costco-orgain ↔
  amazon-orgain lawsuit; consumer-reports-new-tests-jan-2026 ↔ CR one-year
  retrospective; kirkland-vs-elevation ↔ best-protein-powder-costco; plus
  single-brand lead-testing posts (Ascent, Ryse, NOW Sports, Truvani).

**Shipped (7 files):**
1. "Creatine Brand Reviews" related-card block (all 7 creatine review /
   guide spokes, card text from each post's own meta description) added to
   the 5 indexed hubs: `best-clean-creatine-2026-nsf-tested-brands`,
   `creapure-creatine-brands-complete-list`,
   `thorne-creatine-vs-bulksupplements-comparison`,
   `creapure-vs-regular-creatine-comparison`,
   `dcd-dicyandiamide-creatine-contamination`.
2. `blog.html`: cards for Ghost and Boost (Protein Powder Safety) and EBT
   (Life-Stage Safety Guides).
3. `sitemap.xml`: removed `/index.html` (Google treats it as an alternate
   of `/`).
4. Step 6 housekeeping: `dateModified`, visible "Last Updated" text and
   `sitemap.xml` `lastmod` bumped to 2026-10-21 on the 6 changed pages
   only. `cpl-audit.py` schema / links / structure: 0 issues.
   **IndexNow pending** — run after the push is live.

**Not shipped / next:** the 14 Crawled - not indexed pages need a
merge-or-rewrite decision per page (meta-refresh + canonical stub pattern
for merges, since GitHub Pages can't 301). `contact.html` has zero internal
links — left as-is. Re-run `py cpl-gsc-index.py --sitemap` ~2026-11-04 and
compare against the 10-21 snapshot.

---

## 2026-10-16 — Fourth loop run: 6 fact fixes; Bing identified as the live channel

**Context:** First loop run since 2026-08-27. `cpl-audit.py` output was the
same 15 already-diagnosed flags (7 data / 8 rank conflicts, all Rule 9 false
positives or legit different-product splits; schema/links/structure clean;
2 deliberately unmonetized pages). Reading the printed context around those
flags surfaced 6 real bugs the tool's conflict logic doesn't isolate, plus a
32-file stale claim. Site owner approved items 1-6 ("1-6").

**Shipped (6 files):**
1. `chocolate-protein-powder-lead-contamination-2025.html` — Momentous Whey
   Isolate "Below detection (#3)" → 30% of CR's level of concern (#3), per
   `cpl-data.json` (which explicitly notes NOT below detection).
2. `ebt-protein-powder-complete-guide-2025.html` — "Vega products (#16-19 -
   all contaminated)" (the fabricated Vega range Rule 4 warns about) → "Vega
   Premium Sport (#16 - 185%)", the only Vega product CR tested.
3. `body-fortress-protein-powder-lead-testing-budget-clean-2025.html` — ON
   Gold Standard Whey and Momentous Whey Isolate were labeled "Non-detect"
   for lead (comparison table, macro table "Heavy metals" row, prose, FAQ
   visible + JSON-LD). Rewrote to 56% / 30% / Dymatize Super Mass Gainer 25%
   per `cpl-data.json`; Body Fortress's own Clean Label Project non-detect
   claims left untouched (outside CR data, CLP-sourced). Bulk Supplements'
   CLP "Non-detect" row also left untouched (not in `cpl-data.json`).
4. `lead-in-protein-powder-list.html` — Vega Sport "1.86× the safe limit" →
   "185% of CR's level of concern" (Prop 65 framing, `_README` note 2).
5. `stats.html` — Truvani "92% of limit" → "93% of CR's level of concern"
   (`cpl-data.json` says 93).
6. `consumer-reports-new-protein-powder-tests-january-2026.html` — "of limit"
   → "of CR's level of concern" (Truvani 93%; the 42-93% range, visible +
   JSON-LD FAQ).

All 6 files: JSON-LD re-parsed OK, `dateModified` / visible updated text /
`sitemap.xml` `lastmod` bumped to 2026-10-16, IndexNow HTTP 200. Post-fix
`cpl-audit.py`: same 15 known flags, no regressions. (`stats.html` has no
visible "Last Updated" date to bump — only its JSON-LD.)

**Proposed, not approved this run (re-propose, don't re-derive):**
- **Item 7 — stale "OWYN is the only safe plant protein" claim on 32 files**
  (`grep -l -i -E "only safe plant|only plant protein safe|only plant
  protein (verified|cleared)"`). False since Jan 2026: Truvani Plant-Based
  (93%, "Better for daily") also cleared. Needs per-instance reading, not a
  blind replace. Suggested first batch: top 5 Bing-traffic pages.
- **Item 8 — unverifiable Garden of Life Grass Fed Whey "SAFE (Clean Label
  certified)"** on `chocolate-...:547`, and `cpl-audit.py`'s own hard-coded
  hint "Garden of Life WHEY = non-detect". Neither is in `cpl-data.json`;
  left for the owner.
- Groups 2-5 of the 08-27 Prop-65 backlog and the
  `prop-65-warning-protein-powder.html` premise rewrite remain open.

**Search data (Step 3):** The pasted `cleanproteinlist.com_*_10_16_2026.csv`
files are **Bing Webmaster** exports, not GSC. `Pages.csv`/`Queries.csv` are
GSC but appear to be an old (pre-Dec-2025, "premier protein lead" at pos ~4)
window — not used for trend. Bing clicks: ~60/day Apr-Aug → 1,272 in
Aug 20-Sep 16 → 863 in Sep 17-Oct 14 (-32%). The drop starts Sep 18, the day
after the Sep 15-17 CNAME delete/create churn: CTR fell first (~5% → 2.65%,
impressions flat), then impressions fell from Sep 25. Looks like a crawl/
availability hit, not an algorithmic verdict. Google is ~73 clicks/28d
(owner-reported 10/14). Recommended to the owner: check Bing Webmaster crawl
errors for Sep 15-20 and resubmit the sitemap in Bing.

**Strategic question raised (not a loop item):** owner asked whether to
trim/combine pages. Recommendation given: consolidate duplicated CR-table
pages (5 pages restate the same 23-row table) and near-duplicate pairs
(MuscleTech vanilla review → mass-gainer safety; vega-vs-orgain →
owyn-vs-vega-orgain-gol; body-fortress-vs-ON → Body Fortress page), mainly
to shrink the fact-drift surface, not for Google. GitHub Pages has no 301s —
merges need meta-refresh + canonical stubs (pattern:
`beyond-lead-heavy-metals-protein-powders.html`). Don't delete low-traffic
monetized pages on traffic alone. Left as a separate proposal.

**New standing rule:** Rule 10 (see `CPL-AUDIT-LOOP.md`).

---

## 2026-08-29 — New page: Protein Brand Safety Search Index (living, monthly-updated)

**Context:** Not part of the standing audit loop. Built at the user's request
following an outreach-kit spec (written by a separate Claude Opus session)
for a permanently-updated, no-year-slug page designed to be citable by
journalists: a ranked index of which protein brands site visitors are
researching for heavy-metal safety, sourced from the site's own embedded
poll (Formspree form `xeopynkp`), explicitly excluding quiz data per the
user's instruction.

**Shipped:**
- New page: `research/protein-brand-safety-index.html`. Reuses the design
  system from `research/protein-safety-consumer-survey-2026.html` (CSS vars,
  component classes) rather than the standard blog template, for visual
  consistency between the two research pages.
- Data pipeline: built a fresh Python normalization/dedup pass directly
  against the raw Formspree export
  (`formspree_xeopynkp_2026-08-29T20_56_59_export.json`, 3,407 raw
  submissions), independent of the outreach kit's own stated numbers — the
  kit claimed 3,409 raw submissions; my direct count was 3,407, so I used my
  own verified number throughout rather than the kit's.
  - Canonical brand matching: ~90 ordered regex rules, `\b` word-boundary
    disciplined (verified `\bsprout\b` does not false-match "Sprouts" the
    grocery retailer; verified `\bvega\b(?!n\b)` does not false-match
    "Vegan").
  - Dedup: consecutive same-brand submissions within a 6-minute window
    collapsed to one — same method already established on the July 2026
    survey page, for methodological consistency.
  - Result: 2,881 unique, brand-identifiable respondents (3,343 raw
    brand-answered submissions; 3,407 total raw poll submissions overall).
  - Rank-change column computed against the site's own previously-published
    July 14, 2026 baseline (top 15, n≈2,669).
- Page includes every section the outreach kit's spec required: above-the-
  fold summary sentence with period/total/top-3, a top-20 ranked table with
  movement indicators (▲/▼/NEW), a "What Moved" narrative, a method note
  kept above the fold-equivalent position (right after the table, not
  buried at the bottom), a copy-pasteable citation block, an email opt-in
  (`mailto:` link — no live-form backend exists for this yet, see below),
  a stated monthly-cadence policy, and a one-line no-pay-to-play neutrality
  rule.
- "What Moved" narrative: reported all rank/count movement factually. Only
  attached a causal explanation where one is actually verifiable —
  Orgain's continued #1 position and growth is noted alongside the real,
  already-covered-on-this-site Amazon and Costco class actions filed
  July 31, 2026. Did NOT invent a cause for Garden of Life's #7→#5 rise or
  Fairlife's #15→#11 rise — reported as real, measured movement with no
  attributed reason, since no corroborating event was found.
- Added `research/protein-brand-safety-index.html` to `sitemap.xml`
  (priority 0.95, matching the survey page). Bumped the survey page's own
  `lastmod` since it was edited (see below).
- Added a reciprocal link: a one-line callout on
  `research/protein-safety-consumer-survey-2026.html`'s hero pointing to
  the new index, so the two research pages cross-link. Did NOT touch the
  site-wide nav (`includes/header-blog.html` / `includes/header-root.html`)
  — that currently has a single "Research" link to the survey page; adding
  a second nav item is an IA decision I left for the user rather than
  deciding unilaterally.
- Ran IndexNow on both changed URLs (index page + survey page). HTTP 200.

**Not shipped / open questions for the user:**
- **Email opt-in has no real backend.** The page currently uses a
  `mailto:research@cleanproteinlist.com` link, not a working signup form.
  If a real "notify me" list is wanted, it needs either a new Formspree
  form (separate from the poll's `xeopynkp` endpoint, to avoid mixing
  signup data with poll data) or another list tool — not yet set up.
- **CSV twin not cross-checked.** A same-export CSV
  (`formspree_xeopynkp_2026-08-29T20_58_28_export.csv`) exists in
  Downloads alongside the JSON used; not yet diffed against it as a sanity
  check.
- **Nav/blog.html linking** — the new page isn't linked from `blog.html` or
  the site-wide nav yet; flagged above, left for the user's call.
- Monthly cadence is stated as site policy copy only — nothing automated
  will actually regenerate this page on a schedule; it's a manual audit-
  loop-style task for next month.

**Follow-up same day (2026-08-29, later):**
- **Garden of Life "what moved" cause upgraded from unattributed to real.**
  User flagged there's an existing Garden of Life lawsuit on the site.
  Found it: *DeHerrera v. Garden of Life* (C.D. Cal., No. 5:25-cv-03118),
  filed Dec 16, 2025 over undisclosed lead in Organic Plant-Based Protein,
  logged as "Pending" on `blog/protein-powder-recalls-2025.html`'s lawsuit
  tracker as of Aug 1, 2026, full breakdown at
  `blog/garden-of-life-lawsuit-lead-contamination-class-action-2025.html`.
  Rewrote the index page's Garden of Life paragraph to cite this real,
  verifiable case (noting it's not new this period, just still active) and
  linked both the tracker and the full breakdown article in-page.
- **Nav updated site-wide** to add an "Index" link next to "Research," per
  the user (blog.html link explicitly declined as unnecessary). The
  `includes/header-*.html` files turned out NOT to be live-included
  anywhere (no fetch/SSI reference found) — they're reference copies only.
  The real nav lives hard-coded in each page's own `<header>`; only 5 live
  pages actually carry the full nav with a "Research" link:
  `index.html`, `about.html`, `stats.html`, `tools.html`,
  `blog/lead-free-protein-brands-ranked-2025.html`. Updated all 5, plus
  both `includes/header-*.html` reference files for consistency. Most
  blog posts use a shorter header without "Research" at all, so they were
  left untouched.
- **Formspree opt-in endpoint received: `https://formspree.io/f/mrpgboog`.**
  Wired up a real form on the index page replacing the `mailto:` placeholder
  — email field (required) + optional "brand you're watching" field,
  honeypot (`_gotcha`) anti-spam field, `_subject`/`source` hidden fields,
  and a `_next` redirect back to the page with `?subscribed=1`, which a
  small inline script detects to swap the form for a thank-you message.
  This is a separate Formspree form ID from the poll's `xeopynkp` endpoint,
  so signup data won't mix with poll submissions.

---

## 2026-08-27 — Third full loop run: avoid-list restatements fixed, larger Prop-65 backlog sized

**Context:** One week after the 2026-08-21 run. Fresh `cpl-audit.py` output
was byte-for-byte identical to that run's post-fix state (7 data conflicts,
8 rank conflicts, 0 schema, 0 links, 2 monetization gaps) — nothing new
broke, every flagged item already diagnosed under Standing Rule 9 or the
legitimate-different-product splits log. Re-grepped the deferred "over the
safe/Prop 65 limit" backlog per the 08-21 entry's instruction and read
context on every match; it turned out larger than the ~34-file/~100-instance
estimate implied (~19 files with real violations once the legitimate
"LIMIT USE" tier-badge false positives were excluded). Presented a 5-group,
19-file proposal; site owner approved group 1 only ("Ship 1").

**Shipped (group 1 — avoid-list restatements, 6 files):** replaced "X.Yx
over (safe/the) limit" with "X% of CR's level of concern" (per Rule 0 /
`cpl-data.json` `_README` note 2) on `naked-nutrition-vegan-mass-gainer-
lead.html`, `new-year-fitness-guide-2026-safe-protein-home-gym.html` (×2),
`owyn-pro-elite-protein-powder-safety-only-safe-plant-protein-2025.html`,
`owyn-vs-vega-orgain-garden-of-life-safe-plant-protein-2025.html`,
`safest-mass-gainer-lead-tested-ranked-2026.html`, and
`safe-protein-powder-pregnancy-2025.html` (its full "Avoid List" — 10
products — plus 2 shorter recap lists, ~13 instances on that one file
alone). Values taken directly from `cpl-data.json` `pct_of_concern`
(Naked 1572%, Huel 1288%, Garden of Life Sport Organic 564%, Momentous
Plant 476%, MuscleMeds 247%, ON Serious Mass 202%/arsenic, Jocko Fuel 199%,
Vega Premium Sport 185%, Quest Protein Shake 161%, ON Gold Standard RTD
150%). Verified JSON-LD (all blocks parse) and div balance on all 6 files
before shipping. Bumped `dateModified`, visible "Last Updated" text, and
`sitemap.xml` `lastmod` to 2026-08-27 on all 6; submitted to IndexNow
(HTTP 200, accepted). Post-fix `cpl-audit.py` re-run: still 15 total flagged
items, all already-diagnosed/deferred — no regressions.

**Not shipped this run (groups 2-5 from the proposal, left for a future
run):**
- **Group 2 — the "Dymatize 25%/ON 56% mislabeled as Prop 65" template
  block**, found copy-pasted onto 4 more files beyond the one already fixed
  on 08-21: `lead-free-protein-brands-ranked-2025.html`,
  `muscletech-mass-gainer-safety.html` (3 instances total on that file),
  `muscletech-mass-gainer-vanilla-milkshake-review.html`,
  `muscletech-protein-powder-ranking-analysis.html`.
- **Group 3 — cumulative-exposure calculation boxes** needing the
  "×California's Prop 65 annualized threshold (182.5 µg/year)" framing
  (same pattern as the 08-21 teens-page fix): `huel-black-edition-lead-
  content.html` (a 3-scenario box where scenario 1 was already
  half-fixed to a label that doesn't actually match its own math — flagged
  for a careful fix, not a blind find/replace), `safe-protein-powder-
  pregnancy-2025.html` line ~494 (a separate pregnancy-specific calc, not
  touched today since it wasn't part of the approved group), `vega-vs-
  orgain-protein-powder-lead-testing-2025.html` (4 instances).
- **Group 4 — table row headers literally labeled "Times over safe
  limit"**: `naked-nutrition-vegan-mass-gainer-lead.html` line 413,
  `orgain-organic-protein-powder-lead-levels-consumer-reports-2025.html`
  line 425.
- **Group 5 — misc single instances**: `heavy-metals-protein-shakes-
  brands-2025-report.html`, `body-fortress-protein-powder-lead-testing-
  budget-clean-2025.html`, `ghost-protein-powder-lead-testing-2025.html`
  (×3), `consumer-reports-new-protein-powder-tests-january-2026.html`
  (×2, Jan-round Truvani/Ritual figures), `orgain-organic-protein-powder-
  lead-levels-consumer-reports-2025.html` (×1 more beyond its group-4
  header).
- **`prop-65-warning-protein-powder.html` — flagged as a separate,
  bigger problem, not part of any group.** This page's core framing
  conflates CR's "level of concern" benchmark with an actual Prop 65
  legal-warning-requirement determination ("16 out of 23 exceeded this
  limit," "if your protein has a Prop 65 warning, it contains lead above
  0.5 µg per day") — CR explicitly disclaims making that judgment. This
  needs a real rewrite of the page's premise, not a phrasing substitution.
  Recommend its own dedicated pass.

**GSC/Bing:** traffic flat week-over-week (~55/day avg both weeks) — one
week is too short to expect movement from precision-only fixes, no
red flags. Indexing status unchanged from 08-21: still 10 "Discovered —
not indexed" / 13 "Crawled — not indexed," same page lists.
`best-cheap-protein-powder-low-heavy-metals.html` is still stuck in
"Discovered — not indexed" a full week after being flagged for manual GSC
Request Indexing — Legion/Thorne (flagged the same day) cleared it, so this
one specifically may not have been manually requested yet. Flagged to site
owner again.

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
