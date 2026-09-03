/* ============================================================
   flow-strip.js — flow strip component

   PATH: assets/js/flow-strip.js
   Requires: assets/css/case-study.css

   Renders horizontal runs of screens joined by curved SVG connector
   strands, in the visual language of Figma prototype connectors.

   Usage — the component reads everything from a manifest. No screen
   filenames, labels or explanation text ever live in this file.

   The manifest is a plain script that assigns a global, NOT fetched
   JSON. Browsers block fetch() across file:// origins (every local
   file is its own origin), so a fetched manifest could never load
   without a web server. Loading it as a classic script means the
   pages work when opened straight from disk.

   There is no fetch, no XMLHttpRequest and no network call anywhere
   in this component. It must stay that way. Do not add type="module"
   either — modules are subject to the same file:// restriction.

     <!-- PATH: manifest — defines window.FLOW_MANIFEST_INJI -->
     <script src="assets/data/inji-manifest.js"></script>
     <script src="assets/js/flow-strip.js"></script>

     <div class="flow-strip-mount"
          data-manifest="FLOW_MANIFEST_INJI"
          data-img-base="assets/img/inji/"></div>

   data-manifest holds the GLOBAL NAME, not a path.

   Manifest shape:
     window.FLOW_MANIFEST_INJI = { "strips": [ {
         "id":            "dcapi-flow",
         "orientation":   "portrait" | "landscape",
         "useCaseLabel":  null | "selecting between two passports",
         "caption":       "One caption for the whole sequence.",
         "gloss":         null | "DC API — the browser-and-OS route.",
         "screens": [ {
           "file":        "inji_dcapi_flow_1-request.png",
           "alt":         "Verifier request screen",
           "label":       "1 · request",
           "explanation": null | "One to two sentences."
         } ]
     } ] }

   explanation: null  ->  no bubble, no markup, no empty container.
   ============================================================ */

