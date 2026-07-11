/* =========================================================================
   CLEAN PROTEIN LIST — SHARED BRAND DATASET  (single source of truth)
   -------------------------------------------------------------------------
   Loaded by BOTH brand-finder.html and brand-database.html.
   Update brands in ONE place here — both finders stay in sync.

   Paths are relative to the site ROOT (brand-finder.html & brand-database.html
   both live at root), so article links use the "blog/..." prefix.

   Field reference:
     name    display name
     type    Whey | Plant | RTD | Collagen | Meal
     rating  safe | caution | avoid | untested
     lead    Non-detect | Low | Moderate | High | Very high | — | Not yet tested
     price   per-serving number (approx) or null
     cert    short status/certification note (or '')
     url     article path, or null when there's no page yet
     alt     {name,url} shown when url is null (the "try this instead" pick)
     kw      extra search keywords
   Only figures sourced from CPL's own published articles are included.
   ========================================================================= */

window.CPL_BRANDS_META = {
  ratings: {
    safe:     { sym: '✅', label: 'Safe',           rank: 1 },
    caution:  { sym: '⚠️', label: 'Caution',        rank: 2 },
    avoid:    { sym: '❌', label: 'Avoid',          rank: 3 },
    untested: { sym: '❓', label: 'Not yet tested', rank: 4 }
  },
  leadRank:  { 'Non-detect':1,'Low':2,'Moderate':3,'High':4,'Very high':5,'—':6,'Not yet tested':7 },
  leadClass: { 'Non-detect':'lb-nd','Low':'lb-low','Moderate':'lb-mod','High':'lb-high','Very high':'lb-vhigh','—':'lb-none','Not yet tested':'lb-none' },
  altWhey:  { name: 'Dymatize ISO100',  url: 'blog/dymatize-iso-100-safety-analysis.html' },
  altPlant: { name: 'Truvani Plant Protein', url: 'blog/truvani-protein-lead-testing-results-2026.html' },
  // Safe plant-based RTD (distinct product line from powders — never transfer results between them)
  altRTD:   { name: 'OWYN Pro Elite (RTD)',  url: 'blog/owyn-pro-elite-protein-powder-safety-only-safe-plant-protein-2025.html' }
};

