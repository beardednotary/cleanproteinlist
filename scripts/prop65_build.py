#!/usr/bin/env python3
"""Build the Prop 65 tracker pages from data/prop65.json.

Writes:
  prop65/index.html              tracker: stats, trend, top brands, searchable table
  prop65/brands/<slug>.html      one page per brand with >= MIN_BRAND_NOTICES notices,
                                 or with an existing CleanProteinList article
  data/prop65-brands.json        per-brand summary, for embedding in brand articles

Wording rule: a 60-day notice is an allegation. Pages say "a notice alleges",
never "contains unsafe levels".
"""
import collections
import datetime as dt
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "prop65.json"
OUT = ROOT / "prop65"
SITE = "https://cleanproteinlist.com"
MIN_BRAND_NOTICES = 3

# Known brands: (display name, regex matched against product text + violators,
# existing CleanProteinList article or None). Checked in order.
BRANDS = [
    ("Vega", r"\bvega\b", None),
    ("Orgain", r"\borgain\b", "blog/orgain-organic-protein-powder-lead-levels-consumer-reports-2025.html"),
    ("Garden of Life", r"garden of life", "blog/garden-of-life-lawsuit-lead-contamination-class-action-2025.html"),
    ("Sunwarrior", r"sun ?warrior", "blog/sunwarrior-protein-powder-lead-testing-safety-2026.html"),
    ("Truvani", r"\btruvani\b", "blog/truvani-protein-lead-testing-results-2026.html"),
    ("Isopure", r"\bisopure\b", "blog/isopure-protein-powder-lead-testing-safety-2025.html"),
    ("Ascent", r"\bascent\b", "blog/ascent-protein-powder-lead-testing-safety-2025.html"),
    ("OWYN", r"\bowyn\b", "blog/owyn-pro-elite-protein-powder-safety-only-safe-plant-protein-2025.html"),
    ("Quest", r"\bquest\b", "blog/quest-protein-shake-lawsuit-lead-prop65-2026.html"),
    # Nestle's Boost only; "boost" alone also matches Pro-Boost, Mental Boost, NatureMAX Boost...
    ("Boost", r"^boost (high|glucose|original|plus|very|kids|breeze|max|advanced)|nestl.*\bboost\b", "blog/boost-protein-shakes-safety-lead-testing-2025.html"),
    ("Ensure", r"\bensure\b", "blog/ensure-protein-shakes-safety-lead-testing-2025.html"),
    ("Optimum Nutrition", r"optimum nutrition", "blog/optimum-nutrition-gold-standard-whey-lead-testing-results-2025.html"),
    ("Naked Nutrition", r"\bnaked (nutrition|whey|pea|rice|mass|vegan)", "blog/naked-nutrition-vegan-mass-gainer-lead.html"),
    ("Premier Protein", r"premier protein", "blog/premier-protein-lead-testing.html"),
    ("Muscle Milk", r"muscle milk", "blog/muscle-milk-lead-testing-safety-analysis-2025.html"),
    ("Ghost", r"\bghost\b", "blog/ghost-protein-powder-lead-testing-2025.html"),
    ("Six Star", r"six star", "blog/six-star-protein-powder-lead-testing-safety-2025.html"),
    ("BSN", r"\bbsn\b|syntha-6", "blog/bsn-syntha-6-safety-analysis.html"),
    ("Legion", r"\blegion athletics|\blegion whey", "blog/legion-whey-protein-lead-testing-safety-2026.html"),
    ("NOW Sports", r"\bnow (sports|foods)\b", "blog/now-sports-whey-protein-lead-testing-safety-2026.html"),
    ("Nutricost", r"\bnutricost\b", "blog/nutricost-whey-protein-lead-testing-safety-2026.html"),
    ("Transparent Labs", r"transparent labs", "blog/transparent-labs-whey-protein-lead-testing-safety-2026.html"),
    ("Myprotein", r"\bmy ?protein\b", "blog/myprotein-impact-whey-lead-testing-safety-2026.html"),
    ("Levels", r"\blevels (grass|protein|whey)", "blog/levels-protein-powder-lead-testing-safety-2026.html"),
    ("Jocko", r"\bjocko\b", "blog/jocko-protein-lawsuit-lead-contamination-2026.html"),
    ("Huel", r"\bhuel\b", "blog/huel-black-edition-lead-content.html"),
    ("Kirkland Signature", r"kirkland", "blog/kirkland-vs-elevation-protein-lead-testing.html"),
    ("KOS", r"\bkos\b", None),
    ("Sprout Living", r"sprout living", None),
    ("Ka'Chava", r"ka.?chava", None),
    ("Nuzest", r"\bnuzest\b", None),
    ("Amazing Grass", r"amazing grass", None),
    ("Ritual", r"\britual\b", None),
    ("Kencko", r"\bkencko\b", None),
    ("Koia", r"\bkoia\b", None),
    ("Arbonne", r"\barbonne\b", None),
    ("Seven Sundays", r"seven sundays", None),
    ("No Cow", r"\bno cow\b", None),
    ("Aloha", r"\baloha\b", None),
    ("Legendary Foods", r"legendary (foods|protein)", None),
    ("TRUBAR", r"\btru ?bar\b|tru brands", None),
    ("Zen Principle", r"zen principle", None),
    ("Taylor Farms", r"taylor (farms|fresh)", None),
    ("Protein Puck", r"protein puck|puck pack", None),
    ("Nutrient Survival", r"nutrient survival|nutrient foods", None),
    ("Greens First", r"greens first", None),
    ("Vital Proteins", r"vital proteins", None),
    ("Kroger (store brand)", r"^kroger\b", None),
    ("Sprouts (store brand)", r"^sprouts\b", None),
]

