/**
 * Kanri - Signature Animation
 * Inspired by the Signature React component using La Storia Bold glyph paths.
 * Renders and animates @Omkarnub's calligraphic signature with SVG path stroke reveal.
 */

(function () {
  'use strict';

  function initSignature(root) {
    const scope = root || document;
    const signatureSvgs = scope.querySelectorAll('.signature-svg');
    if (!signatureSvgs.length) return;

    signatureSvgs.forEach((svg) => {
      const strokePaths = svg.querySelectorAll('.sig-stroke-path');
      const maskPaths = svg.querySelectorAll('.sig-mask-path');

      function setupPaths() {
        strokePaths.forEach((path) => {
          try {
            const len = path.getTotalLength();
            if (len > 0) {
              path.style.setProperty('--path-len', len);
            }
          } catch (e) {
            // pathLength attribute acts as fallback
          }
        });

        maskPaths.forEach((path) => {
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

      function triggerAnimation() {
        svg.classList.remove('animate');
        void svg.offsetWidth;
        svg.classList.add('animate');
      }

      const wrapper = svg.closest('.creator-signature-card') || svg.parentElement;
      if (wrapper) {
        wrapper.addEventListener('click', () => {
          triggerAnimation();
        });
      }

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
        setTimeout(triggerAnimation, 500);
      }
    });
  }

  function loadLazySignature() {
    const placeholder = document.getElementById('creator-signature-placeholder');
    if (!placeholder) {
      initSignature();
      return;
    }

    function fetchAndMount() {
      fetch('assets/signature-omkarnub.svg')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load signature SVG');
          return res.text();
        })
        .then((svgText) => {
          placeholder.innerHTML = svgText;
          initSignature(placeholder);
        })
        .catch(() => {
          // If fetch fails, keep noscript fallback visible
          const fallback = placeholder.querySelector('noscript');
          if (fallback) placeholder.innerHTML = fallback.innerHTML;
        });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            fetchAndMount();
          }
        },
        { rootMargin: '300px 0px' }
      );
      observer.observe(placeholder);
    } else {
      fetchAndMount();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLazySignature);
  } else {
    loadLazySignature();
  }

  window.replaySignature = function () {
    const signatureSvgs = document.querySelectorAll('.signature-svg');
    signatureSvgs.forEach((svg) => {
      svg.classList.remove('animate');
      void svg.offsetWidth;
      svg.classList.add('animate');
    });
  };
})();
