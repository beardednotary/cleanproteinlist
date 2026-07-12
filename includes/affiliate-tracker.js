/* =========================================================================
   CLEAN PROTEIN LIST — AFFILIATE CLICK TRACKER
   -------------------------------------------------------------------------
   WHAT THIS ANSWERS (that GA4's default `click` event cannot):

     • Which PAGE earns affiliate clicks — and which just informs and loses?
     • Which PRODUCT gets clicked most?
     • Which PLACEMENT works — the new table Buy buttons, the product cards,
       the sidebar, or the bottom "what to buy" list?
     • What is each page's actual CONVERSION RATE (clicks ÷ views)?

   HOW TO INSTALL
   --------------
   Add ONE line before </body> on every page (after your GA4 tag):

       <script src="/includes/affiliate-tracker.js"></script>

   That's it. It auto-detects every Amazon link on the page — existing and
   future. You never tag a link by hand, and new articles are instrumented
   for free.

   WHAT TO DO IN GA4 (one-time, ~5 min)
   ------------------------------------
   Admin → Custom definitions → Create custom dimension, 4 times.
   Scope = Event. Event parameter names (type exactly):

       affiliate_page        →  which page the click came from
       affiliate_product     →  which product was clicked
       affiliate_placement   →  where on the page it was clicked
       affiliate_position    →  how far down the page (0-100%)

   Then: Reports → Engagement → Events → affiliate_click → add those as
   dimensions. Data starts appearing within ~24h.

   NOTE: custom dimensions are NOT retroactive. Create them today, or the
   data collected before you do won't be broken out.
   ========================================================================= */

