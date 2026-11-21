/**
 * Kanri Website Main Engine
 * Production monochrome interactive logic:
 * - Animated GitHub Star Counter with API hydration & easeOut animation
 * - Threat Model Continuous Stepper (4 stages, auto-playback, rail comet, dynamic scenes)
 * - Permissions Matrix Category Filter
 * - Bank & Payment Apps Instant Live Search Filter
 * - Cryptographic Checksum & Terminal Command Copy Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. ANIMATED GITHUB STAR COUNTER (Upward Rolling Digit Odometer)
  // =========================================================================
  const starCountEl = document.getElementById('github-star-count');

  function rollDigitReel(containerEl, targetNumber) {
    if (!containerEl) return;
    const num = typeof targetNumber === 'number' ? targetNumber : parseInt(targetNumber, 10);
    const targetVal = isNaN(num) ? 9 : num;
    const targetStr = targetVal.toLocaleString('en-US');

    containerEl.classList.add('odometer-mode');
    containerEl.innerHTML = '';

    const reelsToAnimate = [];

    for (let i = 0; i < targetStr.length; i++) {
      const ch = targetStr[i];
      if (ch >= '0' && ch <= '9') {
        const targetDigit = parseInt(ch, 10);

        const col = document.createElement('span');
        col.className = 'reel-digit';
        col.setAttribute('data-digit', targetDigit);

        const track = document.createElement('span');
        track.className = 'reel-track';

        // 2 complete cycles 0..9 (20 digits total)
        // Landing position is index 10 + targetDigit (smooth upward roll)
        for (let cycle = 0; cycle < 2; cycle++) {
          for (let d = 0; d <= 9; d++) {
            const item = document.createElement('span');
            item.className = 'reel-number';
            item.textContent = d.toString();
            track.appendChild(item);
          }
        }

        col.appendChild(track);
        containerEl.appendChild(col);

        // Initial position at 0%
        track.style.transform = 'translateY(0%)';
        track.style.transition = 'none';

        // Stagger upward roll delay per digit column
        const delayMs = i * 140;
        reelsToAnimate.push({
          track,
          targetPercent: -(10 + targetDigit) * 5, // 5% per item in 20 items
          delayMs
        });
      } else {
        const sep = document.createElement('span');
        sep.className = 'reel-char';
        sep.textContent = ch;
        containerEl.appendChild(sep);
      }
    }

    // Trigger upward rolling animation on next animation frames
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reelsToAnimate.forEach(({ track, targetPercent, delayMs }) => {
          track.style.transition = `transform 1.25s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`;
          track.style.transform = `translateY(${targetPercent}%)`;
        });
      });
    });
  }

  window.rollDigitReel = rollDigitReel;

  if (starCountEl) {
    let initialCount = parseInt(starCountEl.getAttribute('data-target') || '9', 10);
    if (isNaN(initialCount)) initialCount = 9;

    // Check sessionStorage cache first
    try {
      const cached = sessionStorage.getItem('kanri_github_stars');
      if (cached) {
        const cachedNum = parseInt(cached.replace(/,/g, ''), 10);
        if (!isNaN(cachedNum)) initialCount = cachedNum;
      }
    } catch (_) { }

    // Run initial upward roll
    rollDigitReel(starCountEl, initialCount);

    // Fetch live stars from GitHub API
    fetch('https://api.github.com/repos/omkarnub/Kanri')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && typeof data.stargazers_count === 'number') {
          const liveCount = data.stargazers_count;
          try {
            sessionStorage.setItem('kanri_github_stars', liveCount.toString());
          } catch (_) { }

          if (liveCount !== initialCount) {
            rollDigitReel(starCountEl, liveCount);
          }
        }
      })
      .catch(() => {
        // Retain initial roll gracefully
      });
  }

  // =========================================================================
  // 1B. APP SOVEREIGNTY STATS COUNTERS (useInView -100px, spring simulation)
  // =========================================================================
  const statCounterEls = document.querySelectorAll('.stat-counter');

  if (statCounterEls.length > 0) {
    function animateSpringCounter(el, target, duration = 1.5, prefix = '', suffix = '', decimals = 0) {
      const startTime = performance.now();
      const durationMs = duration * 1000;

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // Spring critically damped curve (bounce: 0) matching framer-motion useSpring
        const t = progress;
        const spring = progress === 1 ? 1 : 1 - (1 + 6 * t) * Math.exp(-6 * t);
        const current = target * spring;

        el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        }
      }
      requestAnimationFrame(step);
    }

    // Dynamic GitHub Releases API hydration for real APK download metrics
    fetch('https://api.github.com/repos/omkarnub/Kanri/releases')
      .then(res => res.json())
      .then(releases => {
        if (Array.isArray(releases)) {
          let totalDl = 0;
          releases.forEach(r => {
            (r.assets || []).forEach(a => {
              totalDl += (a.download_count || 0);
            });
          });
          if (totalDl > 0) {
            const dlCounter = document.querySelector('.stat-counter[data-value="841"]');
            if (dlCounter) {
              dlCounter.setAttribute('data-value', totalDl.toString());
            }
          }
        }
      })
      .catch(() => {});

    // IntersectionObserver with rootMargin: "-100px" matching Framer Motion's useInView margin: "-100px"
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          observer.unobserve(el);

          const value = parseFloat(el.getAttribute('data-value') || '0');
          const duration = parseFloat(el.getAttribute('data-duration') || '1.5');
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

          animateSpringCounter(el, value, duration, prefix, suffix, decimals);
        }
      });
    }, {
      root: null,
      rootMargin: '-100px 0px',
      threshold: 0.1
    });

    statCounterEls.forEach(el => observer.observe(el));
  }

  // =========================================================================
  // 2. THREAT MODEL CONTINUOUS STEPPER ENGINE
  // =========================================================================
  const threatSection = document.getElementById('security');
  if (threatSection) {
    const THREAT_STEPS = [
      {
        num: '01',
        eyebrow: 'Stage 01 · Volatile Ingress',
        title: 'Bank SMS / Alert Ingest',
        desc: 'Received strictly in volatile Android device memory. Transaction alerts bypass the OS network stack and external services entirely. Zero disk writes, zero cloud calls.',
        pills: ['In-Memory RAM', '0 KB Network', 'Volatile Heap', 'Zero Disk Trace']
      },
      {
        num: '02',
        eyebrow: 'Stage 02 · Zero-Network Parsing',
        title: 'Local Regex Parser',
        desc: 'Deterministic precompiled regex engines extract amount, merchant, and UPI reference in < 2ms in memory. OTPs and sensitive authentication tokens are rejected automatically.',
        pills: ['Deterministic Engine', '1.2ms Latency', 'In-Memory', 'OTP Discard']
      },
      {
        num: '03',
        eyebrow: 'Stage 03 · Temporal Deduplication',
        title: '5-Min Sliding Dedupe',
        desc: 'Bi-directional temporal buffer merges bank SMS and UPI payment app alerts by UTR reference within a 300-second window. Prevents duplicate expense entries automatically.',
        pills: ['UTR Reference', 'Δt = 300s Window', 'Stream Merger', 'Zero Double-Count']
      },
      {
        num: '04',
        eyebrow: 'Stage 04 · Hardware Key Sealing',
        title: 'SQLCipher AES-256 Vault',
        desc: 'All SQLite database files are encrypted at rest using 256-bit AES cipher blocks. Encryption keys are generated and sealed within the Android Keystore hardware TEE / StrongBox.',
        pills: ['SQLCipher AES-256', 'Android Keystore', 'Hardware TEE', 'PBKDF2 64k']
      }
    ];

    const railFill = document.getElementById('threat-rail-fill');
    const railComet = document.getElementById('threat-rail-comet');
    const stepNumEl = document.getElementById('threat-step-num');
    const playbackToggle = document.getElementById('threat-playback-toggle');
    const playbackLabel = document.getElementById('threat-playback-label');

    const watermark = document.getElementById('threat-watermark');
    const copyEyebrow = document.getElementById('threat-eyebrow');
    const copyTitle = document.getElementById('threat-title');
    const copyDesc = document.getElementById('threat-desc');
    const copyPills = document.getElementById('threat-pills');

    const nodeCols = Array.from(threatSection.querySelectorAll('.threat-node-col'));
    const scenes = [
      document.getElementById('threat-scene-0'),
      document.getElementById('threat-scene-1'),
      document.getElementById('threat-scene-2'),
      document.getElementById('threat-scene-3')
    ];

    let currentStep = 0;
    let isAutoPlaying = true;
    let stepTimer = null;
    const STEP_DURATION = 4200; // 4.2 seconds per step

    function setStep(idx, manual = false) {
      if (manual && isAutoPlaying) {
        // Pause auto-playback on manual interaction
        togglePlayback(false);
      }

      currentStep = (idx + THREAT_STEPS.length) % THREAT_STEPS.length;
      const data = THREAT_STEPS[currentStep];

      // Update Header & Stepper Rail
      if (stepNumEl) stepNumEl.textContent = data.num;

      nodeCols.forEach((col, i) => {
        const isActive = i === currentStep;
        col.classList.toggle('is-active', isActive);
        const btn = col.querySelector('.threat-node-btn');
        if (btn) btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update Continuous Track Fill & Comet
      const pct = (currentStep / (THREAT_STEPS.length - 1)) * 100;
      if (railFill) railFill.style.transform = `scaleX(${currentStep / (THREAT_STEPS.length - 1)})`;
      if (railComet) railComet.style.left = `${pct}%`;

      // Update Editorial Copy
      if (watermark) watermark.textContent = data.num;
      if (copyEyebrow) copyEyebrow.textContent = data.eyebrow;
      if (copyTitle) copyTitle.textContent = data.title;
      if (copyDesc) copyDesc.textContent = data.desc;

      if (copyPills) {
        copyPills.innerHTML = data.pills
          .map(pill => `<span class="threat-pill">${pill}</span>`)
          .join('');
      }

      // Update Visualizer Scene
      scenes.forEach((scene, i) => {
        if (!scene) return;
        scene.classList.toggle('is-active', i === currentStep);
      });
    }

    function scheduleNext() {
      clearTimeout(stepTimer);
      if (!isAutoPlaying) return;
      stepTimer = setTimeout(() => {
        if (isAutoPlaying) {
          setStep((currentStep + 1) % THREAT_STEPS.length);
          scheduleNext();
        }
      }, STEP_DURATION);
    }

    function togglePlayback(forceState = null) {
      isAutoPlaying = forceState !== null ? forceState : !isAutoPlaying;
      if (playbackToggle) {
        playbackToggle.setAttribute('aria-pressed', isAutoPlaying ? 'true' : 'false');
        playbackToggle.classList.toggle('is-paused', !isAutoPlaying);
      }
      if (playbackLabel) {
        playbackLabel.textContent = isAutoPlaying ? 'Auto' : 'Paused';
      }

      if (isAutoPlaying) {
        scheduleNext();
      } else {
        clearTimeout(stepTimer);
      }
    }

    if (playbackToggle) {
      playbackToggle.addEventListener('click', () => {
        togglePlayback();
      });
    }

    nodeCols.forEach((col, i) => {
      col.addEventListener('click', () => {
        setStep(i, true);
      });
    });

    // Initialize step 0
    setStep(0);
    scheduleNext();
  }

  // =========================================================================
  // 3. PERMISSIONS MATRIX CATEGORY FILTER
  // =========================================================================
  const permFilterBtns = document.querySelectorAll('[data-perm-filter]');
  const permCards = document.querySelectorAll('.perm-card');

  if (permFilterBtns.length > 0 && permCards.length > 0) {
    permFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-perm-filter');

        permFilterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        permCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // =========================================================================
  // 4. BANK & PAYMENT APPS LIVE SEARCH FILTER
  // =========================================================================
  const bankSearchInput = document.getElementById('bank-search-input');
  const bankTags = document.querySelectorAll('.bank-tag');
  const bankSearchCount = document.getElementById('bank-search-count');

  if (bankSearchInput && bankTags.length > 0) {
    bankSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      let matchCount = 0;

      bankTags.forEach(tag => {
        const text = (tag.getAttribute('data-name') || tag.textContent).toLowerCase();
        if (!q) {
          tag.classList.remove('is-match', 'is-dimmed');
          matchCount++;
        } else if (text.includes(q)) {
          tag.classList.add('is-match');
          tag.classList.remove('is-dimmed');
          matchCount++;
        } else {
          tag.classList.remove('is-match');
          tag.classList.add('is-dimmed');
        }
      });

      if (bankSearchCount) {
        if (!q) {
          bankSearchCount.textContent = `Showing all ${bankTags.length} verified formats`;
        } else {
          bankSearchCount.textContent = `${matchCount} format${matchCount === 1 ? '' : 's'} matched`;
        }
      }
    });
  }

  // =========================================================================
  // 5. CLIPBOARD COPY HELPERS WITH TACTILE FEEDBACK
  // =========================================================================
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const text = targetEl.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const origText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = origText;
          btn.classList.remove('copied');
        }, 2200);
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          const origText = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = origText;
            btn.classList.remove('copied');
          }, 2200);
        } catch (_) { }
        document.body.removeChild(textarea);
      });
    });
  });

  // =========================================================================
  // 6. TERMINAL VERIFICATION TAB SWITCHER
  // =========================================================================
  const termTabs = document.querySelectorAll('[data-term-tab]');
  const termCodeEl = document.getElementById('term-verify-code');

  const COMMANDS = {
    pwsh: 'Get-FileHash Kanri-v1.19.8-release.apk -Algorithm SHA256',
    bash: 'shasum -a 256 Kanri-v1.19.8-release.apk'
  };

  if (termTabs.length > 0 && termCodeEl) {
    termTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetType = tab.getAttribute('data-term-tab');
        termTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (COMMANDS[targetType]) {
          termCodeEl.textContent = COMMANDS[targetType];
        }
      });
    });
  }

  // =========================================================================
  // 7. MOBILE NAVIGATION TOGGLE (IF PRESENT)
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mainNav.style.display === 'flex';
      mainNav.style.display = isExpanded ? '' : 'flex';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
    });
  }
});
