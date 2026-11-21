/**
 * Instant Zero-Delay Multi-Layer Parallax for Kanri
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

  // Inform living background that Parallax handles canvas transforms
  window.disableInternalBgParallax = true;

  // DOM Elements
  const heroSection = document.querySelector('.hero-section');
  const emblemEl = document.getElementById('hero-brand-centerpiece') || document.getElementById('hero-bg-emblem');
  const wetCvs = document.getElementById('wet');
  const mistCvs = document.getElementById('mist');
  const dynCvs = document.getElementById('dyn');
  const landEl = document.getElementById('land');
  const topStarLink = document.querySelector('.top-github-link, .top-github-star-btn');

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

    // 1. Far Mountains & Mist (downward drift creating deep background parallax)
    const mtY = progress * 260;
    if (wetCvs) wetCvs.style.transform = `translate3d(0, ${mtY.toFixed(2)}px, 0)`;
    if (mistCvs) mistCvs.style.transform = `translate3d(0, ${mtY.toFixed(2)}px, 0)`;

    // 2. KANRI Brand Centerpiece: Kept completely static (no drift, zero fade)
    // Acts as the rock-solid anchor plane, making background and foreground parallax motion pop
    if (emblemEl) {
      emblemEl.style.transform = '';
      emblemEl.style.opacity = '1';
    }

    // 3. Dynamic River, Gliding Sampan Boat & Swallows (mid-plane travel)
    if (dynCvs) {
      const dynY = progress * 100;
      dynCvs.style.transform = `translate3d(0, ${dynY.toFixed(2)}px, 0)`;
    }

    // 4. Foreground Pitch-Black Land & Reeds (upward counter-rise into view)
    if (landEl) {
      const landY = -progress * 120;
      landEl.style.transform = `translate3d(0, ${landY.toFixed(2)}px, 0)`;
    }

    // 5. Dynamic Theme Contrast for Top Right GitHub Stars Link
    if (topStarLink) {
      if (y > heroH - 80) {
        topStarLink.classList.add('on-dark');
      } else {
        topStarLink.classList.remove('on-dark');
      }
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
