/**
 * Kanri Clean Navigation Menu & Shutter Drawer Engine
 * Purpose-built for pure site navigation.
 * Zero AI slop, zero preview card bloat.
 *
 * 100% Self-Hosted, Zero External Dependencies (uses local gsap.min.js when available).
 */
(() => {
  'use strict';

  let isOpen = false;
  let masterTl = null;

  document.addEventListener('DOMContentLoaded', () => {
    const menuSwitch = document.getElementById('menu-switch') || document.querySelector('.switch');
    const menuCheckbox = document.getElementById('menu-checkbox') || (menuSwitch ? menuSwitch.querySelector('input[type="checkbox"]') : null);
    const menuTrigger = document.getElementById('menu-trigger') || menuSwitch;
    const triggerReel = document.getElementById('trigger-reel');
    const dotGrid = document.getElementById('dot-grid');
    const shutterOverlay = document.getElementById('shutter-overlay');
    const shutterCols = document.querySelectorAll('.shutter-col');
    const drawerGroupLabels = document.querySelectorAll('.drawer-group-label');
    const drawerNavItems = document.querySelectorAll('.drawer-nav-item');
    const drawerBottom = document.getElementById('drawer-bottom');
    const starCountEl = document.querySelector('.star-count');

    if (!shutterOverlay) return;

    // -------------------------------------------------------------------------
    // 0. Header Scroll Visibility & Dynamic Black/White Contrast Engine
    // -------------------------------------------------------------------------
    function initHeaderScrollAndContrast() {
      const topHeader = document.querySelector('.top-header');
      const topNav = document.querySelector('.top-nav');
      const heroSection = document.getElementById('hero');
      if (!topHeader) return;

      function updateHeaderState() {
        const scrollY = window.scrollY || window.pageYOffset;
        const heroHeight = heroSection ? heroSection.offsetHeight : 650;
        const isPastHero = scrollY > (heroHeight - 100);

        document.body.classList.toggle('scrolled-past-hero', isPastHero);
        if (topNav) {
          topNav.classList.toggle('is-visible', isPastHero);
        }

        // Detect if background under the header is light or dark
        let isLight = !isPastHero; // Over hero canvas, background is light paper (#ECE6DA)

        if (isPastHero) {
          try {
            // Sample element under top-right header (x: innerWidth - 60, y: 35)
            const sampleX = Math.max(20, window.innerWidth - 60);
            const elUnder = document.elementFromPoint(sampleX, 35);
            if (elUnder) {
              const sec = elUnder.closest('section') || elUnder;
              let bg = window.getComputedStyle(sec).backgroundColor;
              if ((!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') && elUnder !== sec) {
                bg = window.getComputedStyle(elUnder).backgroundColor;
              }
              const rgbMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (rgbMatch) {
                const r = parseInt(rgbMatch[1], 10);
                const g = parseInt(rgbMatch[2], 10);
                const b = parseInt(rgbMatch[3], 10);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness > 165) {
                  isLight = true;
                }
              }
            }
          } catch (_) {}
        }

        document.body.classList.toggle('header-theme-light', isLight);
        document.body.classList.toggle('header-theme-dark', !isLight);
      }

      window.addEventListener('scroll', updateHeaderState, { passive: true });
      window.addEventListener('resize', updateHeaderState, { passive: true });
      updateHeaderState();
    }
    initHeaderScrollAndContrast();

    // -------------------------------------------------------------------------
    // 1. Fetch Live GitHub Stars with Local Storage Cache & Rolling Reels
    // -------------------------------------------------------------------------
    function initGitHubStars() {
      if (!starCountEl) return;
      const CACHE_KEY = 'kanri_github_stars_cache';
      const CACHE_TIME = 'kanri_github_stars_time';
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME);

      if (cached && cachedTime && (Date.now() - parseInt(cachedTime, 10) < 3600000)) {
        if (typeof window.rollDigitReel === 'function') {
          window.rollDigitReel(starCountEl, cached);
        }
        return;
      }

      fetch('https://api.github.com/repos/omkarnub/Kanri')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.stargazers_count === 'number') {
            if (typeof window.rollDigitReel === 'function') {
              window.rollDigitReel(starCountEl, data.stargazers_count);
            }
            localStorage.setItem(CACHE_KEY, data.stargazers_count);
            localStorage.setItem(CACHE_TIME, Date.now().toString());
          }
        })
        .catch(() => {
          // Keep default fallback
        });
    }
    initGitHubStars();

    // -------------------------------------------------------------------------
    // 2. Open & Close Animations
    // -------------------------------------------------------------------------
    function openDrawer() {
      if (isOpen) return;
      isOpen = true;

      document.body.classList.add('menu-open');
      if (menuCheckbox) menuCheckbox.checked = true;
      if (menuSwitch) menuSwitch.setAttribute('aria-expanded', 'true');
      if (menuTrigger && menuTrigger !== menuSwitch) menuTrigger.setAttribute('aria-expanded', 'true');
      shutterOverlay.setAttribute('aria-hidden', 'false');
      shutterOverlay.classList.add('is-interactive');

      if (typeof gsap === 'undefined') {
        shutterOverlay.style.visibility = 'visible';
        return;
      }

      if (masterTl) masterTl.kill();

      gsap.set(shutterOverlay, { visibility: 'visible' });
      gsap.set(drawerGroupLabels, { y: 12, opacity: 0 });
      gsap.set(drawerNavItems, { y: 16, opacity: 0 });
      gsap.set(drawerBottom, { y: 14, opacity: 0 });

      masterTl = gsap.timeline({ defaults: { overwrite: 'auto' } });

      masterTl
        // 1. Morph trigger text & dot grid if present
        if (triggerReel) masterTl.to(triggerReel, { yPercent: -50, duration: 0.38, ease: 'power3.inOut' }, 0);
        if (dotGrid) masterTl.to(dotGrid, { rotation: 135, scale: 0.92, duration: 0.45, ease: 'back.out(1.7)' }, 0);

      masterTl
        // 2. 5 vertical shutter blinds interlock from center outwards
        .to(shutterCols, {
          scaleY: 1,
          duration: 0.52,
          stagger: { each: 0.045, from: 'center' },
          ease: 'power4.inOut'
        }, 0.02)

        // 3. Navigation items stagger in
        .to(drawerGroupLabels, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power3.out'
        }, 0.28)
        .to(drawerNavItems, {
          y: 0,
          opacity: 1,
          duration: 0.42,
          stagger: 0.03,
          ease: 'power3.out'
        }, 0.32)
        .to(drawerBottom, {
          y: 0,
          opacity: 1,
          duration: 0.38,
          ease: 'power3.out'
        }, 0.44);
    }

    function closeDrawer(onCompleteCallback) {
      if (!isOpen) {
        if (typeof onCompleteCallback === 'function') onCompleteCallback();
        return;
      }
      isOpen = false;

      document.body.classList.remove('menu-open');
      if (menuCheckbox) menuCheckbox.checked = false;
      if (menuSwitch) menuSwitch.setAttribute('aria-expanded', 'false');
      if (menuTrigger && menuTrigger !== menuSwitch) menuTrigger.setAttribute('aria-expanded', 'false');
      shutterOverlay.setAttribute('aria-hidden', 'true');
      shutterOverlay.classList.remove('is-interactive');

      if (typeof gsap === 'undefined') {
        shutterOverlay.style.visibility = 'hidden';
        if (typeof onCompleteCallback === 'function') onCompleteCallback();
        return;
      }

      if (masterTl) masterTl.kill();

      masterTl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          if (!isOpen) {
            gsap.set(shutterOverlay, { visibility: 'hidden' });
            if (typeof onCompleteCallback === 'function') onCompleteCallback();
          }
        }
      });

      masterTl
        // 1. Reverse morph on trigger if present
        if (triggerReel) masterTl.to(triggerReel, { yPercent: 0, duration: 0.35, ease: 'power3.inOut' }, 0);
        if (dotGrid) masterTl.to(dotGrid, { rotation: 0, scale: 1, duration: 0.38, ease: 'power3.inOut' }, 0);

      masterTl
        // 2. Navigation items tuck away quickly
        .to([drawerNavItems, drawerGroupLabels, drawerBottom], {
          y: 10,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in'
        }, 0)

        // 3. Shutter blinds retract
        .to(shutterCols, {
          scaleY: 0,
          duration: 0.48,
          stagger: { each: 0.035, from: 'edges' },
          ease: 'power4.inOut'
        }, 0.1);
    }

    // -------------------------------------------------------------------------
    // 3. Event Bindings
    // -------------------------------------------------------------------------
    if (menuCheckbox) {
      menuCheckbox.addEventListener('change', () => {
        if (menuCheckbox.checked) openDrawer();
        else closeDrawer();
      });
    }

    if (menuSwitch) {
      menuSwitch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (menuCheckbox) {
            menuCheckbox.checked = !menuCheckbox.checked;
            menuCheckbox.dispatchEvent(new Event('change'));
          } else {
            if (isOpen) closeDrawer();
            else openDrawer();
          }
        }
      });
    }

    if (menuTrigger && menuTrigger !== menuSwitch && menuTrigger !== menuCheckbox) {
      menuTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (isOpen) closeDrawer();
        else openDrawer();
      });
    }

    // Smooth navigation for all internal anchor links in drawer and top nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (isOpen) {
            closeDrawer(() => {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Handle external or cross-page links inside drawer
    document.querySelectorAll('.drawer-nav-item, .footer-link').forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href.startsWith('#')) return; // Handled by anchor handler above
        if (this.target === '_blank') {
          // Allow default target="_blank"
          closeDrawer();
        } else {
          // Internal page jump
          e.preventDefault();
          closeDrawer(() => {
            window.location.href = href;
          });
        }
      });
    });

    // Keyboard Shortcuts (ESC to close, M to toggle)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      } else if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (isOpen) closeDrawer();
        else openDrawer();
      }
    });
  });
})();