# Sellers named alongside the brand; never treated as the brand.
RETAILERS = re.compile(
    r"amazon|walmart|target|costco|cvs|walgreens|kroger|ralphs|safeway|albertsons|vons|"
    r"whole foods|sprouts|trader joe|iherb|gnc|vitamin shoppe|the vitamin|rite aid|"
    r"tjx|marshalls|ross stores|grocery outlet|smart ?& ?final|99 cents|dollar|bj.?s|"
    r"sam.?s|meijer|h-?e-?b|stater|raley|save mart|lucky|nordstrom|thrive market|"
    r"vitacost|sephora|ulta|ebay|ebay|wayfair|chewy|instacart|doordash|gopuff|"
    r"bodybuilding\.com|lazada|7-eleven|circle k",
    re.I,
)
SUFFIX = re.compile(
    r",?\s*\b(inc|llc|l\.l\.c|co|corp|corporation|company|ltd|limited|lp|llp|pbc)\b\.?",
    re.I,
)

CATEGORIES = [
    ("Bar", r"\bbars?\b"),
    ("Shake / drink", r"\bshakes?\b|\bdrinks?\b|beverage|ready.to.drink|\brtd\b|smoothie|\bmilk\b|coffee"),
    ("Powder", r"powder|whey|isolate|\bblend\b|gainer|scoops?|\bprotein\b.*\b(lb|lbs|oz|g)\b|plant.based protein|pea protein|meal replacement"),
    ("Snack / food", r"chips?|puffs?|cereal|cookies?|pretzel|bites?|crisps?|pancake|oats?|granola|pasta|bowl|noodle|jerky|bread|waffle|bark|candy|popcorn"),
]

CHEM_GROUPS = [
    ("Lead", r"\blead\b"),
    ("Cadmium", r"cadmium"),
    ("Arsenic", r"arsenic"),
    ("Mercury", r"mercury"),
    ("PFOA / PFOS", r"pfoa|pfos|perfluoro"),
    ("Acrylamide", r"acrylamide"),
]


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower().replace("'", "")).strip("-")


def brand_of(n: dict) -> tuple[str, str | None]:
    hay = f"{n['source']} {n['violators']}"
    for name, rx, article in BRANDS:
        if re.search(rx, hay, re.I):
            return name, article
    for v in re.split(r";", n["violators"]):
        v = v.strip()
        dba = re.search(r"(?:dba|d/b/a)\s+(.+)", v, re.I)
        if dba:
            v = dba.group(1)
        v = re.sub(r"individually and.*", "", v, flags=re.I)
        if not v or RETAILERS.search(v):
            continue
        prev = None
        while prev != v:
            prev, v = v, SUFFIX.sub("", v).strip(" ,.")
        if v:
            return v, None
    return "Unknown", None


