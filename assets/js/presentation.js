/**
 * Kanri Professional Presentation Styles — Entrance & Fade-in Animations
 * Smooth, choreographed initial page entrance & high-performance scroll reveals.
 */

(function () {
  'use strict';

  // Mark JS enabled immediately to activate presentation animations
  document.documentElement.classList.add('js-enabled');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initPresentation() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.top-header, #bg, .hero-section, .reveal-on-scroll, .reveal-scale, .reveal-fade').forEach((el) => {
        el.classList.add('header-revealed', 'bg-revealed', 'hero-revealed', 'is-revealed');
      });
      return;
    }

    // -------------------------------------------------------------------------
    // 1. Initial Page & Hero Choreographed Reveal (When user starts website)
    // -------------------------------------------------------------------------
    const header = document.querySelector('.top-header');
    const heroBg = document.getElementById('bg');
    const heroSection = document.getElementById('hero');

    requestAnimationFrame(() => {
      // Header descends into place
      if (header) {
        setTimeout(() => header.classList.add('header-revealed'), 80);
      }

      // Living canvas ink washes in
      if (heroBg) {
        setTimeout(() => heroBg.classList.add('bg-revealed'), 120);
      }

      // Hero brand centerpiece staggers in
      if (heroSection) {
        setTimeout(() => heroSection.classList.add('hero-revealed'), 150);
      }
    });

    // -------------------------------------------------------------------------
    // 2. Auto-Enhance Presentation Elements Across Website
    // -------------------------------------------------------------------------
    const targetSelectors = [
      '.section-header',
      '.stat-card',
      '.flow-step-card',
      '.feature-card',
      '.feature-row',
      '.security-card',
      '.threat-card',
      '.permission-card',
      '.battle-card',
      '.principle-matrix-container',
      '.bank-search-bar',
      '.download-card',
      '.faq-item',
      '.footer-col',
      '.creator-signature-card'
    ];

    const elementsToReveal = new Set(document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-fade'));

    targetSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        // Exclude elements inside the pinned GSAP cinematic container
        if (el.closest('.cinematic-hero-container')) return;

        if (!el.classList.contains('reveal-on-scroll') && !el.classList.contains('reveal-scale') && !el.classList.contains('reveal-fade')) {
          if (el.classList.contains('stat-card') || el.classList.contains('download-card') || el.classList.contains('battle-card')) {
            el.classList.add('reveal-scale');
          } else {
            el.classList.add('reveal-on-scroll');
          }
        }
        elementsToReveal.add(el);
      });
    });

    // Auto-assign staggered delays to direct sibling cards in grids / flex containers
    const parentContainers = document.querySelectorAll('.footer-grid, .philosophy-battleboard, .stat-grid, .app-stats-grid, .faq-grid');
    parentContainers.forEach((parent) => {
      const children = Array.from(parent.children).filter((child) => child.classList.contains('reveal-on-scroll') || child.classList.contains('reveal-scale'));
      children.forEach((child, idx) => {
        const staggerClass = `stagger-${Math.min(idx + 1, 8)}`;
        child.classList.add(staggerClass);
      });
    });

    // -------------------------------------------------------------------------
    // 3. IntersectionObserver for Silky-Smooth In-View Fade-In
    // -------------------------------------------------------------------------
    function revealElement(el) {
      el.classList.add('is-revealed');
      // Free GPU memory after animation finishes
      const onEnd = () => {
        el.style.willChange = 'auto';
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd, { once: true });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealElement(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -30px 0px',
        }
      );

      elementsToReveal.forEach((el) => {
        // If element is already in initial viewport on page start, reveal with slight stagger
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => revealElement(el), 120);
        } else {
          observer.observe(el);
        }
      });
    } else {
      // Fallback for older browsers
      elementsToReveal.forEach((el) => revealElement(el));
    }

    // -------------------------------------------------------------------------
    // 4. Universal Failsafe: Guarantee Everything is Revealed
    // -------------------------------------------------------------------------
    setTimeout(() => {
      elementsToReveal.forEach((el) => {
        if (!el.classList.contains('is-revealed')) {
          el.classList.add('is-revealed');
        }
      });
      if (header && !header.classList.contains('header-revealed')) {
        header.classList.add('header-revealed');
      }
      if (heroSection && !heroSection.classList.contains('hero-revealed')) {
        heroSection.classList.add('hero-revealed');
      }
      if (heroBg && !heroBg.classList.contains('bg-revealed')) {
        heroBg.classList.add('bg-revealed');
      }
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPresentation);
  } else {
    initPresentation();
  }
})();
