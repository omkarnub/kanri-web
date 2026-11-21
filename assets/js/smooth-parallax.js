/**
 * Instant Zero-Delay Multi-Layer Parallax Engine for Kanri
 * Synchronous 1:1 requestAnimationFrame scroll tracking with zero artificial lerp lag (scrub: 0 feel).
 * 
 * Orchestration:
 *  - Layer 1: Xuan Paper Bedrock (Fixed canvas foundation)
 *  - Layer 2: Far Ink Wash Mountains & Mist (+240px depth travel)
 *  - Layer 3: KANRI Brand Centerpiece (+160px float with optical 3D scale & gentle fade)
 *  - Layer 4: Dynamic River, Gliding Sampan Boat & Swallows (+90px travel)
 *  - Layer 5: Foreground Land & Reeds (-110px upward counter-rise)
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

  let isTicking = false;

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

    // 1. Far Mountains & Mist (gentle downward drift creating depth)
    const mtY = progress * 240;
    if (wetCvs) wetCvs.style.transform = `translate3d(0, ${mtY.toFixed(2)}px, 0)`;
    if (mistCvs) mistCvs.style.transform = `translate3d(0, ${mtY.toFixed(2)}px, 0)`;

    // 2. KANRI Brand Centerpiece (Floats mid-depth with subtle 3D scale and gentle fade)
    if (emblemEl) {
      const emblemY = progress * 160;
      const emblemScale = Math.max(0.88, 1 - progress * 0.08);
      const emblemOpacity = Math.max(0, 1 - progress * 1.3);

      emblemEl.style.transform = `translate3d(0, ${emblemY.toFixed(2)}px, 0) scale(${emblemScale.toFixed(3)})`;
      emblemEl.style.opacity = emblemOpacity.toFixed(3);
    }

    // 3. Dynamic River, Gliding Sampan Boat & Swallows
    if (dynCvs) {
      const dynY = progress * 90;
      dynCvs.style.transform = `translate3d(0, ${dynY.toFixed(2)}px, 0)`;
    }

    // 4. Foreground Pitch-Black Land & Reeds (rises slightly upward into view)
    if (landEl) {
      const landY = -progress * 110;
      landEl.style.transform = `translate3d(0, ${landY.toFixed(2)}px, 0)`;
    }
  }

  // Instant 1:1 requestAnimationFrame listener without artificial lerp drag/delay
  function onScroll() {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
        updateParallax(y);
        isTicking = false;
      });
    }
  }

  // Passive native scroll listener — zero resistance, instant response
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial trigger on page load
  document.addEventListener('DOMContentLoaded', () => {
    updateParallax(window.scrollY || 0);
  });
})();