(function () {
  var ALT_WHEY  = window.CPL_BRANDS_META.altWhey;
  var ALT_PLANT = window.CPL_BRANDS_META.altPlant;

  window.CPL_BRANDS = [
    // ---- SAFE ----
    { name:'MuscleTech 100% Mass Gainer', type:'Whey', rating:'safe', lead:'Non-detect', price:0.94, cert:'CR #1 safest', url:'blog/muscletech-mass-gainer-safety.html', kw:'mass gainer muscle tech' },
    { name:'Dymatize ISO100', type:'Whey', rating:'safe', lead:'Low', price:1.09, cert:'NSF Certified for Sport · Informed', url:'blog/dymatize-iso-100-safety-analysis.html', kw:'iso100 isolate' },
    { name:'Optimum Nutrition Gold Standard', type:'Whey', rating:'safe', lead:'Low', price:0.75, cert:'Informed Sport (select)', url:'blog/optimum-nutrition-gold-standard-whey-lead-testing-results-2025.html', kw:'on optimum gold standard' },
    { name:'OWYN Pro Elite (RTD)', type:'RTD', rating:'safe', lead:'Non-detect', price:1.33, cert:'Plant-based RTD · NSF Certified for Sport', url:'blog/owyn-pro-elite-protein-powder-safety-only-safe-plant-protein-2025.html', kw:'owyn vegan pea plant rtd shake' },
    { name:'Body Fortress Whey', type:'Whey', rating:'safe', lead:'Non-detect', price:0.67, cert:'Clean Label Project', url:'blog/body-fortress-protein-powder-lead-testing-budget-clean-2025.html', kw:'budget walmart' },
    { name:'Momentous Whey', type:'Whey', rating:'safe', lead:'Low', price:2.50, cert:'NSF Certified for Sport', url:'blog/momentous-protein-safety-analysis.html', kw:'grass fed' },
    { name:'Clean Simple Eats', type:'Whey', rating:'safe', lead:'Low', price:null, cert:'CR Jan 2026 — safest chocolate whey', url:'blog/consumer-reports-new-protein-powder-tests-january-2026.html', kw:'cse simple eats' },
    { name:'Truvani Plant Protein', type:'Plant', rating:'safe', lead:'Low', price:null, cert:'CR Jan 2026 — passed (plant powder)', url:'blog/truvani-protein-lead-testing-results-2026.html', kw:'truvani vani plant powder' },

    // ---- CAUTION ----
    { name:'Orgain Organic', type:'Plant', rating:'caution', lead:'Moderate', price:null, cert:'CR: OK occasionally · lawsuit filed', url:'blog/costco-orgain-protein-powder-lawsuit-heavy-metals-2026.html', kw:'organic costco' },
    { name:'Premier Protein', type:'RTD', rating:'caution', lead:'Moderate', price:null, cert:'See powder vs. liquid analysis', url:'blog/premier-protein-lead-testing.html', kw:'costco shake' },
    { name:'Fairlife Core Power', type:'RTD', rating:'caution', lead:'Moderate', price:null, cert:'See analysis', url:'blog/fairlife-protein-shakes-safety-lead-testing-2025.html', kw:'core power elite' },
    { name:'Ritual Essential', type:'Plant', rating:'caution', lead:'Moderate', price:null, cert:'CR Jan 2026 passed · AG notice reported', url:'blog/consumer-reports-new-protein-powder-tests-january-2026.html', kw:'daily shake' },
    { name:'Muscle Milk', type:'RTD', rating:'caution', lead:'Moderate', price:null, cert:'See analysis', url:'blog/muscle-milk-lead-testing-safety-analysis-2025.html', kw:'musclemilk' },

    // ---- AVOID ----
    { name:'Garden of Life Organic', type:'Plant', rating:'avoid', lead:'Very high', price:null, cert:'~564% over limit · lawsuit', url:'blog/garden-of-life-lawsuit-lead-contamination-class-action-2025.html', kw:'gol' },
    { name:'Jocko Fuel Mölk (Chocolate)', type:'Whey', rating:'avoid', lead:'High', price:null, cert:'265% over Prop 65 · lawsuit', url:'blog/jocko-protein-lawsuit-lead-contamination-2026.html', kw:'molk clean fuel' },
    { name:'Naked Nutrition (Vegan Gainer)', type:'Plant', rating:'avoid', lead:'Very high', price:null, cert:'Ranked worst tested', url:'blog/naked-nutrition-vegan-mass-gainer-lead.html', kw:'naked whey pea' },
    { name:'Vega Sport', type:'Plant', rating:'avoid', lead:'Very high', price:null, cert:'High lead in CR testing', url:'blog/vega-vs-orgain-protein-powder-lead-testing-2025.html', kw:'vega one' },
    { name:'Quest Protein Shakes (RTD)', type:'RTD', rating:'avoid', lead:'High', price:null, cert:'Prop 65 lawsuit · milkshake ~580% over', url:'blog/quest-protein-shake-lawsuit-lead-prop65-2026.html', kw:'quest milkshake rtd' },

    // ---- HAS PAGE, emerging/untested analysis ----
    { name:'Isopure Zero Carb', type:'Whey', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/isopure-protein-powder-lead-testing-safety-2025.html', kw:'zero carb isolate' },
    { name:'Ascent Native Fuel', type:'Whey', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/ascent-protein-powder-lead-testing-safety-2025.html', kw:'native fuel' },
    { name:'Ghost Protein', type:'Whey', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/ghost-protein-powder-lead-testing-2025.html', kw:'oreo chips ahoy' },
    { name:'RYSE Loaded Protein', type:'Whey', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/ryse-protein-powder-lead-testing-2025.html', kw:'skippy' },
    { name:'Nurri Ultra-Filtered', type:'RTD', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/nurri-protein-shake-lead-testing-safety-2026.html', kw:'viral milkshake' },
    { name:'Huel Black Edition', type:'Plant', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/huel-black-edition-lead-content.html', kw:'meal replacement' },
    { name:'BSN Syntha-6', type:'Whey', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/bsn-syntha-6-safety-analysis.html', kw:'syntha 6' },
    { name:'Six Star Pro Nutrition', type:'Whey', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/six-star-protein-powder-lead-testing-safety-2025.html', kw:'six star' },
    { name:'Ensure', type:'RTD', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/ensure-protein-shakes-safety-lead-testing-2025.html', kw:'ensure medical' },
    { name:'Boost', type:'RTD', rating:'untested', lead:'—', price:null, cert:'Analysis available', url:'blog/boost-protein-shakes-safety-lead-testing-2025.html', kw:'boost nestle' },
    { name:'Kirkland Signature', type:'Whey', rating:'untested', lead:'—', price:null, cert:'See Kirkland vs Elevation', url:'blog/kirkland-vs-elevation-protein-lead-testing.html', kw:'costco' },
    { name:'Elevation (Aldi)', type:'Whey', rating:'untested', lead:'—', price:null, cert:'See Kirkland vs Elevation', url:'blog/kirkland-vs-elevation-protein-lead-testing.html', kw:'aldi' },

    // ---- NOT YET TESTED — high demand from finder data (→ alternative) ----
    { name:'Levels Grass-Fed Whey', type:'Whey', rating:'safe', lead:'Low', price:0.75, cert:'Clean Label Project Purity Award · CR pending', url:'blog/levels-protein-powder-lead-testing-safety-2026.html', kw:'levels grass fed' },
    { name:'Nutricost Whey', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'nutricost' },
    { name:'Transparent Labs', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'transparent labs grass fed' },
    { name:'Sunwarrior', type:'Plant', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_PLANT, kw:'sun warrior' },
    { name:'NOW Sports Whey', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'now foods' },
    { name:'Designer Whey', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'designer' },
    { name:"Tera's Whey", type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'teras tera' },
    { name:'MyProtein', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'my protein impact' },
    { name:'Legion Whey+', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'legion' },
    { name:'Promix', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'promix grass fed' },
    { name:'Thorne', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'NSF brand — not independently lead-tested here', url:null, alt:ALT_WHEY, kw:'thorne' },
    { name:'Pure Protein', type:'Whey', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_WHEY, kw:'pure protein' },
    { name:'FlavCity', type:'Plant', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_PLANT, kw:'flavcity bobby' },
    { name:"Ka'Chava", type:'Meal', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_PLANT, kw:'kachava meal' },
    { name:'Vital Proteins', type:'Collagen', rating:'untested', lead:'Not yet tested', price:null, cert:'Collagen — different category', url:null, alt:ALT_WHEY, kw:'vital proteins collagen' },
    { name:'Just Ingredients', type:'Plant', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_PLANT, kw:'just ingredients' },
    { name:'EarthChimp', type:'Plant', rating:'untested', lead:'Not yet tested', price:null, cert:'', url:null, alt:ALT_PLANT, kw:'earth chimp' }
  ];
})();