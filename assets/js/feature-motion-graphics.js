/**
 * Kanri Website — Feature Motion Graphics Interactive Loops
 * Ultra-smooth 60fps canvas & DOM motion graphics with zero external dependencies.
 */
(function () {
  'use strict';

  // =========================================================================
  // 1. SPLIT BILL VIDEO MOTION GRAPHICS SIMULATION
  // =========================================================================
  function initSplitBillMotion() {
    const stage = document.getElementById('motion-split-bill');
    if (!stage) return;

    const fillBar = stage.querySelector('.split-progress-bar-fill');
    const progText = stage.querySelector('.split-progress-text');
    const cards = Array.from(stage.querySelectorAll('.split-friend-card'));
    const canvas = document.getElementById('split-bill-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let t = 0;
    const CYCLE = 8.0; // 8 second complete video loop

    function animate(now) {
      requestAnimationFrame(animate);
      const dt = 0.016;
      t = (t + dt) % CYCLE;

      // Stage states:
      // 0.0 - 1.5s: Initial Bill ₹1,950 created, 1/4 settled (You)
      // 1.5 - 3.5s: Priya pays via UPI deep link (2/4 settled)
      // 3.5 - 5.5s: Alex gets 1-tap WhatsApp reminder, pays (3/4 settled)
      // 5.5 - 7.5s: Rahul settles cash (4/4 settled)
      // 7.5 - 8.0s: Celebration & reset

      const settledCount = t < 1.8 ? 1 : t < 3.8 ? 2 : t < 5.8 ? 3 : 4;
      const pct = (settledCount / 4) * 100;

      if (fillBar) fillBar.style.width = `${pct}%`;
      if (progText) progText.textContent = `Settled: ₹${(settledCount * 487.5).toFixed(2)} / ₹1,950 (${pct}%)`;

      cards.forEach((card, idx) => {
        const isSettled = idx < settledCount;
        card.classList.toggle('is-settled', isSettled);
        const statusEl = card.querySelector('.split-friend-status');
        if (statusEl) {
          if (idx === 0) statusEl.textContent = 'PAID UPFRONT (YOU)';
          else if (idx === 1) statusEl.textContent = isSettled ? '✓ UPI (WHATSAPP REMINDED)' : 'PENDING REMINDER';
          else if (idx === 2) statusEl.textContent = isSettled ? '✓ UPI://PAY SETTLED' : 'AWAITING UPI';
          else if (idx === 3) statusEl.textContent = isSettled ? '✓ CASH SETTLED' : 'CASH PENDING';
        }
      });

      // Draw canvas split beams
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = 40;

      // Central Bill Node
      ctx.save();
      ctx.fillStyle = '#1A1A1A';
      ctx.strokeStyle = '#FAF9F5';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(250, 249, 245, 0.4)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(cx - 75, 10, 150, 42, 8);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '600 12px var(--font-sans, sans-serif)';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('Dinner at Social', cx, 26);
      ctx.font = '700 13px var(--font-mono, monospace)';
      ctx.fillStyle = '#FAF9F5';
      ctx.fillText('₹1,950.00', cx, 42);
      ctx.restore();

      // Radiate beams to 4 target positions below
      const targets = [
        { x: w * 0.15, y: h - 10 },
        { x: w * 0.38, y: h - 10 },
        { x: w * 0.62, y: h - 10 },
        { x: w * 0.85, y: h - 10 }
      ];

      targets.forEach((pt, i) => {
        const isSettled = i < settledCount;
        ctx.save();
        ctx.strokeStyle = isSettled ? 'rgba(250, 249, 245, 0.8)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = isSettled ? 1.5 : 1;
        ctx.setLineDash(isSettled ? [] : [4, 4]);

        ctx.beginPath();
        ctx.moveTo(cx, 52);
        ctx.bezierCurveTo(cx, 110, pt.x, 110, pt.x, pt.y);
        ctx.stroke();

        // Animated traveling light packet
        if (isSettled) {
          const packetT = ((t * 1.5 + i * 0.25) % 1);
          const px = (1 - packetT) * (1 - packetT) * cx + 2 * (1 - packetT) * packetT * cx + packetT * packetT * pt.x;
          const py = (1 - packetT) * (1 - packetT) * 52 + 2 * (1 - packetT) * packetT * 110 + packetT * packetT * pt.y;

          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FAF9F5';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    requestAnimationFrame(animate);
  }

  // =========================================================================
  // 2. DUAL WALLETS & SMART ATM MODE MOTION GRAPHICS
  // =========================================================================
  function initAtmWalletsMotion() {
    const stage = document.getElementById('motion-wallets-atm');
    if (!stage) return;

    const onlineAmt = stage.querySelector('#atm-online-val');
    const cashAmt = stage.querySelector('#atm-cash-val');
    const deltaOnline = stage.querySelector('#atm-online-delta');
    const deltaCash = stage.querySelector('#atm-cash-delta');
    const boxOnline = stage.querySelector('#atm-box-online');
    const boxCash = stage.querySelector('#atm-box-cash');
    const particleSvg = stage.querySelector('.atm-particle-channel');

    let t = 0;
    const CYCLE = 6.0;

    function animate() {
      requestAnimationFrame(animate);
      t = (t + 0.016) % CYCLE;

      // Phase 1 (0-1.5s): Rest balance (Online: 24,850, Cash: 3,400)
      // Phase 2 (1.5-3.5s): ATM withdrawal occurs (-₹2,000 moves Online -> Cash)
      // Phase 3 (3.5-5.5s): Transferred state (Online: 22,850, Cash: 5,400)
      // Phase 4 (5.5-6.0s): Reset transition

      let progress = 0;
      if (t >= 1.5 && t < 3.2) {
        progress = (t - 1.5) / 1.7;
      } else if (t >= 3.2 && t < 5.5) {
        progress = 1.0;
      } else if (t >= 5.5) {
        progress = 1.0 - (t - 5.5) / 0.5;
      }

      const currOnline = Math.round(24850 - 2000 * progress);
      const currCash = Math.round(3400 + 2000 * progress);

      if (onlineAmt) onlineAmt.textContent = `₹${currOnline.toLocaleString('en-IN')}`;
      if (cashAmt) cashAmt.textContent = `₹${currCash.toLocaleString('en-IN')}`;

      const isTransferring = progress > 0.05 && progress < 0.95;
      if (boxOnline) boxOnline.classList.toggle('is-active', isTransferring);
      if (boxCash) boxCash.classList.toggle('is-active', isTransferring);

      if (deltaOnline) deltaOnline.style.opacity = progress > 0.1 ? '1' : '0.2';
      if (deltaCash) deltaCash.style.opacity = progress > 0.1 ? '1' : '0.2';
    }

    requestAnimationFrame(animate);
  }

  // =========================================================================
  // 3. 18+ INSIGHTS VISUALIZATIONS MOTION GRAPHICS
  // =========================================================================
  function initInsightsMotion() {
    const stage = document.getElementById('motion-insights');
    if (!stage) return;

    // Generate Heatmap cells
    const grid = stage.querySelector('.heatmap-motion-grid');
    if (grid && grid.children.length === 0) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 7 * 24; i++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        fragment.appendChild(cell);
      }
      grid.appendChild(fragment);
    }

    const cells = Array.from(stage.querySelectorAll('.heatmap-cell'));
    const canvas = document.getElementById('burn-rate-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let t = 0;

    function animate() {
      requestAnimationFrame(animate);
      t += 0.02;

      // Animate heatmap wave
      if (cells.length > 0) {
        cells.forEach((cell, idx) => {
          const col = Math.floor(idx / 7);
          const row = idx % 7;
          const val = Math.sin(col * 0.35 + row * 0.2 - t * 1.5) * Math.cos(col * 0.2 + t * 0.8);
          cell.className = 'heatmap-cell';
          if (val > 0.65) cell.classList.add('l4');
          else if (val > 0.3) cell.classList.add('l3');
          else if (val > 0.0) cell.classList.add('l2');
          else if (val > -0.3) cell.classList.add('l1');
        });
      }

      // Draw Burn-Rate Trajectory Canvas
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;

      ctx.clearRect(0, 0, w, h);

      const padX = 20;
      const padY = 20;
      const graphW = w - padX * 2;
      const graphH = h - padY * 2;

      // Grid guides
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 3; i++) {
        const y = padY + (graphH / 3) * i;
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(w - padX, y);
        ctx.stroke();
      }

      // Linear budget allowance baseline (dashed)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padX, padY + graphH);
      ctx.lineTo(w - padX, padY);
      ctx.stroke();
      ctx.restore();

      // Actual Spend Velocity Curve (Cream gradient)
      const scanX = padX + (graphW * ((Math.sin(t * 0.8) * 0.5 + 0.5)));

      ctx.save();
      const grad = ctx.createLinearGradient(0, padY, 0, padY + graphH);
      grad.addColorStop(0, 'rgba(250, 249, 245, 0.35)');
      grad.addColorStop(1, 'rgba(250, 249, 245, 0.0)');

      ctx.beginPath();
      ctx.moveTo(padX, padY + graphH);

      const points = 30;
      for (let i = 0; i <= points; i++) {
        const nx = i / points;
        const x = padX + nx * graphW;
        if (x > scanX) break;
        // Non-linear trajectory curve that stays safely under baseline
        const ny = Math.pow(nx, 1.2) * 0.82 + Math.sin(nx * 8 + t) * 0.03;
        const y = padY + graphH - ny * graphH;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(scanX, padY + graphH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Top line
      ctx.beginPath();
      ctx.moveTo(padX, padY + graphH);
      for (let i = 0; i <= points; i++) {
        const nx = i / points;
        const x = padX + nx * graphW;
        if (x > scanX) break;
        const ny = Math.pow(nx, 1.2) * 0.82 + Math.sin(nx * 8 + t) * 0.03;
        const y = padY + graphH - ny * graphH;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#FAF9F5';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Radar scan point at head
      const headNy = Math.pow((scanX - padX) / graphW, 1.2) * 0.82 + Math.sin(((scanX - padX) / graphW) * 8 + t) * 0.03;
      const headY = padY + graphH - headNy * graphH;

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FAF9F5';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(scanX, headY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  function init() {
    initSplitBillMotion();
    initAtmWalletsMotion();
    initInsightsMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
