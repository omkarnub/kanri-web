/**
 * Kanri Flagship Cinematic Hero Animation
 * Physical Skeuomorphic Materials, 3D Depth, High-Performance Mouse Interaction,
 * and Buttery-Smooth Scrubbed Scroll Timeline via GSAP & ScrollTrigger.
 */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.cinematic-hero-container');
    const mainCard = document.getElementById('main-hero-card');
    const mockup = document.getElementById('cinematic-mockup');

    if (!container || !mainCard || !mockup) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded; falling back to visible state.');
      document.querySelectorAll('.gsap-reveal').forEach(el => {
        el.style.visibility = 'visible';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;
    const metricValue = 1400;

    // -------------------------------------------------------------------------
    // 1. High-Performance Mouse Interaction Logic (via requestAnimationFrame)
    // -------------------------------------------------------------------------
    let requestRef = 0;

    const handleMouseMove = (e) => {
      if (window.scrollY > window.innerHeight * 4) return;
      if (window.innerWidth < 768) return;

      cancelAnimationFrame(requestRef);

      requestRef = requestAnimationFrame(() => {
        const rect = mainCard.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        mainCard.style.setProperty('--mouse-x', `${mouseX}px`);
        mainCard.style.setProperty('--mouse-y', `${mouseY}px`);

        const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(mockup, {
          rotationY: xVal * 12,
          rotationX: -yVal * 12,
          ease: 'power3.out',
          duration: 1.2,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // -------------------------------------------------------------------------
    // 2. Smooth Cinematic Scroll Timeline via GSAP & ScrollTrigger
    // -------------------------------------------------------------------------
    const ctx = gsap.context(() => {
      // Set initial states - crisp, vector-sharp rendering with zero blur filters
      gsap.set('.text-track', { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set('.text-days', { autoAlpha: 1 });
      gsap.set('.main-card', { y: window.innerHeight * 0.85, autoAlpha: 1, scale: 0.96 });
      gsap.set(['.card-left-text', '.mockup-scroll-wrapper', '.floating-badge', '.phone-widget'], { autoAlpha: 0 });
      gsap.set('.cta-wrapper', { autoAlpha: 0, scale: 0.95, y: 30 });

      // Scroll-Driven Pinned scrub timeline with buttery-smooth inertial interpolation (scrub: 1)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onEnter: () => triggerLiveSimulation(),
          onUpdate: (self) => {
            if (self.progress > 0.22 && !hasTriggeredPopup) {
              triggerLiveSimulation();
            } else if (self.progress < 0.12 && hasTriggeredPopup) {
              resetSimulation();
            }
          },
          onLeaveBack: () => resetSimulation()
        },
      });

      scrollTl
        // 1. Hero text smoothly scales up and fades out cleanly without rasterizing blur
        .to('.hero-text-wrapper', { scale: 1.08, y: -60, autoAlpha: 0, opacity: 0, ease: 'power2.inOut', duration: 1.2 }, 0)
        .to('.bg-grid-theme', { scale: 1.08, opacity: 0.12, ease: 'power2.inOut', duration: 1.5 }, 0)
        // 2. Obsidian card glides smoothly into center with pure GPU translation
        .to('.main-card', { y: 0, scale: 1, ease: 'power2.out', duration: 1.5 }, 0)

        // 3. Mockup plunges in smoothly from 3D depth into dead center
        .fromTo('.mockup-scroll-wrapper',
          { y: 120, z: -300, rotationX: 25, rotationY: -15, autoAlpha: 0, scale: 0.8 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: 'power3.out', duration: 1.6 }, '-=0.5'
        )

        // 4. In-App phone widgets stagger in
        .fromTo('.phone-widget', { y: 20, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.08, ease: 'power2.out', duration: 1.0 }, '-=1.0')

        // 5. Dial progress ring fills & counter ticks up to 1,400
        .to('.progress-ring', { strokeDashoffset: 60, duration: 1.4, ease: 'power2.inOut' }, '-=0.8')
        .to('#hero-counter-val', { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 1.4, ease: 'power2.out' }, '-=1.4')

        // 6. Floating glass badges pop in flanking the phone
        .fromTo('.floating-badge', { y: 40, autoAlpha: 0, scale: 0.88 }, { y: 0, autoAlpha: 1, scale: 1, ease: 'back.out(1.2)', duration: 1.0, stagger: 0.12 }, '-=1.0')

        // 7. Value proposition slides in on left
        .fromTo('.card-left-text', { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power2.out', duration: 1.0 }, '-=1.0')

        // Hold pause for viewing showcase
        .to({}, { duration: 1.6 })

        // 8. Mockup and showcase elements smoothly fade out with GPU transform
        .to(['.mockup-scroll-wrapper', '.floating-badge', '.card-left-text'], {
          scale: 0.92, y: -25, autoAlpha: 0, ease: 'power2.in', duration: 0.9, stagger: 0.03,
        })

        // 9. Card settles with subtle scale and CTA resolves with crystal-clear vector sharpness (NO BLUR!)
        .to('.main-card', {
          scale: 0.96,
          ease: 'power2.inOut',
          duration: 1.2,
        }, 'pullback')
        .fromTo('.cta-wrapper',
          { autoAlpha: 0, y: 30, scale: 0.95, pointerEvents: 'none' },
          { autoAlpha: 1, y: 0, scale: 1, pointerEvents: 'auto', ease: 'power2.out', duration: 1.1 },
          'pullback+=0.2'
        )

        // Hold pause on CTA - cleanly unpins into How Kanri Works
        .to({}, { duration: 0.8 });

    }, container);

    // -------------------------------------------------------------------------
    // 3. Inside-Phone Live Transaction Detected Popup Sequence
    // -------------------------------------------------------------------------
    let hasTriggeredPopup = false;
    let popupTimer = 0;

    function resetSimulation() {
      const smsToast = document.getElementById('incoming-sms-toast');
      const txCard = document.getElementById('tx-detected-card');
      const loggedStatus = document.getElementById('tx-logged-status');
      const counterVal = document.getElementById('hero-counter-val');
      const progressRing = document.getElementById('hero-progress-ring');

      clearTimeout(popupTimer);
      if (smsToast) smsToast.classList.remove('visible');
      if (txCard) txCard.classList.remove('visible');
      if (loggedStatus) loggedStatus.classList.remove('active');
      if (counterVal) counterVal.textContent = '1,400';
      if (progressRing) progressRing.style.strokeDashoffset = '60';
      hasTriggeredPopup = false;
    }

    function triggerLiveSimulation() {
      if (hasTriggeredPopup) return;
      hasTriggeredPopup = true;

      const smsToast = document.getElementById('incoming-sms-toast');
      const txCard = document.getElementById('tx-detected-card');
      const loggedStatus = document.getElementById('tx-logged-status');
      const counterVal = document.getElementById('hero-counter-val');
      const progressRing = document.getElementById('hero-progress-ring');

      if (!smsToast || !txCard) return;

      clearTimeout(popupTimer);
      popupTimer = setTimeout(() => {
        // Step A: Bank SMS Notification slides in cleanly from top
        smsToast.classList.add('visible');

        popupTimer = setTimeout(() => {
          // Step B: Transaction Detected Card springs in smoothly from bottom
          txCard.classList.add('visible');

          popupTimer = setTimeout(() => {
            // Step C: Auto-categorize to Food & Dining, update Safe-to-Spend badge
            if (loggedStatus) loggedStatus.classList.add('active');

            popupTimer = setTimeout(() => {
              // Step D: Dial ticks down in real time: ₹1400 -> ₹980 (-₹420 Swiggy)
              if (counterVal) {
                let start = 1400;
                let end = 980;
                let startTime = performance.now();
                function tick(now) {
                  let progress = Math.min(1, (now - startTime) / 500);
                  let curr = Math.round(start + (end - start) * progress);
                  counterVal.textContent = curr.toLocaleString();
                  if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
              }

              if (progressRing) {
                progressRing.style.strokeDashoffset = '140';
              }
              // The popup stays cleanly visible inside the phone while viewing!
            }, 500);
          }, 800);
        }, 600);
      }, 400);
    }
  });
})();
