/* ────────────────────────────────────────────────────────────
   main.js — animations re-trigger on every scroll pass
   ──────────────────────────────────────────────────────────── */

// Smooth-scroll helper (used by HTML onclick)
function smoothTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── Nav: turns opaque after scrolling past hero ──────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ── Global mouse position (works even when cursor is over page
//    sections that sit on top of the fixed canvas) ────────────
window.fishMX = 0;
window.fishMY = 0;
document.addEventListener('mousemove', e => {
  window.fishMX = e.clientX;
  window.fishMY = e.clientY;
}, { passive: true });
// Touch support: one finger drag = mouse follow on phones
document.addEventListener('touchmove', e => {
  window.fishMX = e.touches[0].clientX;
  window.fishMY = e.touches[0].clientY;
}, { passive: true });

// ── Helper: restart a CSS @keyframes animation ───────────────
// CSS animations won't replay if the class is already present.
// Removing the class, forcing a reflow, then re-adding restarts it.
function restartAnim(el) {
  el.classList.remove('visible');
  void el.offsetHeight;   // force browser reflow
  el.classList.add('visible');
}

// ── Synthesised bubble-pop sound ─────────────────────────────
function playPopSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.025);
    osc.frequency.exponentialRampToValueAtTime(85,  ctx.currentTime + 0.13);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  } catch(e) {}
}

// ── Bubble: pop in after 3 s, then scale with scroll ─────────
const bubble = document.querySelector('.glass-bubble');
let bubbleReady = false;

setTimeout(() => {
  playPopSound();
  if (bubble) restartAnim(bubble);
  setTimeout(() => {
    document.querySelectorAll('.cta-circle').forEach(c => c.classList.add('visible'));
    // Hand transform control to JS so scroll can drive the scale cleanly
    if (bubble) {
      bubble.style.animation = 'none';
      bubble.style.opacity   = '1';
      bubble.style.transform = 'scale(1)';
    }
    bubbleReady = true;
  }, 680);  // matches animation duration
}, 1500);

// ── Scroll-driven bubble expand / retract ────────────────────
let scrollTick = false;

function scaleBubble() {
  scrollTick = false;
  if (!bubbleReady || !bubble) return;

  // Progress 0 → 1 over the first viewport-height of scroll
  const progress = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);

  // Scale to cover the hero diagonal (bubble is clipped by hero overflow:hidden)
  const bubbleW  = bubble.offsetWidth || Math.min(window.innerWidth * 0.8, 560);
  const diagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
  const maxScale = (diagonal / bubbleW) * 1.1;

  const t = progress;
  const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  bubble.style.transform = `scale(${1 + (maxScale - 1) * eased})`;

  // Fade out text/buttons as bubble fills the hero
  const textOpacity = progress < 0.2 ? 1 : Math.max(0, 1 - (progress - 0.2) / 0.15);
  bubble.querySelectorAll('h1, p, .cta-row').forEach(el => {
    el.style.opacity = textOpacity;
  });
}

window.addEventListener('scroll', () => {
  if (!scrollTick) {
    requestAnimationFrame(scaleBubble);
    scrollTick = true;
  }
}, { passive: true });

// ── OBSERVER A: repeats every time the element enters view ───
// Used for: section headers, about, contact fades.
const repeatIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      restartAnim(el);
    } else {
      el.classList.remove('visible');
    }
  });
}, { threshold: 0.06 });

// ── OBSERVER B: fires ONCE, then element stays visible ───────
// Used for: project cards (they accumulate as you scroll down)
// and skill bars (fill stays at final value permanently).
const onceIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');

    if (el.classList.contains('skill-bar')) {
      const fill = el.querySelector('.skill-fill');
      if (fill) fill.style.width = fill.dataset.width + '%';
    }

    onceIO.unobserve(el);
  });
}, { threshold: 0.06 });

// ── Wire up repeat elements ──────────────────────────────────
document.querySelectorAll(
  '.section-header, .about-img-wrap, .about-text, .fade-up, .fade-left'
).forEach(el => {
  if (!el.classList.contains('project-card') && !el.classList.contains('skill-bar')) {
    repeatIO.observe(el);
  }
});

// ── Wire up once elements ────────────────────────────────────
// Category blocks fade in once (cards inside inherit the reveal)
document.querySelectorAll('.proj-category').forEach((cat, i) => {
  cat.style.transitionDelay = (i * 0.12) + 's';
  onceIO.observe(cat);
});

// Stagger skill bars
document.querySelectorAll('.skill-bar').forEach((bar, i) => {
  bar.style.transitionDelay = (i * 0.06) + 's';
  onceIO.observe(bar);
});
