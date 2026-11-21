/**
 * Kanri Website — How Kanri Works (Interactive Cinematic Theater Engine)
 * Self-hosted, 60fps canvas & SVG pipeline with zero external dependencies.
 */
(function () {
  'use strict';

  const STEPS = [
    {
      num: '01',
      eyebrow: '01 · Universal Capture',
      title: 'Pay Anywhere',
      desc: 'UPI via GPay, PhonePe, Paytm, or CRED — plus cards, net banking, and ATM cash withdrawals.',
      pills: ['UPI Rails', 'Cards', 'Net Banking', 'ATM Cash'],
      footer: '01 — Pay Anywhere'
    },
    {
      num: '02',
      eyebrow: '02 · Dual-Engine Ingestion',
      title: 'SMS + Notification Fusion',
      desc: 'SMS messages provide authoritative amounts and bank balances, while UPI notifications provide rich merchant names and recipient VPA addresses. Kanri’s 5-minute sliding window deduplication engine correlates SMS and notification alerts using UTR references and timestamps, merging them into a single clean transaction with zero duplicate records.',
      pills: ['5-Min Sliding Window', 'UTR Correlation', 'Zero Duplication', 'Dual Ingestion'],
      footer: '02 — SMS + Notification Fusion with 5-Minute Deduplication'
    },
    {
      num: '03',
      eyebrow: '03 · Local Engine',
      title: 'Instant On-Device Parse',
      desc: 'Local silicon regex detects transactional bank SMS and payment notifications in memory within 1.1ms. Zero network connection, 100% offline.',
      pills: ['Local Regex', 'In-Memory', '0 KB Network', '1.1ms'],
      footer: '03 — Instant On-Device Parse'
    },
    {
      num: '04',
      eyebrow: '04 · Zero Effort',
      title: '1-Tap Categorization',
      desc: 'Confirm the category in 1 tap from a floating overlay as you walk away, or let deterministic merchant rules auto-categorize into your double-entry ledger.',
      pills: ['Floating Overlay', '1-Tap Logging', 'Merchant Rules', 'Double-Entry'],
      footer: '04 — 1-Tap Categorization'
    }
  ];

  // Timing: 4.5s per step = 18.0s full cycle
  const STEP_DURATION = 4.5;
  const TOTAL_CYCLE = STEP_DURATION * 4;

  let isPlaying = true;
  let isVisible = true;
  let cycleTime = 0;
  let activeStep = -1;

  // DOM Elements
  const section = document.getElementById('how-it-works');
  if (!section) return;

  const railFill = document.getElementById('rail-fill');
  const railComet = document.getElementById('rail-comet');
  const stepNumEl = document.getElementById('step-num');
  const footerStatus = document.getElementById('footer-status');
  const playbackToggle = document.getElementById('playback-toggle');
  const playbackLabel = document.getElementById('playback-label');

  const watermark = document.getElementById('watermark');
  const copyContent = document.getElementById('copy-content');
  const copyEyebrow = document.getElementById('copy-eyebrow');
  const copyTitle = document.getElementById('copy-title');
  const copyDesc = document.getElementById('copy-desc');
  const copyPills = document.getElementById('copy-pills');

  const nodeCols = Array.from(section.querySelectorAll('.rail-node-col'));
  const nodeBtns = Array.from(section.querySelectorAll('.node-btn'));
  const scenes = [
    document.getElementById('scene-0'),
    document.getElementById('scene-fusion'),
    document.getElementById('scene-1'),
    document.getElementById('scene-2')
  ];

  // =========================================================================
  // SCENE 01 — 60FPS RETINA CANVAS PAYMENT CONSTELLATION
  // =========================================================================
  const payCanvas = document.getElementById('pay-canvas');
  if (!payCanvas) return;
  const payCtx = payCanvas.getContext('2d');
  const payCore = document.getElementById('pay-core');
  const payAmt = document.getElementById('pay-amt');
  const payRail = document.getElementById('pay-rail');

  const PAY_FEEDS = [
    { corner: 0, amt: '₹420', rail: 'GPAY UPI' },
    { corner: 1, amt: '₹185', rail: 'PHONEPE' },
    { corner: 2, amt: '₹2,490', rail: 'CRED CARD' },
    { corner: 3, amt: '₹5,000', rail: 'ATM CASH' }
  ];

  const ripples = [];
  let payPulseClock = 0;
  let payFeedIdx = 0;
  let currentPacket = { active: true, corner: 0, arrived: false };

  function resizePayCanvas() {
    if (!payCanvas || !payCanvas.parentElement) return;
    const rect = payCanvas.parentElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    payCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    payCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    payCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function bezierPoint(p0, p1, p2, t) {
    const inv = 1 - t;
    return {
      x: inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
      y: inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y
    };
  }

  function drawPayScene(dt, elapsed) {
    if (!payCanvas || !payCanvas.parentElement) return;
    const rect = payCanvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.floor(w * dpr));
    const targetH = Math.max(1, Math.floor(h * dpr));
    if (payCanvas.width !== targetW || payCanvas.height !== targetH) {
      payCanvas.width = targetW;
      payCanvas.height = targetH;
      payCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    payCtx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const anchors = [
      { x: w * 0.16, y: h * 0.22 },
      { x: w * 0.84, y: h * 0.22 },
      { x: w * 0.16, y: h * 0.78 },
      { x: w * 0.84, y: h * 0.78 }
    ];
    const controls = [
      { x: w * 0.34, y: h * 0.24 },
      { x: w * 0.66, y: h * 0.24 },
      { x: w * 0.34, y: h * 0.76 },
      { x: w * 0.66, y: h * 0.76 }
    ];

    // Rotating precision orbital dial around center
    payCtx.save();
    payCtx.translate(cx, cy);
    payCtx.rotate(elapsed * 0.2);
    payCtx.strokeStyle = 'rgba(250, 249, 245, 0.2)';
    payCtx.lineWidth = 1;
    payCtx.setLineDash([2, 8]);
    payCtx.beginPath();
    payCtx.arc(0, 0, 74, 0, Math.PI * 2);
    payCtx.stroke();
    payCtx.setLineDash([]);
    payCtx.restore();

    // Subtle dashed guide curves from all 4 payment rails
    anchors.forEach((pt, idx) => {
      payCtx.save();
      payCtx.strokeStyle = idx === currentPacket.corner ? 'rgba(250, 249, 245, 0.45)' : 'rgba(255, 255, 255, 0.08)';
      payCtx.lineWidth = 1.2;
      payCtx.setLineDash([4, 6]);
      payCtx.beginPath();
      payCtx.moveTo(pt.x, pt.y);
      payCtx.quadraticCurveTo(controls[idx].x, controls[idx].y, cx, cy);
      payCtx.stroke();
      payCtx.restore();
    });

    // Advance luminous packet along active curve
    payPulseClock += dt;
    const flightDuration = 0.85;
    const cycleDur = 1.45;
    const localT = payPulseClock % cycleDur;

    if (payPulseClock >= cycleDur) {
      payPulseClock -= cycleDur;
      payFeedIdx = (payFeedIdx + 1) % PAY_FEEDS.length;
      currentPacket.corner = PAY_FEEDS[payFeedIdx].corner;
      currentPacket.arrived = false;
    }

    for (let i = 0; i < 4; i++) {
      const badge = document.getElementById(`badge-${i}`);
      if (badge) {
        badge.classList.toggle('is-lit', i === currentPacket.corner);
      }
    }

    const normFlight = Math.min(1, localT / flightDuration);
    const eased = normFlight < 0.5
      ? 4 * normFlight * normFlight * normFlight
      : 1 - Math.pow(-2 * normFlight + 2, 3) / 2;

    if (normFlight < 1) {
      const p0 = anchors[currentPacket.corner];
      const p1 = controls[currentPacket.corner];
      const p2 = { x: cx, y: cy };

      // Glowing comet trail
      for (let k = 0; k < 12; k++) {
        const trailT = Math.max(0, eased - k * 0.022);
        const pt = bezierPoint(p0, p1, p2, trailT);
        const alpha = (1 - k / 12) * 0.9;
        const radius = (1 - k / 12) * 3.4 + 0.6;
        payCtx.beginPath();
        payCtx.fillStyle = k === 0 ? '#FFFFFF' : `rgba(250, 249, 245, ${alpha})`;
        payCtx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        payCtx.fill();
      }
    } else if (!currentPacket.arrived) {
      currentPacket.arrived = true;
      const feed = PAY_FEEDS[payFeedIdx];
      if (payAmt) payAmt.textContent = feed.amt;
      if (payRail) payRail.textContent = feed.rail;
      if (payCore) {
        payCore.classList.add('is-bump');
        setTimeout(() => payCore.classList.remove('is-bump'), 220);
      }
      ripples.push({ r: 55, alpha: 0.75, color: 'rgba(250, 249, 245, ' });
      ripples.push({ r: 48, alpha: 0.45, color: 'rgba(255, 255, 255, ' });
    }

    // Expanding monochrome creamish sonar ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += dt * 82;
      rip.alpha -= dt * 0.68;
      if (rip.alpha <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      payCtx.beginPath();
      payCtx.strokeStyle = `${rip.color}${rip.alpha})`;
      payCtx.lineWidth = 1.3;
      payCtx.arc(cx, cy, rip.r, 0, Math.PI * 2);
      payCtx.stroke();
    }
  }

  // =========================================================================
  // SCENE 02 — DUAL-ENGINE INGESTION & 5-MINUTE DEDUPLICATION
  // =========================================================================
  function updateFusionScene(stepProgress) {
    const cardGpay = document.getElementById('fusion-card-gpay');
    const cardHdfc = document.getElementById('fusion-card-hdfc');
    const scanLaser = document.getElementById('fusion-laser');
    const resultCard = document.getElementById('fusion-result');

    // Laser sweeps across the 5-minute window
    if (scanLaser) {
      const laserX = Math.min(100, Math.max(0, (stepProgress - 0.15) * 160));
      scanLaser.style.transform = `translateX(${laserX * 4}%)`;
      scanLaser.style.opacity = stepProgress > 0.15 && stepProgress < 0.75 ? '1' : '0';
    }

    // GPay arrives early at t=0s
    if (cardGpay) {
      cardGpay.classList.toggle('is-arrived', stepProgress > 0.08);
      cardGpay.classList.toggle('is-matched', stepProgress > 0.38);
    }

    // HDFC SMS arrives at t+42s
    if (cardHdfc) {
      cardHdfc.classList.toggle('is-arrived', stepProgress > 0.22);
      cardHdfc.classList.toggle('is-matched', stepProgress > 0.38);
    }

    // Merged record appears at stepProgress > 0.48
    if (resultCard) {
      resultCard.classList.toggle('is-merged', stepProgress > 0.45);
    }
  }

  // =========================================================================
  // SCENE 03 — ON-DEVICE SILICON REGEX PIPELINE
  // =========================================================================
  const PARSE_DATA = [
    { rawAmt: 'Rs.420.00', amt: '₹420', rail: 'UPI', rawMerch: 'BLINKIT', merch: 'Blinkit', ms: '1.1 ms' },
    { rawAmt: 'Rs.315.00', amt: '₹315', rail: 'UPI', rawMerch: 'SWIGGY', merch: 'Swiggy', ms: '0.9 ms' },
    { rawAmt: 'Rs.1,890.00', amt: '₹1,890', rail: 'CARD', rawMerch: 'AIRINDIA', merch: 'Air India', ms: '1.3 ms' }
  ];
  let parseSampleIdx = 0;

  function updateParseScene(stepProgress) {
    const localCycle = (stepProgress * 1.95) % 1;
    const sampleWanted = Math.floor(stepProgress * 1.95) % PARSE_DATA.length;
    if (sampleWanted !== parseSampleIdx) {
      parseSampleIdx = sampleWanted;
      const d = PARSE_DATA[parseSampleIdx];
      const tAmt = document.getElementById('t-amt');
      const tRail = document.getElementById('t-rail');
      const tMerch = document.getElementById('t-merch');
      const mAmt = document.getElementById('m-amt');
      const mMerch = document.getElementById('m-merch');
      const mRail = document.getElementById('m-rail');
      const scanMs = document.getElementById('scan-ms');

      if (tAmt) tAmt.textContent = d.rawAmt;
      if (tRail) tRail.textContent = d.rail;
      if (tMerch) tMerch.textContent = d.rawMerch;
      if (mAmt) mAmt.textContent = d.amt;
      if (mMerch) mMerch.textContent = d.merch;
      if (mRail) mRail.textContent = d.rail;
      if (scanMs) scanMs.textContent = d.ms;
    }

    const beam = document.getElementById('vol-beam');
    const scanNorm = Math.min(1, localCycle / 0.58);
    const easedScan = scanNorm < 0.5
      ? 2 * scanNorm * scanNorm
      : 1 - Math.pow(-2 * scanNorm + 2, 2) / 2;

    if (beam) {
      beam.style.left = `${-18 + easedScan * 124}%`;
      beam.style.opacity = localCycle < 0.62 ? '1' : '0';
    }

    const tAmt = document.getElementById('t-amt');
    const tRail = document.getElementById('t-rail');
    const tMerch = document.getElementById('t-merch');
    if (tAmt) tAmt.classList.toggle('is-hit', localCycle > 0.14);
    if (tRail) tRail.classList.toggle('is-hit', localCycle > 0.28);
    if (tMerch) tMerch.classList.toggle('is-hit', localCycle > 0.42);

    const wire0 = document.getElementById('wire-0');
    const wire1 = document.getElementById('wire-1');
    const wire2 = document.getElementById('wire-2');
    if (wire0) wire0.classList.toggle('is-drawn', localCycle > 0.20);
    if (wire1) wire1.classList.toggle('is-drawn', localCycle > 0.34);
    if (wire2) wire2.classList.toggle('is-drawn', localCycle > 0.46);

    const mem0 = document.getElementById('mem-0');
    const mem1 = document.getElementById('mem-1');
    const mem2 = document.getElementById('mem-2');
    if (mem0) mem0.classList.toggle('is-ready', localCycle > 0.26);
    if (mem1) mem1.classList.toggle('is-ready', localCycle > 0.40);
    if (mem2) mem2.classList.toggle('is-ready', localCycle > 0.52);
  }

  // =========================================================================
  // SCENE 03 — FLOATING 1-TAP OVERLAY + LIVE LEDGER CONFIRMATION
  // =========================================================================
  function updateTapScene(stepProgress) {
    const overlay = document.getElementById('kanri-overlay');
    const p0 = document.getElementById('ov-p0');
    const ripple = document.getElementById('touch-ripple');
    const ledgerNew = document.getElementById('ledger-new');

    if (ripple) {
      ripple.style.left = '16.5%';
      ripple.style.top = '50%';
    }

    if (overlay) {
      overlay.classList.toggle('is-visible', stepProgress > 0.04 && stepProgress < 0.82);
      overlay.classList.toggle('is-dismissed', stepProgress >= 0.82);
    }

    if (ripple) {
      ripple.classList.toggle('is-press', stepProgress >= 0.34 && stepProgress < 0.46);
      ripple.classList.toggle('is-pop', stepProgress >= 0.46 && stepProgress < 0.66);
    }

    if (p0) {
      p0.classList.toggle('is-picked', stepProgress >= 0.44);
    }

    const logged = stepProgress >= 0.56;
    if (ledgerNew) {
      ledgerNew.classList.toggle('is-fresh', logged);
      ledgerNew.classList.toggle('is-hidden', !logged);
    }
  }

  // =========================================================================
  // MASTER STEP SWITCHING & UI UPDATES
  // =========================================================================
  let copyTimer = null;

  function setStepUI(idx) {
    const safeIdx = Math.max(0, Math.min(STEPS.length - 1, idx));
    if (safeIdx === activeStep) return;
    activeStep = safeIdx;
    const data = STEPS[safeIdx];

    if (stepNumEl) stepNumEl.textContent = data.num;
    if (footerStatus) footerStatus.textContent = data.footer;

    nodeCols.forEach((col, i) => {
      col.classList.toggle('is-active', i === safeIdx);
      col.classList.toggle('is-passed', i < safeIdx);
    });
    nodeBtns.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === safeIdx);
      btn.classList.toggle('is-passed', i < safeIdx);
      btn.setAttribute('aria-selected', String(i === safeIdx));
    });

    scenes.forEach((sc, i) => {
      if (sc) sc.classList.toggle('is-active', i === safeIdx);
    });

    clearTimeout(copyTimer);
    if (copyContent) copyContent.classList.add('is-fading');
    copyTimer = setTimeout(() => {
      if (watermark) watermark.textContent = data.num;
      if (copyEyebrow) copyEyebrow.textContent = data.eyebrow;
      if (copyTitle) copyTitle.textContent = data.title;
      if (copyDesc) copyDesc.textContent = data.desc;
      if (copyPills) {
        copyPills.innerHTML = data.pills.map(p => `<span class="spec-pill">${p}</span>`).join('');
      }
      if (copyContent) copyContent.classList.remove('is-fading');
    }, 180);
  }

  function jumpToStep(idx) {
    const safeIdx = ((idx % STEPS.length) + STEPS.length) % STEPS.length;
    cycleTime = safeIdx * STEP_DURATION + 0.01;
    setStepUI(safeIdx);
  }

  // Interactive controls
  if (playbackToggle) {
    playbackToggle.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playbackToggle.classList.toggle('is-paused', !isPlaying);
      playbackToggle.setAttribute('aria-pressed', String(!isPlaying));
      if (playbackLabel) {
        playbackLabel.textContent = isPlaying ? 'Auto' : 'Paused';
      }
    });
  }

  nodeBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => jumpToStep(idx));
  });

  // Guarded keyboard handler (only when not typing in form inputs/textareas)
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
      return;
    }

    // Only process if section is at least partially in viewport
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight') {
      jumpToStep((activeStep + 1) % STEPS.length);
    } else if (e.key === 'ArrowLeft') {
      jumpToStep((activeStep + STEPS.length - 1) % STEPS.length);
    } else if (e.key === ' ') {
      e.preventDefault();
      if (playbackToggle) playbackToggle.click();
    }
  });

  window.addEventListener('resize', resizePayCanvas);

  // IntersectionObserver to sleep when out of view (conserves CPU/battery)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          resizePayCanvas();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(section);
  }

  // =========================================================================
  // 60FPS MASTER TICKER LOOP
  // =========================================================================
  let lastNow = performance.now();
  let totalElapsed = 0;

  function loop(now) {
    requestAnimationFrame(loop);
    if (!isVisible) {
      lastNow = now;
      return;
    }

    try {
      const dt = Math.max(0, Math.min((now - lastNow) / 1000, 0.05));
      lastNow = now;
      totalElapsed += dt;

      if (isPlaying) {
        cycleTime = ((cycleTime + dt) % TOTAL_CYCLE + TOTAL_CYCLE) % TOTAL_CYCLE;
      }

      const stepIdx = Math.max(0, Math.min(STEPS.length - 1, Math.floor(cycleTime / STEP_DURATION)));
      const stepLocalP = Math.max(0, Math.min(1, (cycleTime - stepIdx * STEP_DURATION) / STEP_DURATION));

      // Continuous rail progress mapping across all steps
      const railProgress = Math.min(1, Math.max(0, (stepIdx + stepLocalP) / (STEPS.length - 1)));

      if (railFill) railFill.style.transform = `scaleX(${railProgress})`;
      if (railComet) railComet.style.left = `${railProgress * 100}%`;

      setStepUI(stepIdx);

      if (stepIdx === 0) {
        drawPayScene(dt, totalElapsed);
      } else if (stepIdx === 1) {
        updateFusionScene(stepLocalP);
      } else if (stepIdx === 2) {
        updateParseScene(stepLocalP);
      } else {
        updateTapScene(stepLocalP);
      }
    } catch (err) {
      console.error('How It Works animation ticker error:', err);
    }
  }

  function init() {
    resizePayCanvas();
    setStepUI(0);
    lastNow = performance.now();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', resizePayCanvas);
})();
