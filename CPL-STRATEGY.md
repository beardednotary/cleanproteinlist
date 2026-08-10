# SEO/Fact Strategy Log — cleanproteinlist.com

Rolling log the audit loop (`CPL-AUDIT-LOOP.md`) reads before every run and
appends to after every run. Newest entry on top. Don't delete old entries —
future runs need to see what was already tried, rejected, or fixed.

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