(function () {
  'use strict';

  var SCREENS_PER_PAGE = 4;   // arrows advance by exactly one page of four

  function reduceMotion() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  /* Tile aspect ratio per orientation, as a number. */
  function tileRatio(landscape) { return landscape ? 16 / 10 : 9 / 19.5; }

  /* Same ratio as a CSS string, for the expanded placeholder — the
     expanded <img> has no aspect-ratio of its own to read. */
  function tileRatioText(root) {
    return root && root.classList.contains('flow-strip--landscape') ? '16 / 10' : '9 / 19.5';
  }

  /* A tile is "cropped" when the source is taller than the tile, so
     object-fit: cover trims the bottom. Those tiles get a fade.
     "tall": true in the manifest forces it without measuring. */
  function markCropped(img, btn, ratio, forceTall) {
    if (forceTall) { btn.classList.add('is-cropped'); return; }
    if (!img.naturalWidth || !img.naturalHeight) return;
    var natural = img.naturalWidth / img.naturalHeight;
    if (natural < ratio - 0.02) btn.classList.add('is-cropped');
  }

  /* ──────────────────────────────────────────────────────────
     TEMPORARY SCAFFOLDING — pending screenshots

     A screenshot that has not been supplied yet would otherwise render
     as a broken-image box. On error the <img> is wrapped in a styled
     placeholder carrying its own alt text, at the slot's aspect ratio
     so nothing moves.

     The ratio is taken from, in order: an explicit CSS aspect-ratio
     (flow-strip tiles set one), the width/height attributes, then a
     4/3 default. Delete this function and the .img-pending block in
     case-study.css once every image is in place.
     ────────────────────────────────────────────────────────── */
  function pendingRatio(img) {
    var ar = getComputedStyle(img).aspectRatio;
    if (ar && ar !== 'auto') {
      var m = ar.match(/([\d.]+)\s*\/\s*([\d.]+)/);
      if (m) return m[1] + ' / ' + m[2];
      if (parseFloat(ar)) return String(parseFloat(ar));
    }
    var w = parseFloat(img.getAttribute('width'));
    var h = parseFloat(img.getAttribute('height'));
    if (w && h) return w + ' / ' + h;
    return '4 / 3';
  }

  function wrapPending(img, ratioOverride) {
    if (!img || img.parentNode && img.parentNode.classList &&
        img.parentNode.classList.contains('img-pending')) return;
    var box = document.createElement('span');
    box.className = 'img-pending';
    box.setAttribute('data-pending-label', img.getAttribute('alt') || 'Image pending');
    box.style.setProperty('--pending-ratio', ratioOverride || pendingRatio(img));
    img.parentNode.insertBefore(box, img);
    box.appendChild(img);
  }

  function markPendingImages(root) {
    var imgs = (root || document).querySelectorAll('img');
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.complete && img.naturalWidth === 0) { wrapPending(img); return; }
      img.addEventListener('error', function () { wrapPending(img); });
    });
  }
  window.markPendingImages = markPendingImages;

  /* ──────────────────────────────────────────────────────────
     Dotted group frame

     An injected SVG rect, not border: 1px dashed, because the dash
     pattern must be exact (4 6). No viewBox, so one user unit is one
     pixel and the dashes never scale with the box.
     ────────────────────────────────────────────────────────── */
  function buildFrame(radius) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'fs-frame');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    var rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('rx', String(radius == null ? 10 : radius));
    svg.appendChild(rect);
    return svg;
  }

  /* ──────────────────────────────────────────────────────────
     Page connector

     One per tile, hidden by default. sync() reveals exactly one per
     strip — on the last visible tile of the current page, and only
     when a further page exists.

     Lines are gradients and the arrowhead is a rotated bordered box,
     so the 2/4 dash stays exact at any tile width and nothing skews.
     No SVG here at all.
     ────────────────────────────────────────────────────────── */
  function buildConnector() {
    var wrap = el('span', 'fs-connector', { 'aria-hidden': 'true' });
    wrap.appendChild(el('i', 'fs-connector__v'));
    wrap.appendChild(el('i', 'fs-connector__elbow'));
    wrap.appendChild(el('i', 'fs-connector__h'));

    wrap.appendChild(el('i', 'fs-connector__head'));   // CSS chevron
    return wrap;
  }

  /* ──────────────────────────────────────────────────────────
     One strip
     ────────────────────────────────────────────────────────── */
  function buildStrip(strip, imgBase) {
    var landscape = strip.orientation === 'landscape';

    var root = el('div', 'flow-strip' + (landscape ? ' flow-strip--landscape' : ''));
    if (strip.id) root.id = 'flow-strip-' + strip.id;

    // Vertical centre of the image, as a percentage of tile WIDTH — see
    // the --fs-strand-mid note in case-study.css.
    //   portrait  (9:19.5) -> 19.5/9/2  = 108.33%
    //   landscape (16:10)  -> 10/16/2   =  31.25%
    root.style.setProperty('--fs-strand-mid', landscape ? '31.25%' : '108.33%');

    // Optional per-strip column count (e.g. a landscape strip that
    // wants 2 across at desktop instead of the default 4). The
    // responsive breakpoints in case-study.css still take over below
    // 1100px — this only sets the desktop value.
    var screensPerPage = strip.columns || SCREENS_PER_PAGE;
    if (strip.columns) root.style.setProperty('--fs-cols', String(strip.columns));

    // The frame is on every group now. The label alone marks a use case.
    var group = el('div', 'flow-strip__group');
    group.appendChild(buildFrame(10));

    if (strip.useCaseLabel) {
      var uc = el('span', 'flow-strip__usecase');
      uc.textContent = strip.useCaseLabel;
      group.appendChild(uc);
    }

    var viewport = el('div', 'flow-strip__viewport');
    var track    = el('div', 'flow-strip__track', {
      role: 'group',
      'aria-label': strip.useCaseLabel || strip.caption || 'Screen sequence',
      tabindex: '-1'
    });

    var screens = strip.screens || [];
    screens.forEach(function (screen, i) {
      var cell = el('div', 'flow-strip__screen');

      var btn = el('button', 'flow-strip__btn', {
        type: 'button',
        'aria-label': 'Expand screen ' + (i + 1) + ' of ' + screens.length +
                      (screen.label ? ': ' + screen.label : '')
      });

      var img = el('img');
      img.src = (imgBase || '') + screen.file;
      img.alt = screen.alt || '';
      img.loading = 'lazy';
      btn.appendChild(img);

      // Fade on tiles whose source is taller than the tile.
      var ratio = tileRatio(landscape);
      if (screen.tall) {
        markCropped(img, btn, ratio, true);
      } else if (img.complete) {
        markCropped(img, btn, ratio, false);
      } else {
        img.addEventListener('load', function () {
          markCropped(img, btn, ratio, false);
        });
      }

      cell.appendChild(btn);

      if (screen.label) {
        var lab = el('span', 'flow-strip__label');
        lab.textContent = screen.label;
        cell.appendChild(lab);
      }

      btn.addEventListener('click', function () { expand(root, strip, i, imgBase); });
      track.appendChild(cell);
    });

    // Arrows — the only control. Real buttons, labelled, disabled at ends.
    var prev = el('button', 'flow-strip__arrow flow-strip__arrow--prev', {
      type: 'button', 'aria-label': 'Show previous ' + screensPerPage + ' screens'
    });
    prev.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                     '<path d="M15.4 4.6 7 12l8.4 7.4 1.3-1.5L10 12l6.7-5.9z"/></svg>';

    var next = el('button', 'flow-strip__arrow flow-strip__arrow--next', {
      type: 'button', 'aria-label': 'Show next ' + screensPerPage + ' screens'
    });
    next.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                     '<path d="M8.6 4.6 7.3 6.1 14 12l-6.7 5.9 1.3 1.5L17 12z"/></svg>';

    viewport.appendChild(track);
    // One connector per strip, on the viewport so the track's overflow-x
    // cannot clip the arrowhead where the last tile meets the scrollport.
    var connector = buildConnector();
    viewport.appendChild(connector);
    viewport.appendChild(prev);
    viewport.appendChild(next);
    group.appendChild(viewport);
    root.appendChild(group);

    if (strip.caption) {
      var cap = el('p', 'flow-strip__caption');
      cap.textContent = strip.caption;
      root.appendChild(cap);
    }
    if (strip.gloss) {
      var gl = el('p', 'flow-strip__gloss');
      gl.textContent = strip.gloss;
      root.appendChild(gl);
    }

    wireArrows(root, track, prev, next, connector);
    return root;
  }

  /* ──────────────────────────────────────────────────────────
     Arrows: advance by exactly one page of four. No looping —
     each arrow disables at its end. Hidden if the group fits.
     ────────────────────────────────────────────────────────── */
  function wireArrows(root, track, prev, next, connector) {
    function gap() {
      var g = parseFloat(getComputedStyle(track).columnGap ||
                         getComputedStyle(track).gap || '0');
      return isNaN(g) ? 0 : g;
    }
    // 4 tiles + 3 gaps == clientWidth, so 4 tiles + 4 gaps == clientWidth + gap.
    function step() { return track.clientWidth + gap(); }

    var cells = track.querySelectorAll('.flow-strip__screen');

    /* Reveal the connector on the last visible tile of the current page,
       and only when a further page exists. Hidden when the group fits in
       one page, hidden on the final page, back again when you page down.
       Same rule at 2-across and 1-across. */
    function placeConnector() {
      connector.classList.remove('is-visible');

      var maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 1 || !cells.length) return;   // fits in one page

      var g  = gap();
      var tw = cells[0].getBoundingClientRect().width;
      var cols = Math.max(1, Math.round((track.clientWidth + g) / (tw + g)));
      var pageW = track.clientWidth + g;
      var pageIndex = Math.round(track.scrollLeft / pageW);

      if ((pageIndex + 1) * cols >= cells.length) return;   // final page

      var lastVisible = Math.min(pageIndex * cols + cols - 1, cells.length - 1);
      var tileRect = cells[lastVisible].getBoundingClientRect();
      var vpRect   = track.parentElement.getBoundingClientRect();
      var out      = parseFloat(getComputedStyle(connector).right) || 0;

      connector.style.width = (tileRect.width - out) + 'px';
      connector.style.top   = (tileRect.top - vpRect.top) + 'px';
      connector.style.setProperty('--fs-conn-mid', (tileRect.width / 2) + 'px');
      connector.classList.add('is-visible');
    }

    function sync() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      var fits = maxScroll <= 1;
      prev.hidden = next.hidden = fits;
      if (!fits) {
        prev.disabled = track.scrollLeft <= 1;
        next.disabled = track.scrollLeft >= maxScroll - 1;
      }
      placeConnector();
    }

    function page(dir) {
      track.scrollTo({
        left: track.scrollLeft + dir * step(),
        behavior: reduceMotion() ? 'auto' : 'smooth'
      });
    }

    prev.addEventListener('click', function () { page(-1); });
    next.addEventListener('click', function () { page(1); });

    var tick = false;
    track.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      window.requestAnimationFrame(function () { tick = false; sync(); });
    }, { passive: true });

    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(track);
    window.addEventListener('resize', sync);

    // Images change scrollWidth as they load.
    Array.prototype.forEach.call(track.querySelectorAll('img'), function (im) {
      if (im.complete) return;
      im.addEventListener('load', sync);
      im.addEventListener('error', sync);
    });

    sync();
    window.setTimeout(sync, 120);
  }

  /* ──────────────────────────────────────────────────────────
     Expand — full-screen lightbox, independent of the strip.

     One overlay can ever be open at a time, so its state lives at
     module scope rather than on the triggering root. Focus is
     trapped while open, Esc closes, focus returns to the triggering
     button, and <body> gets overflow: hidden for the duration. Every
     screen expands, including those with no explanation.
     ────────────────────────────────────────────────────────── */
  var activeLightbox = null;

  /* Nudges the bubble back inside the viewport after it's laid out.
     Only relevant >=900px — below that the bubble is static and full
     width (see case-study.css), so it can't overflow to begin with.
     The tail is positioned off the bubble's own edges (bottom-left),
     not off the viewport, so shifting the bubble with a transform
     leaves the tail exactly where it needs to be: on the corner. */
  function clampBubble(bubble) {
    if (window.innerWidth < 900) return;
    bubble.style.transform = '';
    var r = bubble.getBoundingClientRect();
    var margin = 24;
    var dx = Math.min(0, (window.innerWidth - margin) - r.right);
    var dy = Math.max(0, -r.top);
    bubble.style.transform = (dx || dy) ? 'translate(' + dx + 'px, ' + dy + 'px)' : '';
  }

  /* Core lightbox builder. Fresh element every call, appended to
     <body> — never the tile that triggered it, never repositioned in
     place. opts:
       src, alt        image to show
       label           optional caption below the image (flow-strip only)
       explanation     optional bubble text (flow-strip only; .cs-expandable
                        images never pass this — no manifest, no bubble)
       ratioText       aspect-ratio fallback for the pending placeholder
       trigger         element to refocus on close                         */
  function openLightbox(opts) {
    closeLightbox();

    var overlay = el('div', 'flow-strip__lightbox', {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': (opts.label || opts.alt || 'Image') + ' — expanded'
    });

    var closeBtn = el('button', 'flow-strip__lightbox-close', {
      type: 'button', 'aria-label': 'Close expanded screen'
    });
    closeBtn.innerHTML = '&times;';

    // Shrinks to the image's rendered size, so the bubble anchors to
    // its real top-right corner rather than to an oversized box.
    var frame = el('div', 'flow-strip__lightbox-frame');

    var img = el('img', 'flow-strip__lightbox-img');
    img.src = opts.src;
    img.alt = opts.alt || '';
    frame.appendChild(img);

    // Bubble only when there is something to say. A null explanation
    // creates no element at all — no empty container, no layout shift.
    var bubble = null;
    if (opts.explanation) {
      bubble = el('div', 'flow-strip__bubble');
      bubble.textContent = opts.explanation;
      bubble.appendChild(el('i', 'flow-strip__bubble-tail'));
      frame.appendChild(bubble);
      // Reserves the 20vw beside the image the bubble sits in — see
      // .has-note in case-study.css. Screens with no explanation never
      // give up that width.
      frame.classList.add('has-note');
    }

    if (img.complete) {
      if (img.naturalWidth === 0) wrapPending(img, opts.ratioText);
      if (bubble) clampBubble(bubble);
    } else {
      img.addEventListener('load',  function () { if (bubble) clampBubble(bubble); });
      img.addEventListener('error', function () {
        wrapPending(img, opts.ratioText);
        if (bubble) clampBubble(bubble);
      });
    }

    overlay.appendChild(closeBtn);
    overlay.appendChild(frame);

    if (opts.label) {
      var lab = el('p', 'flow-strip__lightbox-label');
      lab.textContent = opts.label;
      overlay.appendChild(lab);
    }

    document.body.appendChild(overlay);
    document.body.classList.add('flow-strip-lightbox-open');

    /* ── focus trap ── */
    function focusable() {
      return overlay.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
      if (e.key !== 'Tab') return;
      var f = focusable();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    overlay.addEventListener('keydown', onKey);
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    var onResize = bubble ? function () { clampBubble(bubble); } : null;
    if (onResize) window.addEventListener('resize', onResize);

    activeLightbox = { overlay: overlay, trigger: opts.trigger, onKey: onKey, onResize: onResize };
    closeBtn.focus();
  }

  function closeLightbox() {
    if (!activeLightbox) return;
    var a = activeLightbox;
    activeLightbox = null;
    a.overlay.removeEventListener('keydown', a.onKey);
    if (a.onResize) window.removeEventListener('resize', a.onResize);
    if (a.overlay.parentNode) a.overlay.parentNode.removeChild(a.overlay);
    document.body.classList.remove('flow-strip-lightbox-open');
    if (a.trigger) a.trigger.focus();      // focus returns to the trigger
  }

  /* Flow-strip screens: bubble and label come from the manifest. */
  function expand(root, strip, index, imgBase) {
    var screen  = strip.screens[index];
    var trigger = root.querySelectorAll('.flow-strip__btn')[index];
    openLightbox({
      src: (imgBase || '') + screen.file,
      alt: screen.alt,
      label: screen.label,
      explanation: screen.explanation,
      ratioText: tileRatioText(root),
      trigger: trigger
    });
  }

  /* ──────────────────────────────────────────────────────────
     .cs-expandable — plain click-to-expand images outside the
     flow-strip system (Agentic AI, RAG Trust). Same lightbox, no
     manifest, so no bubble and no label: just image + close. The
     trigger is a real <button> wrapping the <img> in markup, so it's
     keyboard-reachable without any JS-built affordance.
     ────────────────────────────────────────────────────────── */
  function decorateExpandables(root) {
    var buttons = (root || document).querySelectorAll('.cs-expandable');
    Array.prototype.forEach.call(buttons, function (btn) {
      if (btn.dataset.expandableWired) return;
      btn.dataset.expandableWired = 'true';
      var img = btn.querySelector('img');
      if (!img) return;
      btn.addEventListener('click', function () {
        openLightbox({ src: img.currentSrc || img.src, alt: img.alt, trigger: btn });
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     Mount
     ────────────────────────────────────────────────────────── */
  function mountAll() {
    var mounts = document.querySelectorAll('.flow-strip-mount[data-manifest]');
    if (!mounts.length) return;

    Array.prototype.forEach.call(mounts, function (mount) {
      // data-manifest names a GLOBAL defined by assets/data/<page>-manifest.js,
      // which must be loaded by a plain <script src> before this file.
      var globalName = mount.dataset.manifest;
      var imgBase    = mount.dataset.imgBase || '';
      var only       = mount.dataset.strip || null;   // optional: render one strip

      var data = window[globalName];

      if (!data || !Array.isArray(data.strips)) {
        // Render nothing rather than leaving a broken shell on the page.
        mount.removeAttribute('data-manifest');
        if (window.console) {
          console.error(
            '[flow-strip] Manifest global "' + globalName + '" was not found.\n' +
            'Load it with a plain <script src="assets/data/…-manifest.js"> BEFORE ' +
            'flow-strip.js, and check the global name matches data-manifest.\n' +
            'Mount element:', mount
          );
        }
        return;
      }

      var strips = data.strips.filter(function (st) { return !only || st.id === only; });

      if (!strips.length && window.console) {
        console.error('[flow-strip] No strip with id "' + only + '" in ' + globalName + '.');
      }

      strips.forEach(function (st) { mount.appendChild(buildStrip(st, imgBase)); });

      // Newly injected DOM — AOS offsets, and pending-image handling for
      // the tiles this mount just created.
      markPendingImages(mount);
      if (typeof window.refreshAOS === 'function') window.refreshAOS();
    });
  }

  /* Any group of screens outside a flow strip — before/after pairs,
     state-set grids — gets the same frame by carrying .fs-framed.
     data-frame-radius overrides the 10px default. */
  function decorateFrames() {
    var targets = document.querySelectorAll('.fs-framed');
    Array.prototype.forEach.call(targets, function (t) {
      if (t.querySelector(':scope > .fs-frame')) return;   // already framed
      t.insertBefore(buildFrame(t.dataset.frameRadius), t.firstChild);
    });
  }

  function init() { decorateFrames(); mountAll(); markPendingImages(); decorateExpandables(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.FlowStrip = {
    mount: mountAll,
    buildStrip: buildStrip,
    decorateFrames: decorateFrames,
    decorateExpandables: decorateExpandables
  };
})();
