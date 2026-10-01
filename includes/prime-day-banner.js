/* =========================================================================
   CLEAN PROTEIN LIST — PRIME DAY BANNER (sitewide, self-expiring)
   -------------------------------------------------------------------------
   Injects a slim bar under the site <header> on every page that loads it:

       <script src="/includes/prime-day-banner.js" defer></script>

   Behavior is driven entirely by the dates below — nothing to remove after
   the event, the bar simply stops rendering once END has passed. To reuse
   for the next sale (Black Friday, July Prime Day), change the dates/copy.

     before START  → "teaser" copy (early deals + Prime trial)
     START → END   → "live" copy
     after END     → nothing rendered

   Dismissing hides it for the rest of the browser session.
   ========================================================================= */

(function () {
  'use strict';

  // ---------------------------------------------------------------- config
  // Prime Big Deal Days 2026: Oct 6 12:01am PT → end of Oct 7 PT (PDT = UTC-7)
  var START = Date.UTC(2026, 9, 6, 7, 1);   // months are 0-based: 9 = October
  var END   = Date.UTC(2026, 9, 8, 7, 0);
  var SHOW_FROM = Date.UTC(2026, 8, 30, 0, 0); // start teasing Sep 30

  var DEALS_URL = '/prime-day-protein-deals.html';
  var PRIME_TRIAL_URL = 'https://www.amazon.com/amazonprime?tag=beardednotary-20';
  var DISMISS_KEY = 'cpl_prime_bar_dismissed_2026_oct';

  // -------------------------------------------------------------- gating
  var now = Date.now();
  if (now < SHOW_FROM || now >= END) return;

  // In-article sale blocks (e.g. the Orgain swap box) ship with `hidden` and
  // are revealed only inside the window — independent of the bar being dismissed.
  function revealSaleBlocks() {
    var els = document.querySelectorAll('.prime-day-only');
    for (var i = 0; i < els.length; i++) els[i].hidden = false;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealSaleBlocks);
  } else {
    revealSaleBlocks();
  }

  try {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
  } catch (e) { /* storage blocked — just show the bar */ }

  var live = now >= START;
  var onDealsPage = location.pathname.indexOf('prime-day-protein-deals') !== -1;

  // ---------------------------------------------------------------- copy
  var msg, cta, href, external;
  if (onDealsPage) {
    msg = live ? 'Prime Day deals are live, but only for Prime members.'
               : 'Prime Day deals (Oct 6–7) are for Prime members only.';
    cta = 'Start your free Prime trial →';
    href = PRIME_TRIAL_URL;
    external = true;
  } else if (live) {
    msg = '🔥 Prime Big Deal Days are LIVE. See which protein & creatine deals passed lab testing.';
    cta = 'See the deals →';
    href = DEALS_URL;
  } else {
    msg = '⏰ Prime Big Deal Days start Oct 6. Here are the lab-tested proteins worth buying on sale.';
    cta = 'See the list →';
    href = DEALS_URL;
  }

  // -------------------------------------------------------------- styles
  var css =
    '.cpl-prime-bar{background:#232f3e;color:#fff;font:600 15px/1.4 "DM Sans",-apple-system,BlinkMacSystemFont,sans-serif;' +
      'padding:10px 44px 10px 16px;text-align:center;position:relative;z-index:50}' +
    '.cpl-prime-bar span{margin-right:10px}' +
    '.cpl-prime-bar a.cpl-prime-cta{display:inline-block;background:#ff9900;color:#111;text-decoration:none;font-weight:800;' +
      'padding:5px 14px;border-radius:999px;white-space:nowrap;margin:4px 0}' +
    '.cpl-prime-bar a.cpl-prime-cta:hover{background:#f08804}' +
    '.cpl-prime-bar a.cpl-prime-trial{color:#ffcc80;margin-left:12px;font-weight:600;white-space:nowrap}' +
    '.cpl-prime-bar button{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;' +
      'color:#fff;opacity:.7;font-size:22px;line-height:1;cursor:pointer;padding:4px 8px}' +
    '.cpl-prime-bar button:hover{opacity:1}' +
    '@media(max-width:600px){.cpl-prime-bar{font-size:14px}.cpl-prime-bar span{display:block;margin:0 0 4px}' +
      '.cpl-prime-bar a.cpl-prime-trial{display:block;margin:6px 0 0}}';

  // --------------------------------------------------------------- build
  function render() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'cpl-prime-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Prime Day deals');

    var text = document.createElement('span');
    text.textContent = msg;
    bar.appendChild(text);

    var a = document.createElement('a');
    a.className = 'cpl-prime-cta';
    a.href = href;
    a.textContent = cta;
    if (external) { a.target = '_blank'; a.rel = 'noopener sponsored'; }
    bar.appendChild(a);

    // Secondary Prime-trial link on every other page (bounty pays on signup)
    if (!onDealsPage) {
      var t = document.createElement('a');
      t.className = 'cpl-prime-trial';
      t.href = PRIME_TRIAL_URL;
      t.target = '_blank';
      t.rel = 'noopener sponsored';
      t.textContent = 'Not Prime? Try it free';
      bar.appendChild(t);
    }

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss');
    close.innerHTML = '&times;';
    close.addEventListener('click', function () {
      bar.remove();
      try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
    });
    bar.appendChild(close);

    // Internal click → GA4 (Amazon clicks are already caught by affiliate-tracker.js)
    a.addEventListener('click', function () {
      if (!external && typeof gtag === 'function') {
        gtag('event', 'prime_banner_click', { banner_phase: live ? 'live' : 'teaser', affiliate_page: location.pathname });
      }
    });

    var header = document.querySelector('header');
    var overlay = document.querySelector('.menu-overlay');
    var anchor = overlay || header;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
