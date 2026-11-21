/**
 * Kanri - Signature Animation Engine
 * Inspired by the Signature React component using La Storia Bold glyph paths.
 * Renders and animates @Omkarnub's calligraphic signature with SVG path stroke reveal.
 */

(function () {
  'use strict';

  function initSignature() {
    const signatureSvgs = document.querySelectorAll('.signature-svg');
    if (!signatureSvgs.length) return;

    signatureSvgs.forEach((svg) => {
      // Calculate total length for each path if browser needs explicit stroke-dasharray
      const strokePaths = svg.querySelectorAll('.sig-stroke-path');
      const maskPaths = svg.querySelectorAll('.sig-mask-path');

      function setupPaths() {
        strokePaths.forEach((path, i) => {
          try {
            const len = path.getTotalLength();
            if (len > 0) {
              path.style.setProperty('--path-len', len);
            }
          } catch (e) {
            // pathLength attribute acts as fallback
          }
        });

        maskPaths.forEach((path, i) => {
          try {
            const len = path.getTotalLength();
            if (len > 0) {
              path.style.setProperty('--path-len', len);
            }
          } catch (e) {
            // pathLength attribute acts as fallback
          }
        });
      }

      setupPaths();

      // Trigger animation function
      function triggerAnimation() {
        svg.classList.remove('animate');
        // Force reflow
        void svg.offsetWidth;
        svg.classList.add('animate');
      }

      // Replay functionality on click
      const wrapper = svg.closest('.creator-signature-card') || svg.parentElement;
      if (wrapper) {
        wrapper.addEventListener('click', (e) => {
          // If click was not directly following an active click
          triggerAnimation();
        });
      }

      // IntersectionObserver to animate when scrolled into view
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                triggerAnimation();
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.2,
            rootMargin: '0px 0px -40px 0px',
          }
        );

        observer.observe(svg);
      } else {
        // Fallback for browsers without IntersectionObserver
        setTimeout(triggerAnimation, 500);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignature);
  } else {
    initSignature();
  }

  // Global helper to replay signature
  window.replaySignature = function () {
    const signatureSvgs = document.querySelectorAll('.signature-svg');
    signatureSvgs.forEach((svg) => {
      svg.classList.remove('animate');
      void svg.offsetWidth;
      svg.classList.add('animate');
    });
  };
})();