def category_of(n: dict) -> str:
    for name, rx in CATEGORIES:
        if re.search(rx, n["source"], re.I):
            return name
    return "Other"


def chem_groups(n: dict) -> list[str]:
    joined = " ".join(n["chemicals"])
    out = [g for g, rx in CHEM_GROUPS if re.search(rx, joined, re.I)]
    return out or ["Other"]


def status_of(n: dict) -> str:
    if any("withdraw" in f.lower() for f in n["flags"]) or "withdraw" in n["comments"].lower():
        return "Withdrawn"
    if n["settlements"]:
        return "Settled"
    if n["complaints"]:
        return "Complaint filed"
    return "Notice only"


def fmt_date(iso: str) -> str:
    d = dt.date.fromisoformat(iso)
    return d.strftime("%b %-d, %Y")


HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="article">
<link rel="canonical" href="{url}">
<link rel="stylesheet" href="{up}style.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6RL8K3H3ZC"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-6RL8K3H3ZC');</script>
<script type="application/ld+json">{schema}</script>
<style>
.p65-wrap{{max-width:980px;margin:0 auto;padding:24px 16px 48px}}
.p65-wrap h1{{font-size:clamp(1.7rem,4vw,2.4rem);line-height:1.15;margin:.2em 0 .4em}}
.p65-eyebrow{{font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted,#6b7167)}}
.p65-answer{{font-size:1.15rem;line-height:1.6;margin:0 0 1.2em}}
.p65-note{{border-left:4px solid var(--accent,#e07a2f);background:var(--cream,#f8f5ef);padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;line-height:1.6}}
.p65-stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:20px 0}}
.p65-stat{{border:1px solid var(--rule,#d8d4cc);border-radius:10px;padding:14px}}
.p65-stat strong{{display:block;font-size:1.7rem;color:var(--green,#2d6a4f)}}
.p65-stat span{{font-size:.85rem;color:var(--muted,#6b7167)}}
.p65-bars{{display:flex;align-items:flex-end;gap:3px;height:120px;margin:12px 0 4px;border-bottom:1px solid var(--rule,#d8d4cc)}}
.p65-bars div{{flex:1;background:var(--green-lt,#52b788);border-radius:3px 3px 0 0;min-height:2px}}
.p65-bars-lbl{{display:flex;justify-content:space-between;font-size:.75rem;color:var(--muted,#6b7167)}}
.p65-scroll{{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:12px 0}}
.p65-table{{width:100%;border-collapse:collapse;font-size:.9rem;min-width:640px}}
.p65-table th,.p65-table td{{text-align:left;padding:8px 10px;border-bottom:1px solid var(--rule,#d8d4cc);vertical-align:top}}
.p65-table th{{font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted,#6b7167)}}
.p65-filters{{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}}
.p65-filters input,.p65-filters select{{padding:8px 10px;border:1px solid var(--rule,#d8d4cc);border-radius:8px;font:inherit;min-width:0;flex:1 1 160px}}
.p65-tag{{display:inline-block;font-size:.75rem;padding:2px 8px;border-radius:999px;background:var(--cream,#f8f5ef);margin:1px 2px 1px 0;white-space:nowrap}}
.p65-small{{font-size:.85rem;color:var(--muted,#6b7167)}}
.p65-wrap h2{{margin-top:1.8em}}
</style>
</head>
<body>
    <header>
        <div class="container">
            <a href="{up}index.html" class="logo">Clean Protein List</a>
            <button class="hamburger" id="hamburger-btn" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
            <nav id="mobile-nav">
                <a href="{up}index.html">Home</a>
                <a href="{up}blog.html#protein-articles">Protein</a>
                <a href="{up}blog.html#creatine-articles">Creatine</a>
                <a href="{up}prop65/">Prop 65 Tracker</a>
                <a href="{up}tools.html">Tools</a>
                <a href="{up}about.html">About</a>
            </nav>
        </div>
    </header>
"""

FOOT = """
    <footer>
        <div class="container">
            <p>&copy; 2026 Clean Protein List. Independent heavy metal testing database.</p>
            <p>
                <a href="{up}index.html">Home</a> |
                <a href="{up}prop65/">Prop 65 Tracker</a> |
                <a href="{up}blog.html">Articles</a> |
                <a href="{up}about.html">About</a> |
                <a href="mailto:hello@cleanproteinlist.com">Contact</a>
            </p>
        </div>
    </footer>
    <script src="{up}includes/mobile-menu.js"></script>
</body>
</html>
"""

WHAT_IS = """
<div class="p65-note">
  <strong>What a 60-day notice is, and isn't.</strong> Under California&rsquo;s Proposition 65, a private
  group can send a company a 60-day notice alleging that a product exposes consumers to a listed chemical
  without the required warning. It is an <strong>allegation</strong>, not a lab result published by the state, not a
  recall, and not a finding that a product is unsafe. Many notices end in a settlement where the company adds a
  warning label or pays a fee, without admitting anything. A notice tells you someone tested a product and
  thought it needed a warning; it doesn&rsquo;t tell you how much of the chemical was found.
</div>
"""


def schema(title: str, desc: str, url: str, updated: str) -> str:
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": title,
            "description": desc,
            "url": url,
            "dateModified": updated,
            "creator": {"@type": "Organization", "name": "Clean Protein List", "url": SITE},
            "isBasedOn": "https://oag.ca.gov/prop65/60-day-notice-search",
            "license": "https://creativecommons.org/licenses/by/4.0/",
        }
    )


def notice_row(n: dict, show_brand: bool) -> str:
    tags = "".join(f'<span class="p65-tag">{esc(c)}</span>' for c in n["_chem"])
    brand = f"<td>{esc(n['_brand'])}</td>" if show_brand else ""
    return (
        f"<tr><td>{esc(fmt_date(n['date']))}</td>{brand}<td>{esc(n['source'])}</td>"
        f"<td>{tags}</td><td>{esc(n['_status'])}</td>"
        f'<td><a href="{esc(n["url"])}" rel="nofollow">{esc(n["ag"])}</a></td></tr>'
    )


def chem_phrase(counter: collections.Counter) -> str:
    parts = [f"{k.lower() if k != 'PFOA / PFOS' else 'PFOA/PFOS'} ({v})" for k, v in counter.most_common()]
    return ", ".join(parts[:-1]) + (" and " if len(parts) > 1 else "") + parts[-1]


def build_brand_page(name: str, items: list[dict], article: str | None, updated_h: str, updated_iso: str) -> str:
    slug = slugify(name)
    url = f"{SITE}/prop65/brands/{slug}.html"
    items = sorted(items, key=lambda n: n["date"], reverse=True)
    chems = collections.Counter(c for n in items for c in n["_chem"])
    cats = collections.Counter(n["_cat"] for n in items)
    status = collections.Counter(n["_status"] for n in items)
    first, last = fmt_date(items[-1]["date"]), fmt_date(items[0]["date"])
    count = len(items)
    noun = "notice" if count == 1 else "notices"
    named = [("PFOA/PFOS" if k == "PFOA / PFOS" else k) for k, _ in chems.most_common() if k != "Other"]
    title = f"{name} Prop 65 Notices: {count} Alleging {' & '.join(named[:2]) or 'Listed Chemicals'} (2026)"
    desc = (
        f"{count} California Prop 65 60-day {noun} have named {name} protein products since 2025, "
        f"alleging {chem_phrase(chems)}. Every notice, its status, and what it means."
    )
    answer = (
        f"<strong>{count} California Prop 65 60-day {noun} named {esc(name)} protein products between "
        f"{first} and {last}</strong>, alleging {esc(chem_phrase(chems))} without the required warning. "
        f"{status.get('Settled', 0)} of them show a settlement and {status.get('Complaint filed', 0)} more show a "
        f"court complaint. A notice is an allegation, not a lab result or recall."
    )
    article_link = (
        f'<p>For what independent lab testing (Consumer Reports, Clean Label Project) found, see our '
        f'<a href="../../{esc(article)}">{esc(name)} lead testing analysis</a>.</p>'
        if article
        else ""
    )
    cat_line = ", ".join(f"{k.lower()} ({v})" for k, v in cats.most_common())
    rows = "\n".join(notice_row(n, show_brand=False) for n in items)
    body = f"""
<main class="p65-wrap">
  <div class="p65-eyebrow"><a href="../">Prop 65 Tracker</a> &rsaquo; {esc(name)}</div>
  <h1>Does {esc(name)} Have a Prop 65 Notice?</h1>
  <p class="p65-answer">{answer}</p>
  <p class="p65-small">Updated {esc(updated_h)} from the California Attorney General&rsquo;s 60-Day Notice database. Products named: {esc(cat_line)}.</p>
  {article_link}
  {WHAT_IS}
  <h2>Every {esc(name)} notice</h2>
  <div class="p65-scroll"><table class="p65-table">
    <thead><tr><th>Filed</th><th>Product named</th><th>Chemical alleged</th><th>Status</th><th>AG notice</th></tr></thead>
    <tbody>
{rows}
    </tbody>
  </table></div>
  <p class="p65-small">Product names are copied from each notice as filed. &ldquo;Status&rdquo; reflects whether the AG database lists a complaint, settlement or withdrawal for that notice. Click an AG number for the full notice and PDF.</p>
  <p><a href="../">&larr; All brands in the Prop 65 protein tracker</a></p>
</main>
"""
    return (
        HEAD.format(title=esc(title), desc=esc(desc), url=url, up="../../", schema=schema(title, desc, url, updated_iso))
        + body
        + FOOT.format(up="../../")
    )


def build_index(notices: list[dict], brand_pages: dict, updated_h: str, updated_iso: str) -> str:
    url = f"{SITE}/prop65/"
    total = len(notices)
    today = dt.date.today()
    last12 = [n for n in notices if dt.date.fromisoformat(n["date"]) > today - dt.timedelta(days=365)]
    chems = collections.Counter(c for n in notices for c in n["_chem"])
    cats = collections.Counter(n["_cat"] for n in notices)
    settled = sum(n["_status"] == "Settled" for n in notices)
    brands = collections.Counter(n["_brand"] for n in notices if n["_brand"] != "Unknown")
    since = fmt_date(min(n["date"] for n in notices))

    # monthly trend
    months = collections.Counter(n["date"][:7] for n in notices)
    keys = sorted(months)
    peak = max(months.values())
    bars = "".join(
        f'<div style="height:{max(2, round(months[k] / peak * 100))}%" title="{k}: {months[k]} notices"></div>'
        for k in keys
    )

    top_rows = []
    for b, c in brands.most_common(25):
        link = f'<a href="brands/{brand_pages[b]}">{esc(b)}</a>' if b in brand_pages else esc(b)
        bc = collections.Counter(ch for n in notices if n["_brand"] == b for ch in n["_chem"])
        latest = max(n["date"] for n in notices if n["_brand"] == b)
        tags = "".join(f'<span class="p65-tag">{esc(k)}</span>' for k, _ in bc.most_common())
        top_rows.append(f"<tr><td>{link}</td><td>{c}</td><td>{tags}</td><td>{esc(fmt_date(latest))}</td></tr>")

    table_data = [
        {
            "d": n["date"],
            "b": n["_brand"],
            "s": n["source"],
            "c": n["_chem"],
            "t": n["_cat"],
            "st": n["_status"],
            "ag": n["ag"],
            "u": brand_pages.get(n["_brand"], ""),
        }
        for n in sorted(notices, key=lambda n: n["date"], reverse=True)
    ]

    title = f"Prop 65 Protein Tracker: {total} Notices for Lead, Cadmium & More Since 2025"
    desc = (
        f"Every California Prop 65 60-day notice naming a protein product since {since}: {total} notices, "
        f"{chems.get('Lead', 0)} alleging lead. Search by brand, product and chemical. Updated weekly."
    )
    answer = (
        f"<strong>Since {since}, {total} California Prop 65 60-day notices have named protein products</strong> "
        f"(powders, shakes, bars and protein snacks), {len(last12)} of them in the last 12 months. "
        f"{chems.get('Lead', 0)} allege lead, {chems.get('Cadmium', 0)} cadmium and {chems.get('PFOA / PFOS', 0)} PFOA/PFOS. "
        f"{settled} have reached a settlement. Search the full list below by brand or product."
    )
    top = "\n".join(top_rows)
    chem_opts = "".join(f'<option>{esc(k)}</option>' for k, _ in chems.most_common())
    cat_opts = "".join(f'<option>{esc(k)}</option>' for k, _ in cats.most_common())
    body = f"""
<main class="p65-wrap">
  <div class="p65-eyebrow">Original data &middot; Updated weekly &middot; Last update {esc(updated_h)}</div>
  <h1>Prop 65 Protein Tracker: Lead &amp; Heavy Metal Notices</h1>
  <p class="p65-answer">{answer}</p>

  <div class="p65-stats">
    <div class="p65-stat"><strong>{total}</strong><span>notices since {esc(since)}</span></div>
    <div class="p65-stat"><strong>{len(last12)}</strong><span>in the last 12 months</span></div>
    <div class="p65-stat"><strong>{chems.get('Lead', 0)}</strong><span>allege lead</span></div>
    <div class="p65-stat"><strong>{settled}</strong><span>settled</span></div>
  </div>

  {WHAT_IS}

  <h2>Notices per month</h2>
  <div class="p65-bars" role="img" aria-label="Prop 65 protein notices per month">{bars}</div>
  <div class="p65-bars-lbl"><span>{esc(keys[0])}</span><span>{esc(keys[-1])}</span></div>
  <p class="p65-small">The most recent month is usually incomplete: notices appear in the AG database a few weeks after filing.</p>

  <h2>Brands named most often</h2>
  <div class="p65-scroll"><table class="p65-table">
    <thead><tr><th>Brand</th><th>Notices</th><th>Chemicals alleged</th><th>Latest</th></tr></thead>
    <tbody>
{top}
    </tbody>
  </table></div>

  <h2>Search every notice</h2>
  <div class="p65-filters">
    <input id="q" type="search" placeholder="Brand or product, e.g. Orgain, whey, bar" aria-label="Search brand or product">
    <select id="chem" aria-label="Chemical"><option value="">All chemicals</option>{chem_opts}</select>
    <select id="cat" aria-label="Product type"><option value="">All product types</option>{cat_opts}</select>
  </div>
  <p class="p65-small" id="count"></p>
  <div class="p65-scroll"><table class="p65-table">
    <thead><tr><th>Filed</th><th>Brand</th><th>Product named</th><th>Chemical</th><th>Status</th><th>AG notice</th></tr></thead>
    <tbody id="rows"></tbody>
  </table></div>

  <h2>How this tracker works</h2>
  <p>Every week we query the California Attorney General&rsquo;s public <a href="https://oag.ca.gov/prop65/60-day-notice-search" rel="nofollow">60-Day Notice Search</a> for notices whose product description mentions &ldquo;protein&rdquo;, and record each notice once (the AG lists a notice once per chemical). Brand is taken from the product name where it matches a known brand, otherwise from the first company named that isn&rsquo;t a retailer, so a manufacturer may appear instead of a brand. Status reflects whether the AG lists a complaint, settlement or withdrawal. We don&rsquo;t edit or interpret the product names.</p>
  <p>Want the lab numbers? Notices rarely include them. For measured lead levels, see our <a href="../blog/lead-free-protein-brands-ranked-2025.html">Consumer Reports lead rankings</a>.</p>
  <p class="p65-small">Data: California Department of Justice, Office of the Attorney General. Compiled by Clean Protein List; free to cite with a link.</p>
</main>
<script>
const D={json.dumps(table_data, separators=(",", ":"))};
const q=document.getElementById('q'),ch=document.getElementById('chem'),ct=document.getElementById('cat'),tb=document.getElementById('rows'),cnt=document.getElementById('count');
const e=s=>String(s).replace(/[&<>"]/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}})[c]);
const fd=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{{month:'short',day:'numeric',year:'numeric'}});
function draw(){{const t=q.value.trim().toLowerCase(),c=ch.value,k=ct.value;
 const r=D.filter(n=>(!t||(n.b+' '+n.s).toLowerCase().includes(t))&&(!c||n.c.includes(c))&&(!k||n.t===k));
 cnt.textContent=r.length+' of '+D.length+' notices';
 tb.innerHTML=r.slice(0,300).map(n=>'<tr><td>'+fd(n.d)+'</td><td>'+(n.u?'<a href="brands/'+n.u+'">'+e(n.b)+'</a>':e(n.b))+'</td><td>'+e(n.s)+'</td><td>'+n.c.map(x=>'<span class="p65-tag">'+e(x)+'</span>').join('')+'</td><td>'+e(n.st)+'</td><td><a rel="nofollow" href="https://oag.ca.gov/prop65/60-Day-Notice-'+n.ag+'">'+n.ag+'</a></td></tr>').join('')+(r.length>300?'<tr><td colspan="6" class="p65-small">Showing the 300 most recent matches. Narrow your search to see more.</td></tr>':'');}}
[q,ch,ct].forEach(x=>x.addEventListener('input',draw));draw();
</script>
"""
    return (
        HEAD.format(title=esc(title), desc=esc(desc), url=url, up="../", schema=schema(title, desc, url, updated_iso))
        + body
        + FOOT.format(up="../")
    )


def main() -> None:
    store = json.loads(DATA.read_text())
    updated_iso = store["updated"]
    updated_h = fmt_date(updated_iso[:10])
    notices = [n for n in store["notices"].values() if n.get("date")]
    articles = {}
    for n in notices:
        n["_brand"], art = brand_of(n)
        if art:
            articles[n["_brand"]] = art
        n["_cat"] = category_of(n)
        n["_chem"] = chem_groups(n)
        n["_status"] = status_of(n)

    by_brand = collections.defaultdict(list)
    for n in notices:
        by_brand[n["_brand"]].append(n)

    (OUT / "brands").mkdir(parents=True, exist_ok=True)
    for old in (OUT / "brands").glob("*.html"):
        old.unlink()
    brand_pages = {}
    for b, items in by_brand.items():
        if b == "Unknown" or (len(items) < MIN_BRAND_NOTICES and b not in articles):
            continue
        slug = slugify(b)
        brand_pages[b] = f"{slug}.html"
        (OUT / "brands" / f"{slug}.html").write_text(
            build_brand_page(b, items, articles.get(b), updated_h, updated_iso)
        )

    (OUT / "index.html").write_text(build_index(notices, brand_pages, updated_h, updated_iso))

    summary = {
        b: {
            "notices": len(items),
            "latest": max(n["date"] for n in items),
            "chemicals": dict(collections.Counter(c for n in items for c in n["_chem"])),
            "page": f"/prop65/brands/{brand_pages[b]}" if b in brand_pages else None,
        }
        for b, items in sorted(by_brand.items())
    }
    (ROOT / "data" / "prop65-brands.json").write_text(json.dumps(summary, indent=1) + "\n")
    update_sitemap(brand_pages, by_brand, max(n["date"] for n in notices))
    print(f"index + {len(brand_pages)} brand pages from {len(notices)} notices")


def update_sitemap(brand_pages: dict, by_brand: dict, latest: str) -> None:
    """Replace the tracker's sitemap entries; lastmod = newest notice on that page."""
    path = ROOT / "sitemap.xml"
    xml = path.read_text()
    xml = re.sub(r"\s*<url><loc>https://cleanproteinlist\.com/prop65/[^\n]*</url>", "", xml)
    entries = [f"    <url><loc>{SITE}/prop65/</loc><lastmod>{latest}</lastmod><priority>0.95</priority></url>"]
    for b, page in sorted(brand_pages.items(), key=lambda kv: kv[1]):
        last = max(n["date"] for n in by_brand[b])
        entries.append(f"    <url><loc>{SITE}/prop65/brands/{page}</loc><lastmod>{last}</lastmod><priority>0.7</priority></url>")
    xml = xml.replace("</urlset>", "\n".join(entries) + "\n</urlset>")
    path.write_text(xml)


if __name__ == "__main__":
    main()
