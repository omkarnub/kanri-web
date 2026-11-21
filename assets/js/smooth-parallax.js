/**
 * Parallax Engine for Kanri
 * Coordinates differential 3D depth layers without hijacking native browser scroll:
 *  - Layer 1: Living Landscape Ink Wash (InkBackground)
 *  - Layer 2: Centered KANRI Emblem & Brand Title (-30% differential rate)
 *  - Layer 3: Foreground Land & Mist
 * Native scrolling remains 100% natural and fluid with zero resistance.
 */
(() => {
  'use strict';

  let currentY = window.scrollY || document.documentElement.scrollTop || 0;
  let targetY = currentY;
  let isTicking = false;
  const ease = 0.12; // Snappy, responsive interpolation for visual layers

  const emblemEl = document.getElementById('hero-brand-centerpiece') || document.getElementById('hero-bg-emblem');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateParallax(y) {
    const vh = window.innerHeight || 800;
    const progress = y / vh;

    // 1. Update living ink wash canvas depth
    if (window.InkBackground && typeof window.InkBackground.setScroll === 'function') {
      window.InkBackground.setScroll(progress);
    }

    // 2. KANRI Emblem & Brand Centerpiece Parallax (Differential travel with smooth scale & fade)
    if (emblemEl) {
      if (prefersReduced) {
        emblemEl.style.transform = '';
        emblemEl.style.opacity = '';
      } else {
        const emblemTravel = -y * 0.30;
        const emblemScale = Math.max(0.85, 1 - progress * 0.08);
        const emblemOpacity = Math.max(0, 1 - progress * 1.2);

        emblemEl.style.transform = `translate3d(0, ${emblemTravel.toFixed(2)}px, 0) scale(${emblemScale.toFixed(3)})`;
        emblemEl.style.opacity = emblemOpacity.toFixed(3);
      }
    }
  }

  // Animation frame interpolation loop
  function tick() {
    if (prefersReduced) {
      updateParallax(window.scrollY || 0);
      isTicking = false;
      return;
    }

    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.2) {
      currentY += diff * ease;
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

  // Native passive scroll listener — zero resistance, full native performance
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
