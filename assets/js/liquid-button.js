/**
 * Vanilla Liquid Ink Button Engine for Kanri
 * Fluid organic ink droplet expansion with SVG feTurbulence + feDisplacementMap filter,
 * inverted text clip-path layering, spring physics, and click ripple impulse.
 * Mirrors the LiquidButton React component for zero-dependency static production.
 */
(() => {
  'use strict';

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let buttonCounter = 0;

  function initLiquidButton(btn) {
    if (btn.hasAttribute('data-liquid-initialized')) return;
    btn.setAttribute('data-liquid-initialized', 'true');

    buttonCounter++;
    const instanceId = `liquid-ink-${buttonCounter}-${Date.now().toString(36)}`;
    const filterId = `${instanceId}-filter`;
    const clipPathId = `${instanceId}-clip`;

    // 1. Create SVG Filter & Shapes
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'liquid-btn-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const defs = document.createElementNS(svgNS, 'defs');

    // Filter
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('x', '-35%');
    filter.setAttribute('y', '-45%');
    filter.setAttribute('width', '170%');
    filter.setAttribute('height', '190%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const turbulence = document.createElementNS(svgNS, 'feTurbulence');
    turbulence.setAttribute('type', 'fractalNoise');
    turbulence.setAttribute('baseFrequency', '0.035 0.08');
    turbulence.setAttribute('numOctaves', '2');
    turbulence.setAttribute('seed', '8');
    turbulence.setAttribute('result', 'liquid-noise');
    filter.appendChild(turbulence);

    const displacement = document.createElementNS(svgNS, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'liquid-noise');
    displacement.setAttribute('scale', '5');
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');
    filter.appendChild(displacement);
    defs.appendChild(filter);

    // ClipPath
    const clipPath = document.createElementNS(svgNS, 'clipPath');
    clipPath.setAttribute('id', clipPathId);
    clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');

    const clipEllipse = document.createElementNS(svgNS, 'ellipse');
    clipEllipse.setAttribute('cx', '0');
    clipEllipse.setAttribute('cy', '0');
    clipEllipse.setAttribute('rx', '0');
    clipEllipse.setAttribute('ry', '0');
    clipPath.appendChild(clipEllipse);
    defs.appendChild(clipPath);

    svg.appendChild(defs);

    // Ink Blob
    const blob = document.createElementNS(svgNS, 'ellipse');
    blob.setAttribute('filter', `url(#${filterId})`);
    blob.setAttribute('cx', '0');
    blob.setAttribute('cy', '0');
    blob.setAttribute('rx', '0');
    blob.setAttribute('ry', '0');
    blob.style.fill = 'var(--liquid-fill, #111111)';
    svg.appendChild(blob);

    // Click Ripple
    const ripple = document.createElementNS(svgNS, 'circle');
    ripple.setAttribute('filter', `url(#${filterId})`);
    ripple.setAttribute('cx', '0');
    ripple.setAttribute('cy', '0');
    ripple.setAttribute('r', '0');
    ripple.style.fill = 'none';
    ripple.style.stroke = 'var(--liquid-active-text, #FAF9F5)';
    ripple.style.strokeWidth = '2.4px';
    ripple.style.display = 'none';
    svg.appendChild(ripple);

    btn.insertBefore(svg, btn.firstChild);

    // 2. Wrap and clone content for inverted clip layer
    let contentEl = btn.querySelector('.liquid-btn-content');
    if (!contentEl) {
      contentEl = document.createElement('span');
      contentEl.className = 'liquid-btn-content';
      while (btn.childNodes.length > 1) {
        contentEl.appendChild(btn.childNodes[1]);
      }
      btn.appendChild(contentEl);
    }

    const invertedEl = document.createElement('span');
    invertedEl.className = 'liquid-btn-inverted';
    invertedEl.setAttribute('aria-hidden', 'true');
    invertedEl.style.clipPath = `url(#${clipPathId})`;
    invertedEl.style.webkitClipPath = `url(#${clipPathId})`;
    invertedEl.innerHTML = contentEl.innerHTML;
    btn.appendChild(invertedEl);

    // 3. State & Physics Engine
    const state = {
      x: 0,
      y: 0,
      radius: 0,
      radiusVelocity: 0,
      pointerActive: false,
      focusActive: false,
      targetSpeed: 0,
      speed: 0,
      targetAngle: 0,
      angle: 0,
      stretch: 1,
      frame: 0,
      lastFrame: 0,
      lastPointerTime: 0,
      lastPointerX: 0,
      lastPointerY: 0,
      time: 0,
      unstableJitterX: 0,
      unstableJitterY: 0,
      randomSeed: 8,
      ringProgress: 0,
      ringPhase: 0,
      ringX: 0,
      ringY: 0,
      ringOriginX: 0,
      ringOriginY: 0,
      ringEscapeAngle: 0,
      ringPeakScale: 0.58,
      ringDipRatio: 0.86,
      ringSpeedMult: 1.0,
    };

    function getDimensions() {
      const rect = svg.getBoundingClientRect();
      return { width: btn.clientWidth, height: btn.clientHeight, rect };
    }

    function toLocalPoint(clientX, clientY) {
      const { rect, width, height } = getDimensions();
      if (!rect || width <= 0 || height <= 0 || rect.width <= 0 || rect.height <= 0) return null;
      return {
        x: clamp(((clientX - rect.left) * width) / rect.width, 0, width),
        y: clamp(((clientY - rect.top) * height) / rect.height, 0, height),
        width,
        height
      };
    }

    function setShapeAttributes(element, rx, ry, angle) {
      if (!element) return;
      const renderX = state.x + state.unstableJitterX;
      const renderY = state.y + state.unstableJitterY;
      element.setAttribute('cx', String(renderX));
      element.setAttribute('cy', String(renderY));
      element.setAttribute('rx', String(Math.max(0, rx)));
      element.setAttribute('ry', String(Math.max(0, ry)));
      element.setAttribute('transform', `rotate(${angle} ${renderX} ${renderY})`);
    }

    function renderShape() {
      const { width, height } = getDimensions();
      if (width <= 0 || height <= 0) return;

      const axisScale = Math.sqrt(state.stretch);
      const rx = state.radius * axisScale;
      const ry = state.radius / axisScale;

      setShapeAttributes(blob, rx, ry, state.angle);
      setShapeAttributes(clipEllipse, rx, ry, state.angle);

      if (turbulence && !prefersReduced) {
        const breathingFactor = 1 + Math.sin(state.time * 2.5) * 0.12;
        turbulence.setAttribute(
          'baseFrequency',
          `${(0.035 * breathingFactor).toFixed(4)} ${(0.08 * (2 - breathingFactor)).toFixed(4)}`
        );
      }

      const livingFluidShimmer = Math.sin(state.time * 4) * 1.5;
      const ringTurbulence = state.ringPhase > 0 ? (1 - state.ringProgress) * 18 : 0;
      const displacementScale = prefersReduced
        ? 0
        : 4.5 + state.speed * 18 + livingFluidShimmer + ringTurbulence;
      displacement.setAttribute('scale', displacementScale.toFixed(2));

      if (ripple) {
        if (state.ringPhase > 0) {
          const baseDimension = Math.min(width, height);
          const peakRadius = baseDimension * state.ringPeakScale;
          const recoilDipRadius = peakRadius * state.ringDipRatio;
          let currentRadius = 0;
          let currentOpacity = 0;
          let currentStroke = 2.4;

          if (state.ringPhase === 1) {
            const easeOut = 1 - Math.pow(1 - state.ringProgress, 3);
            currentRadius = easeOut * peakRadius;
            currentOpacity = 0.95 - state.ringProgress * 0.12;
            currentStroke = 2.6 - state.ringProgress * 0.3;
          } else if (state.ringPhase === 2) {
            const recoilFactor = Math.sin(state.ringProgress * Math.PI);
            currentRadius = peakRadius - recoilFactor * (peakRadius - recoilDipRadius);
            currentOpacity = 0.88;
            currentStroke = 2.3;
          } else if (state.ringPhase === 3) {
            const p = state.ringProgress;
            currentRadius = recoilDipRadius + p * Math.max(width, height) * 0.85;
            currentOpacity = Math.max(0, 0.88 * (1 - p));
            currentStroke = Math.max(1, 2.3 * (1 - p * 0.6));
          }

          ripple.setAttribute('cx', String(state.ringX + state.unstableJitterX * 0.5));
          ripple.setAttribute('cy', String(state.ringY + state.unstableJitterY * 0.5));
          ripple.setAttribute('r', String(Math.max(0, currentRadius)));
          ripple.setAttribute('opacity', String(Math.max(0, currentOpacity)));
          ripple.style.strokeWidth = `${currentStroke.toFixed(2)}px`;
          ripple.style.display = 'block';
        } else {
          ripple.style.display = 'none';
        }
      }
    }

    function maxCornerDistance(width, height, x, y) {
      return Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y)
      );
    }

    function scheduleFrame() {
      if (state.frame === 0) {
        state.frame = window.requestAnimationFrame(tick);
      }
    }

    function tick(now) {
      state.frame = 0;
      const dt = state.lastFrame === 0 ? 1 / 60 : clamp((now - state.lastFrame) / 1000, 1 / 240, 1 / 30);
      state.lastFrame = now;
      state.time += dt;

      const { width, height } = getDimensions();
      if (width <= 0 || height <= 0) return;

      if (prefersReduced) {
        state.unstableJitterX = 0;
        state.unstableJitterY = 0;
        state.ringPhase = 0;
        state.ringProgress = 0;
      } else {
        const t = state.time;
        state.unstableJitterX = Math.sin(t * 3.7) * 2.2 + Math.sin(t * 7.1 + 1.2) * 1.4 + Math.cos(t * 11.3) * 0.8;
        state.unstableJitterY = Math.cos(t * 3.1) * 1.8 + Math.sin(t * 6.3 + 2.4) * 1.2 + Math.sin(t * 13.1) * 0.6;
      }

      const speedLerp = 1 - Math.exp(-dt / 0.105);
      state.speed += (state.targetSpeed - state.speed) * speedLerp;
      state.targetSpeed = 0;

      const breathingStretch = prefersReduced ? 0 : Math.sin(state.time * 2.8) * 0.04;
      const desiredStretch = 1 + state.speed * 0.55 + (state.pointerActive ? breathingStretch : 0);
      state.stretch += (desiredStretch - state.stretch) * (1 - Math.exp(-dt / 0.08));

      const angleDelta = ((state.targetAngle - state.angle + 540) % 360) - 180;
      state.angle += angleDelta * (1 - Math.exp(-dt / 0.075));

      if (!prefersReduced) {
        if (state.ringPhase === 1) {
          state.ringProgress += dt * 3.8 * state.ringSpeedMult;
          if (state.ringProgress >= 1) { state.ringPhase = 2; state.ringProgress = 0; }
        } else if (state.ringPhase === 2) {
          state.ringProgress += dt * 7.8 * state.ringSpeedMult;
          if (state.ringProgress >= 1) { state.ringPhase = 3; state.ringProgress = 0; }
        } else if (state.ringPhase === 3) {
          state.ringProgress += dt * 3.5 * state.ringSpeedMult;
          const glideSpeed = Math.max(width, height) * 1.55 * dt * state.ringSpeedMult;
          state.ringX += Math.cos(state.ringEscapeAngle) * glideSpeed;
          state.ringY += Math.sin(state.ringEscapeAngle) * glideSpeed;
          if (state.ringProgress >= 1) { state.ringPhase = 0; state.ringProgress = 0; }
        }
      }

      const active = state.pointerActive || state.focusActive;
      const targetRadius = active ? maxCornerDistance(width, height, state.x, state.y) * Math.sqrt(state.stretch) * 1.14 : 0;

      if (prefersReduced) {
        state.radius = targetRadius;
        state.radiusVelocity = 0;
      } else {
        const spring = 150;
        const damping = 24;
        const acceleration = (targetRadius - state.radius) * spring - state.radiusVelocity * damping;
        state.radiusVelocity += acceleration * dt;
        state.radius += state.radiusVelocity * dt;
      }

      if (state.radius < 0) { state.radius = 0; state.radiusVelocity = 0; }

      renderShape();

      if (active || state.ringPhase > 0 || Math.abs(state.radius) > 0.1) {
        state.frame = window.requestAnimationFrame(tick);
      } else {
        state.lastFrame = 0;
        state.radius = 0;
        state.radiusVelocity = 0;
        state.stretch = 1;
        state.speed = 0;
        state.ringPhase = 0;
        renderShape();
      }
    }

    function setOrigin(clientX, clientY) {
      const pt = toLocalPoint(clientX, clientY);
      if (!pt) return;
      state.x = pt.x;
      state.y = pt.y;
      renderShape();
    }

    function triggerClickImpulse(clientX, clientY) {
      const pt = toLocalPoint(clientX, clientY);
      if (!pt) return;
      const { x: posX, y: posY, width, height } = pt;

      state.ringOriginX = posX;
      state.ringOriginY = posY;
      state.ringX = posX;
      state.ringY = posY;
      state.ringPhase = 1;
      state.ringProgress = 0;

      state.randomSeed = Math.floor(Math.random() * 9999) + 1;
      if (turbulence) turbulence.setAttribute('seed', String(state.randomSeed));

      state.ringPeakScale = 0.56 + Math.random() * 0.09;
      state.ringDipRatio = 0.82 + Math.random() * 0.08;
      state.ringSpeedMult = 0.92 + Math.random() * 0.22;

      const centerX = width / 2;
      const centerY = height / 2;
      const dx = posX - centerX;
      const dy = posY - centerY;
      const baseAngle = Math.hypot(dx, dy) > 2 ? Math.atan2(dy, dx) : -Math.PI / 2;
      state.ringEscapeAngle = baseAngle + (Math.random() - 0.5) * 0.85;
      state.radiusVelocity += 130 + Math.random() * 50;

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(10); } catch (e) {}
      }

      scheduleFrame();
    }

    function updatePointerVelocity(e) {
      const now = performance.now();
      if (state.lastPointerTime > 0) {
        const elapsed = Math.max(8, now - state.lastPointerTime);
        const dx = e.clientX - state.lastPointerX;
        const dy = e.clientY - state.lastPointerY;
        state.targetSpeed = clamp(Math.hypot(dx, dy) / elapsed / 1.65, 0, 1);
        if (Math.hypot(dx, dy) > 0.5) {
          state.targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        }
      }
      state.lastPointerTime = now;
      state.lastPointerX = e.clientX;
      state.lastPointerY = e.clientY;
    }

    // Event Listeners
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      state.pointerActive = true;
      setOrigin(e.clientX, e.clientY);
      updatePointerVelocity(e);
      scheduleFrame();
    });

    btn.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      setOrigin(e.clientX, e.clientY);
      updatePointerVelocity(e);
      scheduleFrame();
    });

    btn.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'touch') setOrigin(e.clientX, e.clientY);
      state.pointerActive = false;
      state.lastPointerTime = 0;
      scheduleFrame();
    });

    btn.addEventListener('pointerdown', (e) => {
      state.pointerActive = true;
      setOrigin(e.clientX, e.clientY);
      triggerClickImpulse(e.clientX, e.clientY);
    });

    btn.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') {
        state.pointerActive = false;
        scheduleFrame();
      }
    });

    btn.addEventListener('focus', () => {
      state.focusActive = true;
      const { width, height } = getDimensions();
      state.x = width / 2;
      state.y = height / 2;
      renderShape();
      scheduleFrame();
    });

    btn.addEventListener('blur', () => {
      state.focusActive = false;
      scheduleFrame();
    });

    // Initial size sync
    const { width, height } = getDimensions();
    state.x = width / 2;
    state.y = height / 2;
    renderShape();
  }

  // Auto-initialize all data-liquid-btn on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-liquid-btn]').forEach(initLiquidButton);
  });

  window.initLiquidButton = initLiquidButton;
})();
