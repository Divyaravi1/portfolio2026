/* ============================================================
   main.js — shared behaviour for all five case study pages

   PATH: assets/js/main.js
   Loaded by: beachcamp_project.html, studio_project.html,
              RAG_trust.html, Agentic_AI.html, inji.html

   This file did not exist in the original build. Every page called
   into it and 404'd, which is why the preloader never lifted and
   the flip cards never flipped.

   Contents
     1. Preloader hide      — was: page stuck behind a white overlay
     2. AOS init            — was: 58 data-aos elements invisible
     3. toggleFlip()        — was: called by 5 TSG cards, undefined
     4. Back to top         — was: .active never added
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
                     window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ──────────────────────────────────────────────────────────
     1. PRELOADER

     Deliberately does NOT use window.load. Beach Camp carries 23
     images and TSG 31; waiting on all of them means staring at a
     spinner long after the page is readable.

     Timing: hide on DOMContentLoaded, but never flash shorter than
     400ms, and never hold longer than 2.5s whatever else happens.
     projectstyle.css also hides it at 4s with a pure-CSS animation,
     so if this script never runs the page still appears.
     ────────────────────────────────────────────────────────── */
  var PRELOADER_MIN = 400;    // ms — avoid a jarring one-frame flash
  var PRELOADER_MAX = 2500;   // ms — hard cap
  var SESSION_KEY   = 'dr-preloader-shown';
  var startedAt     = Date.now();

  function hidePreloader() {
    var el = document.getElementById('preloader');
    if (!el || el.classList.contains('is-hidden')) return;
    el.classList.add('is-hidden');
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
    // Remove from the DOM once the fade finishes so it can never trap a click.
    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, reduceMotion ? 0 : 450);
  }

  function schedulePreloaderHide() {
    // Already shown once this tab — the inline head script set
    // html.preloader-seen and CSS display:none'd it. Just clean up.
    var seen = false;
    try { seen = !!sessionStorage.getItem(SESSION_KEY); } catch (e) {}
    if (seen) { hidePreloader(); return; }

    var elapsed = Date.now() - startedAt;
    var wait    = Math.max(0, PRELOADER_MIN - elapsed);
    window.setTimeout(hidePreloader, reduceMotion ? 0 : wait);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedulePreloaderHide);
  } else {
    schedulePreloaderHide();
  }
  window.setTimeout(hidePreloader, PRELOADER_MAX);   // hard cap, unconditional

  /* ──────────────────────────────────────────────────────────
     2. AOS

     projectstyle.css gates [data-aos] { opacity: 0 } behind html.js,
     so content is visible if this never runs. Under reduced motion we
     skip AOS entirely rather than initialise it with 0ms durations.
     ────────────────────────────────────────────────────────── */
  function initAOS() {
    if (typeof window.AOS === 'undefined') return;   // CDN blocked — CSS fallback covers it
    if (reduceMotion) {
      window.AOS.init({ disable: true });
      return;
    }
    window.AOS.init({
      duration: 700,
      easing: 'ease-out',
      once: true,
      offset: 60,
      disable: function () { return window.innerWidth < 576; }
    });
  }

  /* Call after any script injects DOM (e.g. the flow strip) so AOS
     recalculates trigger offsets. Exposed globally on purpose. */
  window.refreshAOS = function () {
    if (window.AOS && typeof window.AOS.refresh === 'function') window.AOS.refresh();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAOS);
  } else {
    initAOS();
  }

  /* ──────────────────────────────────────────────────────────
     3. BACK TO TOP
        Markup: <a href="#" class="back-to-top ...">
        CSS reveals on .active, which nothing was adding.
     ────────────────────────────────────────────────────────── */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    var ticking = false;

    function updateBackToTop() {
      ticking = false;
      backToTop.classList.toggle('active', window.scrollY > 100);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateBackToTop); ticking = true; }
    }, { passive: true });

    updateBackToTop();

    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();

/* ──────────────────────────────────────────────────────────────
   4. toggleFlip — TSG action cards

   Global, because studio_project.html calls it inline via
   onclick="toggleFlip(this)" on five .flip-card elements.

   The CSS transform lives on .flip-card-inner (projectstyle.css),
   NOT on .flip-card, so the class goes on the inner element.

   Keyboard support is added by enhanceFlipCards() below: each card
   becomes a real button in the tab order and responds to Enter and
   Space, without changing the existing markup.
   ────────────────────────────────────────────────────────────── */
function toggleFlip(card) {
  if (!card) return;
  var inner = card.classList && card.classList.contains('flip-card-inner')
            ? card
            : card.querySelector('.flip-card-inner');
  if (!inner) return;

  var flipped = inner.classList.toggle('flipped');
  card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  card.setAttribute('aria-label',
    (flipped ? 'Card back showing. ' : 'Card front showing. ') + 'Activate to flip.');
}

(function enhanceFlipCards() {
  function wire() {
    var cards = document.querySelectorAll('.flip-card');
    Array.prototype.forEach.call(cards, function (card, i) {
      // Reachable by Tab and announced as an interactive control.
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');
      if (!card.getAttribute('aria-label')) {
        card.setAttribute('aria-label', 'Card ' + (i + 1) + ' front showing. Activate to flip.');
      }
      card.style.cursor = 'pointer';

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();          // stop Space scrolling the page
          toggleFlip(card);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
