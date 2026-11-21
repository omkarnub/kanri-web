/**
 * Kanri Phone Showcase & Interactive Transaction Detection Animation Engine
 * Handles 3D hardware tilt, incoming bank SMS simulation, and 1-tap categorization overlay animation.
 */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('phone-showcase');
    const phoneCard = document.getElementById('phone-3d-card');
    if (!section || !phoneCard) return;

    // Elements inside phone
    const smsToast = document.getElementById('incoming-sms-toast');
    const txCard = document.getElementById('tx-detected-card');
    const smsSender = document.getElementById('sms-toast-sender');
    const smsBody = document.getElementById('sms-toast-body');
    const popupAmount = document.getElementById('popup-tx-amount');
    const popupMerchant = document.getElementById('popup-tx-merchant');
    const popupIcon = document.getElementById('popup-tx-icon');
    const popupMeta = document.getElementById('popup-tx-meta');
    const loggedStatus = document.getElementById('tx-logged-status');
    const dialVal = document.getElementById('phone-dial-value');
    const dialProgress = document.getElementById('phone-dial-progress');
    const newTxItem = document.getElementById('newly-added-tx');
    const newTxIcon = document.getElementById('new-tx-icon');
    const newTxMerchant = document.getElementById('new-tx-merchant');
    const newTxSub = document.getElementById('new-tx-sub');
    const newTxAmount = document.getElementById('new-tx-amount');
    const triggerBtns = document.querySelectorAll('.phone-trigger-btn');

    // 1. Mouse 3D Perspective Tilt on Desktop
    let rafTilt = null;
    const onMouseMove = (e) => {
      if (window.innerWidth < 768) return;
      if (rafTilt) cancelAnimationFrame(rafTilt);

      rafTilt = requestAnimationFrame(() => {
        const rect = phoneCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
        const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

        // Constrained tilt: -8 to +8 degrees
        const rotY = Math.max(-8, Math.min(8, deltaX * 10));
        const rotX = Math.max(-8, Math.min(8, -deltaY * 10));

        phoneCard.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      });
    };

    const onMouseLeave = () => {
      if (rafTilt) cancelAnimationFrame(rafTilt);
      phoneCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    };

    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);

    // 2. Transaction Simulation Presets
    const presets = {
      Swiggy: {
        amount: '-₹420.00',
        cleanAmt: 420,
        merchant: 'Swiggy',
        icon: '🍔',
        category: 'Food & Dining',
        bank: 'VK-HDFCBK',
        sms: 'Sent Rs.420.00 from HDFC Bank A/c 4091 to SWIGGY via UPI. Avl Bal: Rs.24,850.',
        meta: 'HDFC Bank · UPI/432618920192'
      },
      'Starbucks Coffee': {
        amount: '-₹350.00',
        cleanAmt: 350,
        merchant: 'Starbucks Coffee',
        icon: '☕',
        category: 'Cafe & Drinks',
        bank: 'VM-ICICI',
        sms: 'Acct XX801 debited with INR 350.00 on 21-Nov at STARBUCKS. UPI Ref 432691823.',
        meta: 'ICICI Bank · UPI/432691823'
      },
      'Uber India': {
        amount: '-₹240.00',
        cleanAmt: 240,
        merchant: 'Uber India',
        icon: '🚕',
        category: 'Transport',
        bank: 'BZ-SBIINB',
        sms: 'Dear SBI User, your A/c 5192 debited by Rs.240.00 for UBER RIDE. Avl Bal: Rs.18,400.',
        meta: 'SBI Bank · UPI/491028472'
      },
      'ATM Cash Withdrawal': {
        amount: '-₹2,000.00',
        cleanAmt: 2000,
        merchant: 'ATM Cash Withdrawal',
        icon: '💵',
        category: 'Cash',
        bank: 'AX-AXISBK',
        sms: 'INR 2,000.00 withdrawn at AXIS ATM 1042. Balance in A/c XX3109 is INR 14,200.',
        meta: 'Axis Bank · ATM Cash'
      }
    };

    let currentPreset = presets['Swiggy'];
    let animTimer = null;
    let loopTimeout = null;
    let isPlaying = false;

    function runAnimationSequence(preset) {
      if (!preset) preset = currentPreset;
      currentPreset = preset;

      // Clear existing timers
      clearTimeout(animTimer);
      clearTimeout(loopTimeout);
      isPlaying = true;

      // Reset DOM state
      smsToast.classList.remove('visible');
      txCard.classList.remove('visible');
      loggedStatus.classList.remove('active');
      if (newTxItem) newTxItem.style.display = 'none';

      // Reset values
      if (dialVal) dialVal.textContent = '1,400';
      if (dialProgress) dialProgress.style.strokeDashoffset = '80'; // 1400 baseline

      // Step 1: Incoming SMS (at 400ms)
      animTimer = setTimeout(() => {
        if (smsSender) smsSender.textContent = preset.bank;
        if (smsBody) smsBody.textContent = preset.sms;
        smsToast.classList.add('visible');

        // Step 2: Instant Transaction Detected Overlay (at 1200ms)
        animTimer = setTimeout(() => {
          if (popupAmount) popupAmount.textContent = preset.amount;
          if (popupMerchant) popupMerchant.textContent = preset.merchant;
          if (popupIcon) popupIcon.textContent = preset.icon;
          if (popupMeta) popupMeta.textContent = preset.meta;

          // Update active chip text
          const activeChip = document.getElementById('chip-dining');
          if (activeChip) {
            activeChip.innerHTML = `<span class="chip-tick">✓</span> ${preset.category}`;
          }

          txCard.classList.add('visible');

          // Step 3: 1-Tap Category auto-selection & confirm pulse (at 2200ms)
          animTimer = setTimeout(() => {
            loggedStatus.classList.add('active');

            // Step 4: Ledger balance drops & transaction logged (at 2800ms)
            animTimer = setTimeout(() => {
              const remaining = Math.max(0, 1400 - preset.cleanAmt);
              if (dialVal) {
                // Number tick down
                animateNumber(dialVal, 1400, remaining, 600);
              }
              if (dialProgress) {
                const newOffset = 80 + (preset.cleanAmt / 1400) * 160;
                dialProgress.style.strokeDashoffset = String(newOffset);
              }

              // Show in recent transactions list
              if (newTxItem) {
                if (newTxIcon) newTxIcon.textContent = preset.icon;
                if (newTxMerchant) newTxMerchant.textContent = preset.merchant;
                if (newTxSub) newTxSub.textContent = `Auto-captured · ${preset.category}`;
                if (newTxAmount) newTxAmount.textContent = preset.amount;
                newTxItem.style.display = 'flex';
                newTxItem.classList.add('slide-in');
              }

              // Step 5: Dismiss popup smoothly and schedule loop
              animTimer = setTimeout(() => {
                smsToast.classList.remove('visible');
                txCard.classList.remove('visible');

                // Loop after 5 seconds if still in view
                loopTimeout = setTimeout(() => {
                  if (inView) {
                    runAnimationSequence(currentPreset);
                  }
                }, 5000);
              }, 2200);

            }, 600);
          }, 1000);
        }, 800);
      }, 400);
    }

    // Number ticker helper
    function animateNumber(el, start, end, duration) {
      const startTime = performance.now();
      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.round(start + (end - start) * ease);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      requestAnimationFrame(update);
    }

    // Manual Simulation Trigger Buttons
    triggerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        triggerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const merchant = btn.getAttribute('data-tx-merchant');
        if (presets[merchant]) {
          runAnimationSequence(presets[merchant]);
        }
      });
    });

    // Auto-Trigger when scrolling into view
    let inView = false;
    let hasPlayedOnce = false;
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        if (!hasPlayedOnce) {
          hasPlayedOnce = true;
          runAnimationSequence(currentPreset);
        } else if (!isPlaying) {
          runAnimationSequence(currentPreset);
        }
      } else {
        clearTimeout(animTimer);
        clearTimeout(loopTimeout);
        isPlaying = false;
      }
    }, { threshold: 0.25 });

    observer.observe(section);
  });
})();