(function () {
  'use strict';

  // ---------------------------------------------------------------- config
  var AMAZON = /(^|\.)amazon\.[a-z.]+$|(^|\.)amzn\.to$/i;

  // Placement detection — checked in order, first match wins.
  // Maps a DOM ancestor/class to a human-readable placement name.
  var PLACEMENTS = [
    ['.table-buy-btn',        'table_buy_button'],   // the new Buy column
    ['.rankings-table',       'rankings_table'],
    ['.comparison-table',     'comparison_table'],
    ['table',                 'other_table'],
    ['.sidebar-cta',          'sidebar'],
    ['.sidebar',              'sidebar'],
    ['.product-card',         'product_card'],
    ['.rtd-product-card',     'product_card'],
    ['.buying-cta',           'bottom_cta'],
    ['.cta-box-inline',       'mid_article_cta'],
    ['.highlight-box',        'highlight_box'],
    ['.buy-link',             'bottom_list'],
    ['.final-cta-mega',       'final_cta'],
    ['.faq-premier',          'faq'],
    ['.related-articles',     'related']
  ];

  // ------------------------------------------------------------- utilities
  function isAmazon(a) {
    try {
      return AMAZON.test(new URL(a.href, location.href).hostname);
    } catch (e) { return false; }
  }

  /* Work out WHERE on the page the link sits. */
  function placementOf(a) {
    for (var i = 0; i < PLACEMENTS.length; i++) {
      var sel = PLACEMENTS[i][0];
      if (a.matches && a.matches(sel)) return PLACEMENTS[i][1];
      if (a.closest && a.closest(sel)) return PLACEMENTS[i][1];
    }
    return 'inline_link';
  }

  /* Work out WHICH PRODUCT was clicked.
     Tries, in order: the row's product cell, the card heading, the link text,
     then the ASIN from the URL. */
  function productOf(a) {
    // 1) In a table row → use the product-name cell (usually the 2nd <td>)
    var tr = a.closest && a.closest('tr');
    if (tr) {
      var cells = tr.querySelectorAll('td');
      for (var i = 0; i < cells.length; i++) {
        var txt = (cells[i].textContent || '').trim();
        // skip rank numbers, prices, and the buy cell itself
        if (txt && txt.length > 3 && !/^[#\d🥇🥈🥉\s.]+$/.test(txt) && !/^Buy/i.test(txt)) {
          return clean(txt);
        }
      }
    }
    // 2) In a product card → use its heading
    var card = a.closest && a.closest('.product-card, .rtd-product-card, .highlight-box, li');
    if (card) {
      var h = card.querySelector('h3, h4, strong');
      if (h && h.textContent.trim()) return clean(h.textContent);
    }
    // 3) The link's own text, if it names something
    var t = (a.textContent || '').trim();
    if (t && !/^(buy|check|view|shop|see)\b/i.test(t) && t.length > 3) return clean(t);
    if (/buy|check/i.test(t) && t.length > 12) return clean(t); // "Buy Levels on Amazon"

    // 4) Fall back to the ASIN
    var asin = a.href.match(/\/dp\/([A-Z0-9]{10})/);
    if (asin) return 'ASIN:' + asin[1];
    var shortlink = a.href.match(/amzn\.to\/(\w+)/);
    if (shortlink) return 'amzn:' + shortlink[1];
    return 'unknown';
  }

  function clean(s) {
    return s.replace(/\s+/g, ' ')
            .replace(/[🥇🥈🥉✅⚠️❌❓→]/g, '')
            .trim()
            .slice(0, 90);   // GA4 param values cap at 100 chars
  }

  /* How far down the page is this link? Useful for answering
     "are people converting above or below the fold?" */
  function depthOf(a) {
    var doc = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    if (!doc) return 0;
    var top = a.getBoundingClientRect().top + window.scrollY;
    return Math.min(100, Math.round((top / doc) * 100));
  }

  // ------------------------------------------------------------------ send
  function track(a) {
    if (typeof gtag !== 'function') return;

    var payload = {
      affiliate_page:      location.pathname,
      affiliate_product:   productOf(a),
      affiliate_placement: placementOf(a),
      affiliate_position:  depthOf(a),
      link_url:            a.href,
      // GA4 recommended-event fields, so this also shows up in standard reports
      link_domain: (function () {
        try { return new URL(a.href).hostname; } catch (e) { return ''; }
      })(),
      outbound: true
    };

    gtag('event', 'affiliate_click', payload);

    // Optional: also fire as a conversion-ready event you can mark as a
    // Key Event in GA4 (Admin → Events → mark as key event).
    gtag('event', 'select_item', {
      item_list_name: location.pathname,
      items: [{ item_name: payload.affiliate_product }]
    });
  }

  // --------------------------------------------------------------- binding
  /* Delegated listener: catches every current AND future Amazon link,
     including any injected later by your finder / database JS. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !isAmazon(a)) return;
    track(a);
  }, true);

  // Also catch middle-click / cmd-click (opens in new tab — very common
  // on comparison tables, and invisible to a plain click listener).
  document.addEventListener('auxclick', function (e) {
    if (e.button !== 1) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !isAmazon(a)) return;
    track(a);
  }, true);

  // ------------------------------------------------------ dev sanity check
  // Run  window.CPL_auditLinks()  in the browser console on any page to see
  // every Amazon link, how it will be labelled, and any BROKEN placeholders.
  window.CPL_auditLinks = function () {
    var rows = [];
    document.querySelectorAll('a[href]').forEach(function (a) {
      if (!isAmazon(a)) return;
      var broken = /amzn\.to\/[A-Z-]{6,}$/.test(a.href);   // e.g. amzn.to/ON-CREATINE
      rows.push({
        product:   productOf(a),
        placement: placementOf(a),
        depth:     depthOf(a) + '%',
        BROKEN:    broken ? '⚠️ PLACEHOLDER' : '',
        url:       a.href.slice(0, 60)
      });
    });
    console.table(rows);
    var bad = rows.filter(function (r) { return r.BROKEN; });
    console.log('Amazon links on page: ' + rows.length +
                ' | broken placeholders: ' + bad.length);
    return rows;
  };
})();