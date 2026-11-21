/**
 * Multi-Layer Differential Parallax Engine for Kanri
 * Inspired by GSAP ScrollTrigger & Lenis multi-depth scrubbed architecture.
 * Orchestrates spatial depth planes without hijacking native browser scroll:
 *  - Layer 1: Sky & Paper Canvas (Fixed bedrock anchor, 0% travel)
 *  - Layer 2: Far Ink Wash Mountains & Mist (+260px drift / 65% depth retention)
 *  - Layer 3: KANRI Brand Centerpiece (+190px float with optical 3D scale & fade)
 *  - Layer 4: Dynamic River, Gliding Boat & Birds (+110px travel)
 *  - Layer 5: Foreground Land, Boulders & Swaying Reeds (-130px rise into view)
 * Native scrolling remains 100% natural and fluid with zero resistance.
 */
(() => {
  'use strict';

  // Inform living background that parallax engine handles canvas transforms
  window.disableInternalBgParallax = true;

  // DOM Elements
  const heroSection = document.querySelector('.hero-section');
  const emblemEl = document.getElementById('hero-brand-centerpiece') || document.getElementById('hero-bg-emblem');
  const wetCvs = document.getElementById('wet');
  const mistCvs = document.getElementById('mist');
  const dynCvs = document.getElementById('dyn');
  const landEl = document.getElementById('land');

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll interpolation state
  let targetY = window.scrollY || document.documentElement.scrollTop || 0;
  let currentY = targetY;
  let isTicking = false;
  const lerpFactor = 0.12;

  function updateParallax(y) {
    if (!heroSection) return;
    const heroH = heroSection.offsetHeight || (window.innerHeight || 800);
    const progress = Math.min(1.25, Math.max(0, y / heroH));

    if (prefersReduced) {
      if (emblemEl) { emblemEl.style.transform = ''; emblemEl.style.opacity = ''; }
      if (wetCvs) wetCvs.style.transform = '';
      if (mistCvs) mistCvs.style.transform = '';
      if (dynCvs) dynCvs.style.transform = '';
      if (landEl) landEl.style.transform = '';
      return;
    }

    // 1. Far Mountains & Mist (Drifts down relative to hero, appearing distant in 3D)
    const mtY = progress * 260;
    if (wetCvs) wetCvs.style.transform = `translate3d(0, ${mtY.toFixed(2)}px, 0)`;
    if (mistCvs) mistCvs.style.transform = `translate3d(0, ${mtY.toFixed(2)}px, 0)`;

    // 2. KANRI Brand Centerpiece (Floats mid-depth with subtle 3D scale and gentle fade)
    if (emblemEl) {
      const emblemY = progress * 190;
      const emblemScale = Math.max(0.86, 1 - progress * 0.08);
      const emblemOpacity = Math.max(0, 1 - progress * 1.18);

      emblemEl.style.transform = `translate3d(0, ${emblemY.toFixed(2)}px, 0) scale(${emblemScale.toFixed(3)})`;
      emblemEl.style.opacity = emblemOpacity.toFixed(3);
    }

    // 3. Dynamic River, Gliding Sampan Boat & Swallows
    if (dynCvs) {
      const dynY = progress * 110;
      dynCvs.style.transform = `translate3d(0, ${dynY.toFixed(2)}px, 0)`;
    }

    // 4. Foreground Land, Boulders & Swaying Reeds (Rises upward into view from the bottom)
    if (landEl) {
      const landY = -progress * 130;
      landEl.style.transform = `translate3d(0, ${landY.toFixed(2)}px, 0)`;
    }
  }

  // Smooth sub-pixel animation frame loop
  function tick() {
    if (prefersReduced) {
      updateParallax(window.scrollY || 0);
      isTicking = false;
      return;
    }

    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.1) {
      currentY += diff * lerpFactor;
      updateParallax(currentY);
      requestAnimationFrame(tick);
    } else {
      currentY = targetY;
      updateParallax(currentY);
      isTicking = false;
    }
  }

  function onScroll() {
    targetY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(tick);
    }
  }

  // Passive native scroll listener — zero resistance, full 120 FPS device performance
  window.addEventListener('scroll', onScroll, { passive: true });

  // Sync with Kanri Theme Switcher
  if (window.KanriTheme) {
    const notifyBgTheme = () => {
      const dt = document.documentElement.getAttribute('data-theme');
      const targetTheme = (dt === 'light') ? 'light' : 'dark';
      if (window.InkBackground && typeof window.InkBackground.setTheme === 'function') {
        window.InkBackground.setTheme(targetTheme);
      }
    };

    const themeObserver = new MutationObserver(notifyBgTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // Initial trigger
  document.addEventListener('DOMContentLoaded', () => {
    updateParallax(window.scrollY || 0);
  });
})();
