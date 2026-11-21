/**
 * Instant Zero-Delay Multi-Layer Parallax & Dynamic Dark Mode Extension Engine
 * Eliminates artificial lerp lag: syncs synchronously to scroll via requestAnimationFrame (scrub: 0 feel).
 * 
 * Orchestration:
 *  - Layer 1: Sky & Paper Canvas (Fixed bedrock anchor)
 *  - Layer 2: Far Ink Wash Mountains & Mist (+260px drift)
 *  - Layer 3: KANRI Brand Centerpiece (+190px float with optical 3D scale & fade)
 *  - Layer 4: Dynamic River, Gliding Sampan Boat & Swallows (+110px travel)
 *  - Layer 5: Pitch-Black Land, Boulders & Reeds (-130px rise into view)
 *  - Ground Extension: Pitch-black grass and earth at the bottom expands upward,
 *    smoothly transitioning the entire page into black dark mode as user scrolls down.
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
  const blackExtEl = document.getElementById('hero-black-extension');

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
      if (blackExtEl) blackExtEl.style.transform = '';
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
      const emblemOpacity = Math.max(0, 1 - progress * 1.35);

      emblemEl.style.transform = `translate3d(0, ${emblemY.toFixed(2)}px, 0) scale(${emblemScale.toFixed(3)})`;
      emblemEl.style.opacity = emblemOpacity.toFixed(3);
    }

    // 3. Dynamic River, Gliding Sampan Boat & Swallows
    if (dynCvs) {
      const dynY = progress * 110;
      dynCvs.style.transform = `translate3d(0, ${dynY.toFixed(2)}px, 0)`;
    }

    // 4. Foreground Pitch-Black Land, Boulders & Reeds (Rises upward into view from the bottom)
    if (landEl) {
      const landY = -progress * 130;
      landEl.style.transform = `translate3d(0, ${landY.toFixed(2)}px, 0)`;
    }

    // 5. Black Ground Extension into Dark Mode:
    // As the user scrolls down, the pitch-black grass/earth at the bottom extends upward smoothly.
    const darkProgress = Math.min(1.0, Math.max(0, y / (heroH * 0.72)));
    if (blackExtEl) {
      const blackScale = Math.min(1.0, Math.pow(darkProgress, 1.25));
      blackExtEl.style.transform = `scaleY(${blackScale.toFixed(4)})`;
    }

    // Seamlessly transition the document theme state to dark mode as the black expands
    if (darkProgress >= 0.5) {
      if (document.documentElement.getAttribute('data-theme') !== 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } else {
      if (document.documentElement.getAttribute('data-theme') !== 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
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

  // Sync with Kanri Theme Switcher if manual toggle occurs
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

  // Initial trigger on page load
  document.addEventListener('DOMContentLoaded', () => {
    updateParallax(window.scrollY || 0);
  });
})();
