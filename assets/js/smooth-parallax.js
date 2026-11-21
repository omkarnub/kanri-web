/**
 * Smooth Momentum Parallax Engine for Kanri
 * Inspired by Lenis and GSAP ScrollTrigger multi-layer scrubbed pipelines.
 * Smooths page scroll and orchestrates differential 3D depth layers:
 *  - Layer 1: Far Paper / Living Landscape (InkBackground)
 *  - Layer 2: Huge KANRI Emblem & Brand Watermark (-32% differential travel)
 *  - Layer 3: Living Mid-ground Scene & Dynamic River (InkBackground scene)
 *  - Layer 4: Foreground Land & Reeds (+18% differential rise)
 *  - Layer 5: Hero Foreground Content & Obsidian Phone Frame
 */
(() => {
  'use strict';

  // State
  let targetY = window.scrollY || document.documentElement.scrollTop || 0;
  let currentY = targetY;
  let isTicking = false;
  const ease = 0.082; // Buttery smooth momentum dampening

  const emblemEl = document.getElementById('hero-bg-emblem');
  const heroSection = document.querySelector('.hero-section');
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual-wrapper');

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateParallax(y) {
    const vh = window.innerHeight || 800;
    const progress = y / vh;

    // 1. Update living ink wash canvas depth
    if (window.InkBackground && typeof window.InkBackground.setScroll === 'function') {
      window.InkBackground.setScroll(progress);
    }

    // 2. Huge KANRI Emblem Parallax (Moves at -32% rate with subtle scale & opacity fade)
    if (emblemEl) {
      const emblemTravel = -y * 0.32;
      const emblemScale = Math.max(0.85, 1 - progress * 0.08);
      const emblemOpacity = Math.max(0, 1 - progress * 1.25);

      emblemEl.style.transform = `translate3d(0, ${emblemTravel.toFixed(2)}px, 0) scale(${emblemScale.toFixed(3)})`;
      emblemEl.style.opacity = emblemOpacity.toFixed(3);
    }

    // 3. Subtle differential drift on hero content
    if (heroContent && !prefersReduced && y < vh * 1.5) {
      const contentTravel = -y * 0.12;
      heroContent.style.transform = `translate3d(0, ${contentTravel.toFixed(2)}px, 0)`;
    }

    // 4. Subtle differential drift on phone visual
    if (heroVisual && !prefersReduced && y < vh * 1.5) {
      const visualTravel = -y * 0.06;
      heroVisual.style.transform = `translate3d(0, ${visualTravel.toFixed(2)}px, 0)`;
    }
  }

  // Continuous Sub-Pixel Animation Frame Loop
  function tick() {
    if (prefersReduced) {
      updateParallax(window.scrollY);
      isTicking = false;
      return;
    }

    // Exponential smoothing (Lerp)
    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.1) {
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

  // Smooth Wheel Momentum Emulation (for desktop mouse wheel)
  // Provides fluid, trackpad-like inertial glide across desktop browsers
  let isWheelActive = false;
  let wheelTimeout = null;

  function onWheel(e) {
    // Only smooth standard mouse wheel (discrete delta mode)
    if (e.deltaMode !== 0 && e.deltaMode !== 1) return;
    
    // Allow default for special key modifiers (zoom, ctrl, shift horizontal)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Normalizing wheel velocity
    const maxDocScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const delta = e.deltaY * (e.deltaMode === 1 ? 24 : 1);

    targetY = Math.max(0, Math.min(maxDocScroll, targetY + delta * 0.85));

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(tick);
    }

    // Native scroll smooth synchronization
    window.scrollTo({
      top: targetY,
      behavior: 'auto'
    });

    e.preventDefault();
  }

  // Listen to native scroll
  window.addEventListener('scroll', onScroll, { passive: true });

  // Add smooth wheel listener on non-touch devices
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches && !prefersReduced) {
    window.addEventListener('wheel', onWheel, { passive: false });
  }

  // Sync with Kanri Theme Switcher
  const originalApplyTheme = window.KanriTheme ? window.KanriTheme.set : null;
  if (window.KanriTheme) {
    const notifyBgTheme = () => {
      const dt = document.documentElement.getAttribute('data-theme');
      const targetTheme = (dt === 'light') ? 'light' : 'dark';
      if (window.InkBackground && typeof window.InkBackground.setTheme === 'function') {
        window.InkBackground.setTheme(targetTheme);
      }
    };

    // Watch for data-theme mutations
    const themeObserver = new MutationObserver(notifyBgTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // Initial trigger
  document.addEventListener('DOMContentLoaded', () => {
    updateParallax(window.scrollY || 0);
  });
})();
