/* =========================================================================
   CLEAN PROTEIN LIST — SHARED PROTEIN POLL
   -------------------------------------------------------------------------
   Replaces the inline submitPollAndRedirect() copies scattered across
   articles. Fix routing ONCE here instead of in every file.

   Usage in any article (root-relative so it works from / and /blog/):
     <script src="/includes/protein-poll.js"></script>
   The poll form markup stays as-is; this defines submitPollAndRedirect().

   ── PRODUCT-LINE RULE ────────────────────────────────────────────────────
   Recommendations must stay INSIDE the product line the user is asking
   about. Never send a powder user to an RTD, or an RTD user to a powder.
       Whey powder  -> Dymatize ISO100        (powder)
       Plant powder -> Truvani                (powder)
       RTD shake    -> OWYN Pro Elite         (plant-based RTD)
   ========================================================================= */

(function () {
  'use strict';

  // Verified-safe destinations, by product line.
  var SAFE = {
    wheyPowder:  { url: '/blog/dymatize-iso-100-safety-analysis.html',
                   msg: 'Dymatize ISO 100 (Consumer Reports #2, verified safe whey powder)' },
    plantPowder: { url: '/blog/truvani-protein-lead-testing-results-2026.html',
                   msg: 'Truvani (the verified-safe plant protein powder)' },
    rtd:         { url: '/blog/owyn-pro-elite-protein-powder-safety-only-safe-plant-protein-2025.html',
                   msg: 'OWYN Pro Elite (the verified-safe plant-based RTD)' },
    rtdGuide:    { url: '/blog/rtd-protein-shakes-safety-guide-2025.html',
                   msg: 'our RTD Shake Safety Guide' },
    rankings:    { url: '/blog/lead-free-protein-brands-ranked-2025.html',
                   msg: 'the Verified-Safe Brand Rankings' },
    database:    { url: '/brand-database.html',
                   msg: 'the searchable Brand Safety Database' }
  };

  /* Brand-specific routes. Checked BEFORE the generic type bucket, because a
     named brand is more specific than "powder" or "RTD".
     Each entry keeps the user in the same product line they asked about. */
  var BRAND_ROUTES = [
    // --- RTD shakes: route to the RTD article, or the RTD guide ---
    { match: ['quest'],       url: '/blog/quest-protein-shake-lawsuit-lead-prop65-2026.html',            msg: 'our Quest lawsuit breakdown' },
    { match: ['premier'],     url: '/blog/premier-protein-lead-testing.html',                            msg: 'our Premier Protein analysis' },
    { match: ['fairlife', 'core power'], url: '/blog/fairlife-protein-shakes-safety-lead-testing-2025.html', msg: 'our Fairlife analysis' },
    { match: ['muscle milk', 'musclemilk'], url: '/blog/muscle-milk-lead-testing-safety-analysis-2025.html', msg: 'our Muscle Milk analysis' },
    { match: ['ensure'],      url: '/blog/ensure-protein-shakes-safety-lead-testing-2025.html',          msg: 'our Ensure analysis' },
    { match: ['boost'],       url: '/blog/boost-protein-shakes-safety-lead-testing-2025.html',           msg: 'our Boost analysis' },
    { match: ['owyn'],        url: SAFE.rtd.url,                                                          msg: 'our OWYN Pro Elite analysis' },

    // --- High-lead PLANT POWDERS: send to a safe PLANT POWDER (not an RTD) ---
    { match: ['naked', 'vega', 'garden of life', 'garden'], url: SAFE.plantPowder.url, msg: SAFE.plantPowder.msg },
    { match: ['orgain'],      url: '/blog/costco-orgain-protein-powder-lawsuit-heavy-metals-2026.html',  msg: 'our Orgain lawsuit breakdown' },
    { match: ['huel'],        url: '/blog/huel-black-edition-lead-content.html',                         msg: 'our Huel analysis' },

    // --- Lawsuit / recall brands ---
    { match: ['jocko', 'molk', 'mölk'], url: '/blog/jocko-protein-lawsuit-lead-contamination-2026.html', msg: 'our Jocko Fuel lawsuit breakdown' },
    { match: ['genepro'],     url: '/blog/genepro-whey-protein-fda-recall-allergen-mislabeling-2025.html', msg: 'the Genepro recall notice' },

    // --- Whey powders with their own analysis ---
    { match: ['levels'],      url: '/blog/levels-protein-powder-lead-testing-safety-2026.html',          msg: 'our Levels safety analysis' },
    { match: ['optimum', 'gold standard'], url: '/blog/optimum-nutrition-gold-standard-whey-lead-testing-results-2025.html', msg: 'our ON Gold Standard analysis' },
    { match: ['dymatize', 'iso100', 'iso 100'], url: SAFE.wheyPowder.url,                                msg: 'our Dymatize ISO 100 analysis' },
    { match: ['body fortress'], url: '/blog/body-fortress-protein-powder-lead-testing-budget-clean-2025.html', msg: 'our Body Fortress analysis' },
    { match: ['muscletech', 'muscle tech'], url: '/blog/muscletech-mass-gainer-safety.html',             msg: 'our MuscleTech analysis' },
    { match: ['isopure'],     url: '/blog/isopure-protein-powder-lead-testing-safety-2025.html',         msg: 'our Isopure analysis' },
    { match: ['ascent'],      url: '/blog/ascent-protein-powder-lead-testing-safety-2025.html',          msg: 'our Ascent analysis' },
    { match: ['ghost'],       url: '/blog/ghost-protein-powder-lead-testing-2025.html',                  msg: 'our Ghost analysis' },
    { match: ['ryse'],        url: '/blog/ryse-protein-powder-lead-testing-2025.html',                   msg: 'our RYSE analysis' },
    { match: ['six star', 'sixstar'], url: '/blog/six-star-protein-powder-lead-testing-safety-2025.html', msg: 'our Six Star analysis' },
    { match: ['bsn', 'syntha'], url: '/blog/bsn-syntha-6-safety-analysis.html',                          msg: 'our BSN Syntha-6 analysis' },
    { match: ['momentous'],   url: '/blog/momentous-protein-safety-analysis.html',                       msg: 'our Momentous analysis' },
    { match: ['truvani'],     url: SAFE.plantPowder.url,                                                 msg: 'our Truvani analysis' },
    { match: ['kirkland', 'elevation'], url: '/blog/kirkland-vs-elevation-protein-lead-testing.html',    msg: 'our Kirkland vs Elevation comparison' },
    { match: ['nurri'],       url: '/blog/nurri-protein-shake-lead-testing-safety-2026.html',            msg: 'our Nurri analysis' }
  ];

  function resolveRoute(brand, type) {
    // 1) Named brand wins — most specific signal.
    for (var i = 0; i < BRAND_ROUTES.length; i++) {
      var r = BRAND_ROUTES[i];
      for (var j = 0; j < r.match.length; j++) {
        if (brand.indexOf(r.match[j]) !== -1) return { url: r.url, msg: r.msg };
      }
    }
    // 2) Fall back to product type — staying inside the requested line.
    if (type === 'RTD')       return SAFE.rtd;        // plant-based RTD
    if (type === 'Switching') return SAFE.rankings;
    if (type === 'Powder')    return SAFE.database;   // searchable — never a dead end
    return SAFE.database;
  }

  window.submitPollAndRedirect = function () {
    var input = document.getElementById('brandInput');
    var typeRadio = document.querySelector('input[name="type"]:checked');
    var result = document.getElementById('pollResult');

    var brandInput = input ? input.value.trim() : '';
    if (!brandInput || !typeRadio) {
      alert('⚠️ Please enter your brand and select a type');
      return;
    }
    var brand = brandInput.toLowerCase();
    var type = typeRadio.value;

    // Keep collecting demand data (this is what drives the content roadmap).
    fetch('https://formspree.io/f/xeopynkp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: brandInput, type: type, page: window.location.pathname })
    }).catch(function (err) { console.log('Poll error:', err); });

    var route = resolveRoute(brand, type);

    if (result) {
      result.style.display = 'block';
      result.innerHTML =
        '<p style="color:#1b5e20;font-weight:600;margin:0 0 8px;">✅ Analyzing ' + brandInput + '...</p>' +
        '<p style="color:#2e7d32;font-weight:bold;margin:0;">Redirecting you to ' + route.msg + ' now...</p>';
    }
    setTimeout(function () { window.location.href = route.url; }, 1800);
  };
})();