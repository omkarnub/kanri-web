/**
 * Shan Shui Living Background for Kanri
 * Authentic procedural Japanese/Chinese ink wash (sumi-e) living canvas.
 * Integrated with Kanri's light/dark/amoled themes and smooth Parallax.
 */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const cvs = { 
    paper: $('paper'), 
    wet: $('wet'), 
    mist: $('mist'), 
    dyn: $('dyn'), 
    landBase: $('landBase'), 
    landFx: $('landFx'), 
    grain: $('grain') 
  };
  const landEl = $('land');
  const bgContainer = $('bg');

  if (!cvs.paper || !bgContainer) return;

  const ctx = {}; 
  for (const k in cvs) {
    if (cvs[k]) ctx[k] = cvs[k].getContext('2d');
  }
  const pc = ctx.paper, wc = ctx.wet, mc = ctx.mist, dc = ctx.dyn, gc = ctx.grain, lb = ctx.landBase, lf = ctx.landFx;

  // Living Shan Shui painting stays permanently in light mode (Xuan paper sumi-e)
  function getCurrentTheme() {
    return 'light';
  }

  let theme = 'light';
  let speed = 2.8; // Fast, lively painting speed
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- palettes
  const PAL = {
    light: {
      paperTop: '#F4EFE6', paperMid: '#ECE6DA', paperBot: '#E2DBD0', paperRgb: [236, 230, 218],
      mtPeakDark: [68, 84, 100], mtBodyMid: [108, 125, 140], mtBodyLight: [156, 170, 181], mtFarRight: [138, 153, 167],
      midHillWash: [144, 157, 168], midTreeDabs: [74, 89, 102],
      rockDark: [24, 29, 36], rockSlate: [72, 86, 100], rockUmber: [142, 115, 90], treeHalo: [160, 171, 180],
      treeDark: [26, 34, 42], treeMid: [62, 76, 89],
      boatHull: [33, 23, 18], boatMid: [70, 51, 40], canopyOchre: [158, 128, 96], canopyGlow: [222, 142, 68],
      reflection: [50, 44, 40], plumRed: [186, 56, 52], plumBlush: [212, 128, 122], sunAmber: [208, 112, 66],
      inkBlack: [20, 23, 27], sealRed: [20, 23, 27] // Monochrome sumi seal
    },
    dark: {
      paperTop: '#0B0E13', paperMid: '#10151C', paperBot: '#080B0F', paperRgb: [16, 21, 28],
      mtPeakDark: [186, 202, 218], mtBodyMid: [118, 138, 158], mtBodyLight: [64, 78, 94], mtFarRight: [92, 110, 128],
      midHillWash: [78, 94, 110], midTreeDabs: [165, 182, 198],
      rockDark: [224, 228, 234], rockSlate: [128, 146, 164], rockUmber: [178, 146, 114], treeHalo: [62, 76, 90],
      treeDark: [222, 228, 234], treeMid: [148, 164, 178],
      boatHull: [232, 224, 214], boatMid: [184, 168, 152], canopyOchre: [194, 158, 116], canopyGlow: [242, 178, 88],
      reflection: [168, 176, 186], plumRed: [224, 82, 78], plumBlush: [185, 110, 108], sunAmber: [232, 136, 82],
      inkBlack: [232, 235, 240], sealRed: [232, 235, 240] // Monochrome sumi seal
    }
  };

  // ---------------------------------------------------------------- utils
  class RNG {
    constructor(seed = 1) { this.s = (seed * 9301 + 49297) % 2147483647 || 1; }
    next() { this.s = (this.s * 16807) % 2147483647; return (this.s - 1) / 2147483646; }
    range(a, b) { return a + this.next() * (b - a); }
  }
  const h1 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const n1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return h1(i) * (1 - u) + h1(i + 1) * u; };
  const fbm1 = (x, seed) => {
    let v = 0, a = .5, fr = 1, m = 0;
    for (let i = 0; i < 4; i++) { v += n1(x * fr + seed * 13.37 + i * 7.1) * a; m += a; a *= .5; fr *= 2.03; }
    return v / m;
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // ---------------------------------------------------------------- state
  let W = 0, H = 0, LH = 0, S = 1, portrait = false, wy = 0;
  let landFrozen = false, frontPts = [], frontStep = 1, grass = [], flowers = [];
  let scrollTarget = 0, scrollCur = 0;
  const depth = { scene: .04, land: .16 };
  let tp = 0; // painting clock
  let T = 0;  // ambient clock
  let t0 = null, last = null, rafId = 0;
  let wetFrozen = false;

  const mk = () => { const c = document.createElement('canvas'); return { c, x: c.getContext('2d') }; };
  const farC = mk(), midC = mk(), nearC = mk(), landC = mk(), scratch = mk();

  let midDabs = [], trees = [], foliage = [], reeds = [], wisps = [], streaks = [], petals = [], birds = [];
  let ripples = [], lastRipple = 0;

  const ph = (a, b) => { const u = clamp((tp - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const P = arr => arr.map(([a, b]) => [a * W, b * H]);

  // ---------------------------------------------------------------- ridge + wash painting
  function ridge(pts, step, amp, seed) {
    pts = pts.slice().sort((p, q) => p[0] - q[0]);
    const out = [], x0 = pts[0][0], x1 = pts[pts.length - 1][0];
    for (let x = x0; x <= x1; x += step) {
      let i = 0; while (i < pts.length - 2 && x > pts[i + 1][0]) i++;
      const a = pts[i], b = pts[i + 1];
      const t = clamp((x - a[0]) / Math.max(1, b[0] - a[0]), 0, 1), s = (1 - Math.cos(t * Math.PI)) / 2;
      const y = a[1] + (b[1] - a[1]) * s + (fbm1(x * .0085 / S, seed) - .5) * 2 * amp * S;
      out.push({ x, y });
    }
    return out;
  }

  function wash(c, pts, botY, topRgb, midRgb, pap, maxA, seed) {
    const topY = Math.min(...pts.map(p => p.y));
    c.save();
    c.beginPath();
    pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
    c.lineTo(pts[pts.length - 1].x, botY); c.lineTo(pts[0].x, botY); c.closePath();
    const g = c.createLinearGradient(0, topY, 0, botY);
    g.addColorStop(0, rgba(topRgb, maxA));
    g.addColorStop(.35, rgba(midRgb, maxA * .8));
    g.addColorStop(.72, rgba(midRgb, maxA * .28));
    g.addColorStop(1, rgba(pap, 0));
    c.fillStyle = g; c.fill(); c.clip();
    const rng = new RNG(seed);
    for (let i = 0; i < pts.length; i += 1) {
      const p = pts[i], d = clamp((p.y - topY) / (botY - topY), 0, 1);
      const ea = (1 - d * .82) * maxA * .34; if (ea <= .01) continue;
      const r = rng.range(12, 38) * S;
      const g2 = c.createRadialGradient(p.x, p.y + r * .22, 1, p.x, p.y + r * .3, r);
      g2.addColorStop(0, rgba(topRgb, ea)); g2.addColorStop(.65, rgba(topRgb, ea * .45)); g2.addColorStop(1, rgba(topRgb, 0));
      c.fillStyle = g2; c.beginPath(); c.arc(p.x + rng.range(-5, 5) * S, p.y + r * .18, r, 0, TAU); c.fill();
    }
    for (let b = 0; b < 64; b++) {
      const rp = pts[Math.floor(rng.range(0, pts.length))];
      const bx = rp.x + rng.range(-45, 45) * S, by = rp.y + rng.range(18 * S, Math.max(30 * S, (botY - rp.y) * .72));
      const br = rng.range(30, 115) * S, dark = rng.next() > .4;
      const col = dark ? topRgb : pap, a = dark ? maxA * .11 : .17;
      const bg = c.createRadialGradient(bx, by, 4, bx, by, br);
      bg.addColorStop(0, rgba(col, a * .4)); bg.addColorStop(.75, rgba(col, a)); bg.addColorStop(1, rgba(col, 0));
      c.fillStyle = bg; c.beginPath(); c.arc(bx, by, br, 0, TAU); c.fill();
    }
    c.restore();
  }

  function rock(c, pal, outline, shoreY, left, seed) {
    const rng = new RNG(seed);
    const [rk, sl, um, pr] = [pal.rockDark, pal.rockSlate, pal.rockUmber, pal.paperRgb];
    const minX = outline[0].x, maxX = outline[outline.length - 1].x;
    c.save();
    c.beginPath(); c.moveTo(minX, shoreY); outline.forEach(p => c.lineTo(p.x, p.y)); c.lineTo(maxX, shoreY); c.closePath();
    const g = c.createLinearGradient(minX, shoreY - 180 * S, maxX, shoreY);
    g.addColorStop(0, rgba(sl, .8)); g.addColorStop(.45, rgba(um, .68)); g.addColorStop(.85, rgba(sl, .58)); g.addColorStop(1, rgba(um, .36));
    c.fillStyle = g; c.fill(); c.clip();
    for (let i = 0; i < 130; i++) {
      const u = left ? Math.pow(rng.next(), 1.35) : 1 - Math.pow(rng.next(), 1.35);
      const rx = minX + u * (maxX - minX);
      let topY = shoreY - 60 * S;
      for (let j = 0; j < outline.length - 1; j++) if (rx >= outline[j].x && rx <= outline[j + 1].x) {
        const t = (rx - outline[j].x) / Math.max(1, outline[j + 1].x - outline[j].x);
        topY = outline[j].y + t * (outline[j + 1].y - outline[j].y); break;
      }
      const ry = rng.range(topY - 4 * S, shoreY - 2 * S), ch = rng.next() > .36;
      const col = ch ? rk : (rng.next() > .5 ? sl : um), a = ch ? rng.range(.38, .9) : rng.range(.28, .58);
      c.fillStyle = rgba(col, a); c.beginPath();
      c.ellipse(rx, ry, rng.range(8, 28) * S, rng.range(3.5, 11) * S, rng.range(-.35, .45), 0, TAU); c.fill();
    }
    c.restore();
    c.save();
    for (let x = Math.max(0, minX); x < Math.min(W, maxX); x += 6 * S) {
      const u = left ? (x - minX) / (maxX - minX) : (maxX - x) / (maxX - minX);
      const d = ((1 - u * .72) * 102 + rng.range(-10, 10)) * S; if (d <= 4) continue;
      const rg = c.createLinearGradient(x, shoreY, x, shoreY + d);
      rg.addColorStop(0, rgba(sl, .36 * (1 - u * .4))); rg.addColorStop(.45, rgba(um, .22 * (1 - u * .5))); rg.addColorStop(1, rgba(pr, 0));
      c.fillStyle = rg; c.fillRect(x, shoreY, 7 * S, d);
    }
    c.strokeStyle = rgba(pr, .72);
    for (let ry = shoreY + 5 * S; ry < shoreY + 105 * S; ry += 7 * S) {
      c.lineWidth = rng.range(1.2, 2.5) * S; c.beginPath();
      c.moveTo(Math.max(0, minX), ry); c.lineTo(Math.min(W, maxX), ry + rng.range(-1.5, 1.5)); c.stroke();
    }
    c.restore();
  }

  function brush(c, x0, y0, cx, cy, x1, y1, w, rgb, alpha, prog, seed) {
    if (prog <= .005) return;
    const t = Math.min(1, prog);
    const qx0 = x0 + (cx - x0) * t, qy0 = y0 + (cy - y0) * t, qx1 = cx + (x1 - cx) * t, qy1 = cy + (y1 - cy) * t;
    const ex = qx0 + (qx1 - qx0) * t, ey = qy0 + (qy1 - qy0) * t;
    const rng = new RNG(seed), strands = Math.max(4, Math.floor(w * 1.4 / S));
    c.save(); c.lineCap = 'round';
    for (let s = 0; s < strands; s++) {
      const off = ((s / (strands - 1)) - .5) * w;
      c.strokeStyle = rgba(rgb, alpha * rng.range(.35, .95)); c.lineWidth = rng.range(.8, 2.2) * S;
      c.beginPath(); c.moveTo(x0 + off * .6, y0 + off * .3);
      c.quadraticCurveTo(qx0 + off * .85, qy0 + off * .45, ex + off * 1.05, ey + off * .4); c.stroke();
    }
    c.restore();
  }

  // ---------------------------------------------------------------- build
  function build() {
    const isWeakDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                         (navigator.connection && navigator.connection.saveData);
    const dpr = isWeakDevice ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const bgEl = document.getElementById('bg');
    const cw = bgEl ? (bgEl.clientWidth || innerWidth) : innerWidth;
    const ch = bgEl ? (bgEl.clientHeight || innerHeight) : innerHeight;
    const k = Math.min(1, 2200 / (Math.max(cw, ch) * dpr));
    W = Math.max(2, Math.round(cw * dpr * k)); 
    H = Math.max(2, Math.round(ch * dpr * k));
    portrait = H > W; S = portrait ? W / 1080 : H / 1080;
    wy = H * (portrait ? .715 : .70);

    LH = Math.round(H * 1.3);
    for (const key of ['paper', 'wet', 'dyn', 'grain']) { 
      if (cvs[key]) { cvs[key].width = W; cvs[key].height = H; }
    }
    if (cvs.landBase) { cvs.landBase.width = W; cvs.landBase.height = LH; }
    if (cvs.landFx) { cvs.landFx.width = W; cvs.landFx.height = LH; }
    if (cvs.mist) { cvs.mist.width = Math.round(W / 2); cvs.mist.height = Math.round(H / 2); }
    
    for (const o of [farC, midC, nearC]) { o.c.width = W; o.c.height = H; }
    for (const o of [landC, scratch]) { o.c.width = W; o.c.height = LH; }

    theme = getCurrentTheme();
    const pal = PAL[theme];
    bgContainer.classList.toggle('dark', theme === 'dark');
    bgContainer.style.background = pal.paperMid;

    paintPaper(pal);
    bakeScenery(pal);
    makeActors(pal);
    wetFrozen = false; landFrozen = false;
  }

  function paintPaper(pal) {
    if (!pc || !gc) return;
    const g = pc.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.paperTop); g.addColorStop(.55, pal.paperMid); g.addColorStop(1, pal.paperBot);
    pc.fillStyle = g; pc.fillRect(0, 0, W, H);
    const rng = new RNG(2026), light = theme === 'light';
    for (let i = 0; i < 55; i++) {
      const x = rng.range(0, W), y = rng.range(0, H), r = rng.range(150, 460) * S, warm = i % 2 === 0;
      const col = light ? (warm ? 'rgba(206,188,160,.055)' : 'rgba(255,253,247,.065)') : (warm ? 'rgba(42,54,68,.05)' : 'rgba(0,0,0,.08)');
      const gg = pc.createRadialGradient(x, y, 10, x, y, r);
      gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)');
      pc.fillStyle = gg; pc.beginPath(); pc.arc(x, y, r, 0, TAU); pc.fill();
    }
    gc.fillStyle = light ? '#faf7f0' : '#181e26'; gc.fillRect(0, 0, W, H);
    gc.strokeStyle = light ? 'rgba(148,132,110,.065)' : 'rgba(255,255,255,.025)'; gc.lineWidth = 1;
    for (let y = 0; y < H; y += 5) { gc.beginPath(); gc.moveTo(0, y); gc.lineTo(W, y); gc.stroke(); }
    gc.lineCap = 'round';
    const n = Math.round(1400 * (W * H) / (1080 * 1920));
    for (let i = 0; i < n; i++) {
      const x = rng.range(0, W), y = rng.range(0, H), len = rng.range(6, 34) * S, a = rng.range(0, TAU);
      gc.strokeStyle = light ? (i % 4 === 0 ? 'rgba(255,255,255,.45)' : 'rgba(122,106,84,.085)') : (i % 4 === 0 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.32)');
      gc.lineWidth = rng.range(.5, 1.4);
      gc.beginPath(); gc.moveTo(x, y);
      gc.quadraticCurveTo(x + Math.cos(a + .35) * len * .5, y + Math.sin(a + .35) * len * .5, x + Math.cos(a) * len, y + Math.sin(a) * len);
      gc.stroke();
    }
  }

  function bakeScenery(pal) {
    farC.x.clearRect(0, 0, W, H); midC.x.clearRect(0, 0, W, H); nearC.x.clearRect(0, 0, W, H);
    const pap = pal.paperRgb, mistBot = H * .745;

    // ---- far layer: pale sun, distant ranges, main twin-peak mountain
    {
      const c = farC.x, [a, b, d] = pal.sunAmber;
      const sx = W * (portrait ? .70 : .60), sy = H * .30, sr = 58 * S;
      const sg = c.createRadialGradient(sx, sy, sr * .3, sx, sy, sr * 4.2);
      sg.addColorStop(0, `rgba(${a},${b},${d},.38)`); sg.addColorStop(.4, `rgba(${a},${b},${d},.14)`); sg.addColorStop(1, `rgba(${a},${b},${d},0)`);
      c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, sr * 4.2, 0, TAU); c.fill();
      c.fillStyle = `rgba(${a},${b},${d},.42)`; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();

      wash(c, ridge(P([[.60,.60],[.70,.46],[.79,.36],[.86,.45],[.96,.60],[1.0,.64]]), 6 * S, 9, 101), mistBot, pal.mtFarRight, pal.mtBodyLight, pap, .54, 105);
      wash(c, ridge(P([[0,.56],[.07,.44],[.15,.50],[.24,.60],[.30,.64]]), 6 * S, 9, 111), mistBot, pal.mtFarRight, pal.mtBodyLight, pap, .48, 115);
      wash(c, ridge(P([[.04,.64],[.12,.52],[.22,.39],[.285,.27],[.335,.15],[.375,.125],[.415,.19],[.46,.34],[.50,.45],[.55,.47],[.60,.43],[.66,.51],[.74,.59],[.84,.66]]), 5 * S, 11, 202), mistBot, pal.mtPeakDark, pal.mtBodyMid, pap, .88, 208);
      wash(c, ridge(P([[.24,.55],[.30,.40],[.345,.26],[.37,.14]]), 6 * S, 8, 215), mistBot, pal.mtPeakDark, pal.mtBodyMid, pap, .32, 216);
    }

    // ---- mid layer: misty hills + far-bank
    {
      const c = midC.x, bot = H * .765;
      wash(c, ridge(P([[.12,.69],[.22,.635],[.31,.605],[.40,.575],[.47,.55],[.54,.585],[.62,.625],[.72,.665],[.84,.70]]), 5 * S, 9, 301), bot, pal.midTreeDabs, pal.midHillWash, pap, .58, 305);
      wash(c, ridge(P([[.86,.70],[.91,.63],[.96,.595],[1.0,.58]]), 5 * S, 7, 360), bot, pal.midTreeDabs, pal.midHillWash, pap, .5, 365);
      [.635, .67, .70, .725].forEach((fy, i) => {
        const y = H * fy, g = c.createLinearGradient(0, y - 26 * S, 0, y + 26 * S);
        g.addColorStop(0, rgba(pap, 0)); g.addColorStop(.5, rgba(pap, .55 + i * .1)); g.addColorStop(1, rgba(pap, 0));
        c.fillStyle = g; c.fillRect(W * .1, y - 26 * S, W * .8, 52 * S);
      });
    }

    // ---- near layer: water reflection, left rocky island, right bank
    {
      const c = nearC.x, rng = new RNG(77);
      const rg = c.createLinearGradient(0, wy, 0, wy + H * .2);
      rg.addColorStop(0, rgba(pal.mtBodyLight, .26)); rg.addColorStop(1, rgba(pap, 0));
      c.fillStyle = rg; c.fillRect(W * .18, wy, W * .66, H * .2);
      c.strokeStyle = rgba(pap, .62);
      for (let y = wy + 6 * S; y < wy + H * .17; y += 8 * S) {
        c.lineWidth = rng.range(1.4, 2.8) * S; c.beginPath(); c.moveTo(W * .15, y); c.lineTo(W * .88, y + rng.range(-1.5, 1.5)); c.stroke();
      }
      const [hl] = [pal.treeHalo];
      [[.09,.43,.07,.06,.42],[.07,.50,.08,.055,.38],[.13,.55,.075,.05,.35],[.17,.60,.06,.045,.30]].forEach(([fx, fy, rx, ry, a]) => {
        const x = fx * W, y = fy * H, r = Math.max(rx * W, ry * H);
        const g = c.createRadialGradient(x, y, 6, x, y, r);
        g.addColorStop(0, rgba(hl, a)); g.addColorStop(1, rgba(hl, 0));
        c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx * W, ry * H, 0, 0, TAU); c.fill();
      });
      const lo = P([[-.02,.78],[.035,.745],[.09,.725],[.15,.74],[.21,.765],[.28,.785],[.36,.80],[.43,.812]]).map(([x, y]) => ({ x, y }));
      rock(c, pal, lo, H * .83, true, 404);
      bakeLand(pal);
    }
  }

  // ---------------------------------------------------------------- foreground land
  const FRONT = [[-.02,.99],[.16,.978],[.36,.992],[.56,.986],[.72,.968],[.86,.95],[1.02,.934]];
  const frontY = x => frontPts[clamp(Math.round((x - frontPts[0].x) / frontStep), 0, frontPts.length - 1)].y;

  function bakeLand(pal) {
    const c = landC.x; c.clearRect(0, 0, W, LH);
    const pap = pal.paperRgb, rng = new RNG(808);
    frontStep = 5 * S;
    const backPts = ridge(P([[-.02,.95],[.14,.935],[.3,.946],[.48,.938],[.66,.952],[.82,.94],[1.02,.944]]), frontStep, 6, 801);
    wash(c, backPts, H * 1.1, pal.midHillWash, pal.rockUmber, pap, .38, 805);

    // far bank: small dry-brush trees
    [.12,.34,.58,.8].forEach((fx, i) => {
      const x = fx * W, y = backPts[clamp(Math.round((x - backPts[0].x) / frontStep), 0, backPts.length - 1)].y + 3 * S;
      const h = rng.range(38, 82) * S, lean = rng.range(-6, 6) * S;
      c.strokeStyle = rgba(pal.treeMid, .6); c.lineWidth = rng.range(1.2, 2) * S; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + lean * .3, y - h * .5, x + lean, y - h); c.stroke();
      for (let k = 0; k < 9; k++) {
        c.fillStyle = rgba(pal.treeMid, rng.range(.3, .6));
        c.beginPath(); c.ellipse(x + lean + rng.range(-16, 16) * S, y - h + rng.range(-8, 12) * S, rng.range(5, 12) * S, rng.range(2.5, 5) * S, rng.range(-.3, .3), 0, TAU); c.fill();
      }
    });

    // mist strip between the two banks
    const ms = c.createLinearGradient(0, H * .94, 0, H * .985);
    ms.addColorStop(0, rgba(pap, 0)); ms.addColorStop(.5, rgba(pap, .7)); ms.addColorStop(1, rgba(pap, 0));
    c.fillStyle = ms; c.fillRect(0, H * .94, W, H * .045);

    frontPts = ridge(P(FRONT), frontStep, 6, 811);
    // Deep pitch-black sumi ink wash for front land ridge extending to solid black base
    wash(c, frontPts, H * 1.15, [14, 16, 20], [8, 10, 12], pap, .88, 815);
    const rightPts = frontPts.filter(p => p.x >= W * .66);
    wash(c, rightPts, H * 1.1, [8, 10, 12], [4, 6, 8], pap, .95, 818);
    const fm = c.createLinearGradient(0, H * .955, 0, H * 1.0);
    fm.addColorStop(0, rgba(pap, 0)); fm.addColorStop(.35, rgba(pap, .32)); fm.addColorStop(1, rgba(pap, 0));
    c.fillStyle = fm; c.fillRect(0, H * .955, W * .7, H * .045);

    // Deep rich black ground gradient filling the bottom land completely into solid black dark mode base
    c.save();
    const bgGrad = c.createLinearGradient(0, H * 0.96, 0, LH);
    bgGrad.addColorStop(0, 'rgba(18, 18, 18, 0)');
    bgGrad.addColorStop(0.25, 'rgba(18, 18, 18, 0.75)');
    bgGrad.addColorStop(0.55, 'rgba(18, 18, 18, 0.96)');
    bgGrad.addColorStop(1, 'rgba(18, 18, 18, 1)');
    c.fillStyle = bgGrad;
    c.fillRect(0, H * 0.96, W, LH - H * 0.96);
    c.restore();

    // earth strata: dry-brush streaks only where land exists
    c.save(); c.globalCompositeOperation = 'source-atop'; c.lineCap = 'round';
    for (let i = 0; i < 40; i++) {
      const x = rng.range(-.05, 1.05) * W, y = H * rng.range(.972, 1.18), len = rng.range(80, 380) * S;
      c.strokeStyle = 'rgba(28, 32, 38, 0.4)'; c.lineWidth = rng.range(1, 3.4) * S;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + len * .5, y + rng.range(-5, 5) * S, x + len, y + rng.range(-3, 3) * S); c.stroke();
    }
    c.restore();

    // boulders along the front edge: jet obsidian black
    for (let i = 0; i < 7; i++) {
      const x = (i < 4 ? rng.range(.7, .98) : rng.range(.05, .6)) * W, y = frontY(x) + rng.range(2, 10) * S, rw = rng.range(10, 30) * S, rh = rw * rng.range(.35, .55);
      c.fillStyle = 'rgba(8, 10, 12, 0.96)'; c.beginPath(); c.ellipse(x, y, rw, rh, rng.range(-.15, .15), 0, TAU); c.fill();
      c.fillStyle = 'rgba(28, 32, 38, 0.5)'; c.beginPath(); c.ellipse(x - rw * .2, y - rh * .35, rw * .55, rh * .4, -.1, 0, TAU); c.fill();
    }
  }

  function makeActors(pal) {
    midDabs = [];
    const rng = new RNG(333);
    [[.28,.62,9],[.36,.60,12],[.44,.585,14],[.52,.605,12],[.61,.64,15],[.70,.67,10],[.33,.635,8]].forEach(([fx, fy, n], ci) => {
      for (let i = 0; i < n; i++) midDabs.push({
        x: fx * W + rng.range(-38, 38) * S, y: fy * H + rng.range(-14, 14) * S,
        rw: rng.range(3, 7.5) * S, rh: rng.range(4, 12) * S, a: rng.range(.18, .44), ci, k: i / n
      });
    });

    const roots = [[.085,.738,330,-8,5.2],[.118,.748,285,10,4.4],[.172,.762,200,26,3.8]];
    trees = roots.map(([fx, fy, h, lean, w], i) => ({ rx: fx * W, ry: fy * H, h: h * S, lean: lean * S, w: w * S, i, blossom: i === 2 }));
    foliage = [];
    const fr = new RNG(410);
    trees.forEach(tr => {
      [[1.0,0,22],[.86,-1,18],[.72,1,16],[.58,-1,14]].forEach(([f, side, n]) => {
        const cx = tr.rx + tr.lean * f + side * 30 * S, cy = tr.ry - tr.h * f;
        for (let i = 0; i < n; i++) {
          const y = cy + fr.range(-18, 18) * S;
          foliage.push({
            t: tr.i, x: cx + fr.range(-38, 38) * S, y,
            rw: fr.range(5, 13) * S, rh: fr.range(2.5, 6) * S, rot: fr.range(-.35, .35),
            a: fr.range(.58, .92), mid: i % 3 === 0, ph: fr.range(0, TAU), k: fr.next(),
            hf: clamp((tr.ry - y) / tr.h, .05, 1.1), blossom: tr.blossom && fr.next() > .35,
            deep: fr.next() > .42, pa: fr.range(0, TAU)
          });
        }
      });
    });

    reeds = [];
    const rr = new RNG(606);
    for (let i = 0; i < 26; i++) {
      const left = rr.next() < .2;
      const fx = left ? rr.range(.03, .12) : rr.range(.84, 1.0);
      const x0 = fx * W, by = frontY(x0) + 5 * S;
      const len = rr.range(left ? 70 : 100, left ? 150 : 230) * S, lean = rr.range(-70, 55) * S;
      reeds.push({ x0, y0: by, cx: x0 + lean * .25, cy: by - len * .62, x1: x0 + lean, y1: by - len,
        w: rr.range(5, 10) * S, delay: rr.range(0, .5), ph: rr.range(0, TAU), len, dark: rr.next() > .25 });
    }
    grass = [];
    const gr = new RNG(707);
    for (let i = 0; i < 34; i++) {
      const x = (gr.next() < .6 ? gr.range(.68, 1) : gr.range(0, .68)) * W, n = 2 + Math.floor(gr.range(0, 3)), blades = [];
      for (let k = 0; k < n; k++) blades.push({ ox: (k - n / 2) * 4 * S, len: gr.range(18, 56) * S, lean: gr.range(-18, 18) * S, w: gr.range(1.6, 3.2) * S, ph: gr.range(0, TAU) });
      grass.push({ x, y: frontY(x) + 3 * S, d: gr.range(0, .4), dark: gr.next() > .6, blades });
    }
    flowers = [];
    for (let i = 0; i < 7; i++) { const x = gr.range(.72, .97) * W; flowers.push({ x, y: frontY(x) + 4 * S, len: gr.range(40, 90) * S, ph: gr.range(0, TAU), deep: gr.next() > .4, d: gr.range(0, .5) }); }

    wisps = [];
    const wr = new RNG(55);
    [[.30,.62],[.42,.50],[.52,.40],[.60,.70],[.68,.34],[.74,.58],[.82,.46]].forEach(([fy, a], i) => wisps.push({
      y: fy, x0: wr.range(0, 1.6), sp: (4 + i * 2.6) * S * (i % 2 ? -1 : 1), w: wr.range(.35, .6), a: a * .6, sq: wr.range(.12, .2)
    }));
    streaks = [];
    for (let i = 0; i < 26; i++) streaks.push({ y: wy + (.04 + wr.range(0, .22)) * H, x: wr.range(0, W), len: wr.range(60, 220) * S,
      sp: wr.range(4, 14) * S, a: wr.range(.05, .14), lw: wr.range(1, 2.2) * S, ph: wr.range(0, TAU) });
    const bx = portrait ? [[.70,.34],[.80,.25],[.60,.22],[.86,.40]] : [[.72,.34],[.82,.22],[.66,.20],[.88,.40]];
    const types = ['glider', 'banker', 'high', 'glider'], scs = [1, .68, .52, .76].map(v => v * 1.1 * S);
    birds = bx.map(([fx, fy], i) => ({ bx: fx * W, by: fy * H, sc: scs[i], type: types[i], ph: wr.range(0, 6), wph: wr.range(0, 6), alpha: 0, bank: 0, x: fx * W, y: fy * H }));
    petals = [];
    for (let i = 0; i < 16; i++) petals.push(newPetal(true));
    ripples = [];
  }

  function newPetal(initial) {
    const tr = trees[2] || { rx: W * .17, ry: H * .76, h: 200 * S };
    const r = Math.random();
    return { 
      x: tr.rx + (Math.random() - .5) * 120 * S, 
      y: tr.ry - tr.h * (.5 + Math.random() * .5) + (initial ? Math.random() * 300 * S : 0),
      vx: (10 + Math.random() * 22) * S, 
      vy: (8 + Math.random() * 14) * S, 
      r: (2.6 + Math.random() * 3) * S,
      ang: Math.random() * TAU, 
      spin: (Math.random() - .5) * 1.2, 
      ph: Math.random() * TAU, 
      life: initial ? Math.random() : 0, 
      col: r > .4 ? 0 : 1 
    };
  }

  // ---------------------------------------------------------------- wet canvas
  function reveal(src, t, ox, oy, R, tgt = wc) {
    if (t < .002) return;
    if (t >= .995) { tgt.drawImage(src, 0, 0); return; }
    const hh = src.height;
    const s = scratch.x; s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over';
    s.clearRect(0, 0, W, LH); s.drawImage(src, 0, (1 - t) * 14 * S);
    s.globalCompositeOperation = 'destination-in';
    const r = Math.max(40 * S, t * R), g = s.createRadialGradient(ox, oy, r * .15, ox, oy, r);
    g.addColorStop(0, `rgba(0,0,0,${Math.min(1, t * 1.35)})`); g.addColorStop(.68, `rgba(0,0,0,${t * .85})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    s.fillStyle = g; s.fillRect(0, 0, W, hh); s.globalCompositeOperation = 'source-over';
    tgt.drawImage(scratch.c, 0, 0, W, hh, 0, 0, W, hh);
  }

  function drawWet() {
    if (!wc) return;
    wc.clearRect(0, 0, W, H);
    const R = Math.hypot(W, H);
    reveal(farC.c, ph(.8, 5.6), W * .35, H * .30, R * .85);
    reveal(midC.c, ph(3.4, 8.0), W * .45, H * .62, R * .7);
    reveal(nearC.c, ph(5.0, 9.2), W * .12, H * .78, R * .75);
  }

  // ---------------------------------------------------------------- mist canvas
  function drawMist(pal) {
    if (!mc || !cvs.mist) return;
    const a = ph(2.5, 8);
    mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, cvs.mist.width, cvs.mist.height);
    mc.setTransform(.5, 0, 0, .5, 0, 0);
    if (a <= .01) return;
    const pr = pal.paperRgb;
    [[.62, .38], [.70, .44], [.73, .32]].forEach(([fy, al], i) => {
      const y = H * fy, xs = Math.sin(T * .18 + i * 2.1) * 42 * S;
      const g = mc.createRadialGradient(W * .5 + xs, y, 20 * S, W * .5 + xs, y, W * .65);
      g.addColorStop(0, rgba(pr, al * a)); g.addColorStop(1, rgba(pr, 0));
      mc.fillStyle = g; mc.fillRect(0, y - 90 * S, W, 180 * S);
    });
    wisps.forEach(w => {
      const span = W * 1.6, x = (((w.x0 * W + T * w.sp) % span) + span) % span - W * .3, y = H * w.y, r = w.w * W;
      mc.save(); mc.translate(x, y); mc.scale(1, w.sq);
      const g = mc.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, rgba(pr, w.a * a)); g.addColorStop(.6, rgba(pr, w.a * a * .45)); g.addColorStop(1, rgba(pr, 0));
      mc.fillStyle = g; mc.beginPath(); mc.arc(0, 0, r, 0, TAU); mc.fill(); mc.restore();
    });
  }

  // ---------------------------------------------------------------- dynamic canvas pieces
  function drawMidDabs(pal) {
    if (!dc) return;
    const p0 = ph(5.8, 9.6); if (p0 <= .01) return;
    midDabs.forEach(d => {
      const p = clamp((p0 - d.ci * .08) / .55, 0, 1); if (d.k > p) return;
      dc.fillStyle = rgba(pal.midTreeDabs, d.a * p);
      dc.beginPath(); dc.ellipse(d.x, d.y, d.rw, d.rh, 0, 0, TAU); dc.fill();
    });
  }

  function drawWaterfall(pal) {
    if (!dc) return;
    const g = ph(7, 10.5); if (g <= .01) return;
    const x = W * .305, y0 = H * .36, y1 = H * (.36 + .22 * g), pr = pal.paperRgb;
    const grad = dc.createLinearGradient(0, y0, 0, y1);
    grad.addColorStop(0, rgba(pr, .0)); grad.addColorStop(.2, rgba(pr, .5)); grad.addColorStop(1, rgba(pr, 0));
    dc.fillStyle = grad;
    dc.beginPath(); dc.moveTo(x - 5 * S, y0); dc.quadraticCurveTo(x - 9 * S, (y0 + y1) / 2, x - 13 * S, y1);
    dc.lineTo(x + 13 * S, y1); dc.quadraticCurveTo(x + 9 * S, (y0 + y1) / 2, x + 5 * S, y0); dc.closePath(); dc.fill();
    dc.save(); dc.lineCap = 'round'; dc.strokeStyle = rgba(pr, .7 * g); dc.lineWidth = 2 * S;
    for (let i = 0; i < 10; i++) {
      const xx = x - 9 * S + i * 2 * S, len = (24 + (i % 3) * 14) * S, span = (y1 - y0);
      const ys = y0 + ((T * 70 * S + i * 41 * S) % Math.max(10, span));
      if (ys + len > y1) continue;
      dc.beginPath(); dc.moveTo(xx, ys); dc.lineTo(xx - 1.5 * S, ys + len); dc.stroke();
    }
    dc.restore();
  }

  function drawTrees(pal) {
    if (!dc) return;
    const gust = Math.sin(T * .31) * .6 + .4;
    trees.forEach((tr, i) => {
      const g = ph(6.8 + i * .55, 10.2 + i * .55);
      const sway = Math.sin(T * .55 + i * 1.7) * 3.2 * S * gust * (g > .98 ? 1 : g);
      brush(dc, tr.rx, tr.ry, tr.rx + tr.lean * .2 + sway * .3, tr.ry - tr.h * .5, tr.rx + tr.lean + sway, tr.ry - tr.h, tr.w, pal.treeDark, .92, g, 100 + i);
    });
    const fg = ph(9, 12.8); if (fg <= .01) return;
    foliage.forEach(d => {
      const p = clamp(fg * 1.45 - d.k * .45, 0, 1); if (p <= .01) return;
      const tr = trees[d.t];
      const sw = (Math.sin(T * .7 + d.ph) * 2.2 + Math.sin(T * .55 + d.t * 1.7) * 3.2) * S * d.hf * (.6 + gust * .5);
      const x = d.x + sw, y = d.y + Math.sin(T * .9 + d.ph) * .8 * S * d.hf;
      if (d.blossom) {
        const col = d.deep ? pal.plumRed : pal.plumBlush, a = (d.deep ? .85 : .65) * p;
        dc.fillStyle = rgba(col, a);
        for (let k = 0; k < 4; k++) { 
          const an = k / 4 * TAU + d.pa; 
          dc.beginPath(); dc.arc(x + Math.cos(an) * 4.6 * S * p, y + Math.sin(an) * 4.6 * S * p, 3.6 * S * p, 0, TAU); dc.fill(); 
        }
        if (d.deep) { 
          dc.fillStyle = rgba(pal.treeDark, .85 * p); 
          dc.beginPath(); dc.arc(x, y, 1.6 * S * p, 0, TAU); dc.fill(); 
        }
      } else {
        dc.fillStyle = rgba(d.mid ? pal.treeMid : pal.treeDark, d.a * p);
        dc.beginPath(); dc.ellipse(x, y, d.rw * (.5 + .5 * p), d.rh * (.5 + .5 * p), d.rot + Math.sin(T * .7 + d.ph) * .05, 0, TAU); dc.fill();
      }
    });
  }

  function drawReeds(pal) {
    if (!lf) return;
    const g0 = ph(11.5, 15.2); if (g0 <= .01) return;
    reeds.forEach(r => {
      const g = clamp((g0 - r.delay * .6) / .6, 0, 1); if (g <= .01) return;
      const sw = Math.sin(T * .9 + r.ph) * 7 * S * (r.len / (200 * S)) * (.5 + .5 * Math.sin(T * .3));
      const x1 = r.x0 + (r.x1 - r.x0) * g + sw * g, y1 = r.y0 + (r.y1 - r.y0) * g;
      const cx = r.x0 + (r.cx - r.x0) * g + sw * .4 * g, cy = r.y0 + (r.cy - r.y0) * g;
      lf.fillStyle = 'rgba(8, 10, 12, 0.96)'; // Rich pitch-black sumi reeds
      lf.beginPath(); lf.moveTo(r.x0 - r.w / 2, r.y0 + 3 * S);
      lf.quadraticCurveTo(cx - r.w * .3, cy, x1, y1);
      lf.quadraticCurveTo(cx + r.w * .3, cy, r.x0 + r.w / 2, r.y0 + 3 * S); lf.closePath(); lf.fill();
    });
  }

  function drawGrass(pal) {
    if (!lf) return;
    const g = ph(11.8, 15.8);
    if (g > .01) grass.forEach(t => {
      const p = clamp((g - t.d) / .55, 0, 1); if (p <= .01) return;
      lf.fillStyle = 'rgba(10, 12, 14, 0.96)'; // Rich pitch-black sumi grass blades
      t.blades.forEach(b => {
        const sw = Math.sin(T * .9 + b.ph + t.x * .01) * 5 * S * (b.len / (60 * S)) * (.5 + .5 * Math.sin(T * .3));
        const x0 = t.x + b.ox, x1 = x0 + (b.lean + sw) * p, y1 = t.y - b.len * p, cx = x0 + (b.lean * .3 + sw * .35) * p, cy = t.y - b.len * .6 * p;
        lf.beginPath(); lf.moveTo(x0 - b.w / 2, t.y + 2 * S); lf.quadraticCurveTo(cx - b.w * .3, cy, x1, y1);
        lf.quadraticCurveTo(cx + b.w * .3, cy, x0 + b.w / 2, t.y + 2 * S); lf.closePath(); lf.fill();
      });
    });
    const fp = ph(13.2, 16.8); if (fp <= .01) return;
    flowers.forEach(f => {
      const p = clamp((fp - f.d) / .5, 0, 1); if (p <= .01) return;
      const sw = Math.sin(T * .8 + f.ph) * 5 * S, tx = f.x + sw * p, ty = f.y - f.len * p;
      lf.strokeStyle = rgba(pal.treeDark, .8); lf.lineWidth = 1.6 * S; lf.lineCap = 'round';
      lf.beginPath(); lf.moveTo(f.x, f.y); lf.quadraticCurveTo(f.x + sw * .3 * p, f.y - f.len * .6 * p, tx, ty); lf.stroke();
      lf.fillStyle = rgba(f.deep ? pal.plumRed : pal.plumBlush, .88 * p);
      for (let k = 0; k < 5; k++) { 
        const a = k / 5 * TAU + f.ph; 
        lf.beginPath(); lf.arc(tx + Math.cos(a) * 3.6 * S * p, ty + Math.sin(a) * 3.6 * S * p, 2.8 * S * p, 0, TAU); lf.fill(); 
      }
      lf.fillStyle = rgba(pal.treeDark, .85 * p); lf.beginPath(); lf.arc(tx, ty, 1.5 * S * p, 0, TAU); lf.fill();
    });
  }

  function drawLand(pal) {
    if (!landFrozen && lb) {
      lb.clearRect(0, 0, W, LH);
      reveal(landC.c, ph(8.8, 12.8), W * .5, H * 1.0, W * 1.1, lb);
      if (tp >= 12.9) landFrozen = true;
    }
    if (lf) {
      lf.clearRect(0, H * .5, W, H * .6);
      drawReeds(pal); drawGrass(pal);
    }
  }

  function drawWater(pal, dt) {
    if (!dc) return;
    const a0 = ph(6, 10); if (a0 <= .01) return;
    dc.save(); dc.lineCap = 'round';
    streaks.forEach(s => {
      const span = W + s.len * 2, x = (((s.x + T * s.sp) % span) + span) % span - s.len;
      const al = s.a * a0 * (.6 + .4 * Math.sin(T * .8 + s.ph));
      dc.strokeStyle = rgba(pal.reflection, al); dc.lineWidth = s.lw;
      dc.beginPath(); dc.moveTo(x, s.y); dc.lineTo(x + s.len, s.y); dc.stroke();
    });
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]; r.r += dt * 22 * S; r.a -= dt * .05;
      if (r.a <= .005 || r.r > r.max) { ripples.splice(i, 1); continue; }
      dc.strokeStyle = rgba(pal.reflection, r.a); dc.lineWidth = 1.3 * S;
      dc.beginPath(); dc.ellipse(r.x, r.y, r.r, r.r * .18, 0, 0, TAU); dc.stroke();
    }
    dc.restore();
  }

  // ---- sampan boat
  function hull(c, detail, oarPh, t) {
    c.beginPath();
    c.moveTo(-188, -25); c.quadraticCurveTo(-142, -14, -75, -14); c.lineTo(118, -15);
    c.quadraticCurveTo(162, -17, 188, -28); c.quadraticCurveTo(158, -3, 112, 1); c.lineTo(-92, 1);
    c.quadraticCurveTo(-148, -2, -188, -25); c.closePath(); c.fill();
    const n1v = Math.sin(t * 1.1) * .6, n2v = Math.cos(t * 1.3) * .6;
    c.beginPath(); c.arc(-92, -37 + n1v, 5.2, 0, TAU); c.moveTo(-104, -14);
    c.quadraticCurveTo(-102, -31, -92, -33); c.quadraticCurveTo(-82, -30, -80, -14); c.closePath(); c.fill();
    c.beginPath(); c.arc(-64, -39 + n2v, 5.4, 0, TAU); c.moveTo(-74, -14);
    c.quadraticCurveTo(-72, -33, -64, -35); c.quadraticCurveTo(-53, -32, -52, -14); c.closePath(); c.fill();
    if (detail) { c.beginPath(); c.arc(-118, -17, 3.2, 0, TAU); c.arc(-22, -18, 4.2, 0, TAU); c.fill(); }
    const lean = Math.sin(oarPh - .35) * 1.5;
    c.beginPath(); c.arc(129 + lean, -54, 5.2, 0, TAU); c.moveTo(121, -15);
    c.quadraticCurveTo(120 + lean * .5, -38, 128 + lean, -49); c.quadraticCurveTo(138 + lean * .5, -46, 138, -15); c.closePath(); c.fill();
    c.save(); c.translate(128 + lean * .6, -34); c.rotate(Math.sin(oarPh) * .06);
    c.lineWidth = 2.5; c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(-14, 6); c.lineTo(122, -22); c.stroke(); c.restore();
  }

  function drawBoat(pal, x, y, sc, reveal) {
    if (!dc || reveal <= .01) return;
    const [hl, md, oc, gl, rf, pr] = [pal.boatHull, pal.boatMid, pal.canopyOchre, pal.canopyGlow, pal.reflection, pal.paperRgb];
    const lantern = .28 + .1 * Math.sin(T * 2.3) + .05 * Math.sin(T * 5.1);
    const oarPh = T * 1.05, bob = Math.sin(T * 1.35) * 1.4 * S, pitch = Math.cos(T * 1.1) * .0032;
    const c = dc;
    c.save(); c.globalAlpha = Math.min(1, reveal); c.translate(x, y + bob); c.scale(sc, sc); c.rotate(pitch);
    c.save(); c.translate(0, 6); c.scale(1, -.78); c.translate(Math.sin(T * 1.8) * 2.6, 0);
    const lr = c.createRadialGradient(-162, -32, 4, -120, -28, 125);
    lr.addColorStop(0, rgba(gl, .42 * lantern)); lr.addColorStop(1, rgba(gl, 0));
    c.fillStyle = lr; c.beginPath(); c.ellipse(-120, -28, 125, 52, 0, 0, TAU); c.fill();
    c.fillStyle = rgba(rf, .24); hull(c, false, oarPh, T);
    c.fillStyle = rgba(oc, .18); c.fillRect(10, -56, 114, 24); c.restore();
    c.strokeStyle = rgba(pr, .68);
    for (let ry = 10; ry <= 62; ry += 6.5) { 
      c.lineWidth = 1.8; c.beginPath(); c.moveTo(-200, ry + Math.sin(T * 1.2 + ry) * .6); c.lineTo(210, ry); c.stroke(); 
    }
    c.strokeStyle = rgba(rf, .32); c.lineWidth = 1.4; c.beginPath();
    c.moveTo(-250, 3); c.lineTo(260, 3); c.moveTo(-215, 9); c.lineTo(220, 9); c.moveTo(-170, 16); c.lineTo(180, 16); c.stroke();
    const cg = c.createLinearGradient(8, -58, 8, -32);
    cg.addColorStop(0, rgba(oc, .92)); cg.addColorStop(.6, `rgba(${oc[0] + 18},${oc[1] + 14},${oc[2] + 10},.78)`); cg.addColorStop(1, rgba(oc, .15));
    c.fillStyle = cg; c.beginPath(); c.moveTo(8, -52); c.quadraticCurveTo(65, -58, 122, -50); c.lineTo(120, -34); c.quadraticCurveTo(65, -40, 10, -36); c.closePath(); c.fill();
    c.strokeStyle = rgba(hl, .88); c.lineCap = 'round'; c.lineWidth = 2.4; c.beginPath();
    c.moveTo(-4, -52); c.quadraticCurveTo(64, -57, 124, -49); c.lineWidth = 1.6;
    c.moveTo(10, -37); c.quadraticCurveTo(64, -41, 120, -35);
    c.moveTo(32, -52); c.lineTo(31, -15); c.moveTo(64, -54); c.lineTo(64, -15); c.moveTo(96, -52); c.lineTo(96, -15); c.moveTo(116, -49); c.lineTo(115, -16); c.stroke();
    c.lineWidth = 3.2; c.beginPath(); c.moveTo(3, -14); c.lineTo(3, -64); c.lineWidth = 1.6; c.moveTo(8, -14); c.lineTo(8, -58); c.stroke();
    const cl = c.createRadialGradient(-165, -34, 3, -100, -34, 130);
    cl.addColorStop(0, rgba(gl, .55 * lantern)); cl.addColorStop(.5, rgba(gl, .22 * lantern)); cl.addColorStop(1, rgba(gl, 0));
    c.fillStyle = cl; c.beginPath(); c.arc(-100, -34, 130, 0, TAU); c.fill();
    c.fillStyle = `rgba(198,59,54,${.88 * Math.min(1, lantern * 2)})`; c.beginPath(); c.ellipse(-155, -33, 5.5, 7.5, 0, 0, TAU); c.fill();
    c.fillStyle = rgba(hl, .95); hull(c, true, oarPh, T);
    c.strokeStyle = rgba(md, .75); c.lineWidth = 2.2; c.beginPath(); c.moveTo(-125, -14); c.quadraticCurveTo(0, -10, 130, -15); c.stroke();
    c.restore();
  }

  // ---- birds
  function wingBeat(t, off) {
    const cyc = 4.6, u = ((t + off) % cyc) / cyc;
    if (u < .58) { 
      const an = (u / .58) * Math.PI * 4, env = Math.sin((u / .58) * Math.PI); 
      return [Math.sin(an) * env, Math.sin(an - .52) * env]; 
    }
    const s = Math.sin(((u - .58) / .42) * Math.PI) * .12; return [s, s * .8];
  }
  
  function drawBirds(pal, reveal, dt) {
    if (!dc || reveal <= .01) return;
    const ink = pal.inkBlack;
    birds.forEach((b, i) => {
      const px = b.x;
      b.x = b.bx + Math.sin(T * .11 + b.ph) * 90 * S + Math.sin(T * .27 + b.ph * 2) * 20 * S;
      b.y = b.by + Math.sin(T * .16 + b.ph * 1.3) * 42 * S + Math.cos(T * .4 + i) * 7 * S;
      b.bank += (clamp((b.x - px) * .5, -.14, .14) - b.bank) * .06;
      b.alpha = Math.min(1, b.alpha + dt * .35);
      const [flap, tip] = wingBeat(T, b.wph);
      dc.save(); dc.globalAlpha = Math.min(1, reveal) * b.alpha;
      dc.translate(b.x, b.y); dc.scale(b.sc, b.sc); dc.rotate(b.bank);
      dc.fillStyle = rgba(ink, .92); dc.strokeStyle = rgba(ink, .92); dc.lineCap = 'round'; dc.lineJoin = 'round';
      if (b.type === 'glider') {
        dc.beginPath(); dc.moveTo(-8, 4); dc.lineTo(6, 2); dc.lineTo(12, 11); dc.lineTo(1, 9); dc.closePath(); dc.fill();
        dc.beginPath(); dc.moveTo(0, 5); dc.quadraticCurveTo(-24, 3 - flap * 4.2, -46, -2 - tip * 8.5); dc.quadraticCurveTo(-24, 10 - flap * 1.8, 2, 8); dc.closePath(); dc.fill();
        dc.beginPath(); dc.moveTo(2, 5); dc.quadraticCurveTo(24, -10 + flap * 4.2, 44, -34 + tip * 8.5); dc.quadraticCurveTo(30, -4 + flap * 1.8, 5, 8); dc.closePath(); dc.fill();
      } else if (b.type === 'banker') {
        dc.beginPath(); dc.moveTo(0, 2); dc.quadraticCurveTo(-16, -12 - flap * 4.5, -30, -24 - tip * 7.2); dc.quadraticCurveTo(-14, -2, 0, 6);
        dc.moveTo(0, 2); dc.quadraticCurveTo(16, flap * 3.8, 32, -4 + tip * 6.5); dc.quadraticCurveTo(14, 6, 0, 6); dc.fill();
      } else {
        dc.lineWidth = 4.6; dc.beginPath(); dc.moveTo(-28, -8 - tip * 5.8); dc.quadraticCurveTo(-11, -3 - flap * 2.2, 0, 5);
        dc.quadraticCurveTo(12, -4 - flap * 2.2, 29, -9 - tip * 5.8); dc.stroke();
      }
      dc.restore();
    });
  }

  // ---- drifting petals
  function drawPetals(pal, dt) {
    if (!dc) return;
    const a0 = ph(11.8, 14); if (a0 <= .01) return;
    petals.forEach((p, i) => {
      p.life += dt * .045; p.x += (p.vx + Math.sin(T * .8 + p.ph) * 8 * S) * dt; p.y += p.vy * dt; p.ang += p.spin * dt;
      if (p.life >= 1 || p.y > wy + .1 * H) { petals[i] = newPetal(false); return; }
      const al = Math.sin(p.life * Math.PI) * .8 * a0;
      dc.save(); dc.translate(p.x, p.y); dc.rotate(p.ang); dc.fillStyle = rgba(p.col ? pal.plumBlush : pal.plumRed, al);
      dc.beginPath(); dc.ellipse(0, 0, p.r, p.r * .55, 0, 0, TAU); dc.fill(); dc.restore();
    });
  }

  // ---- Kanri Calligraphy (管理) + Monogram Seal
  // Glyphs: 管 (Kuan / Control) & 理 (Li / Logic & Ledger)
  const glyphs = [
    (c) => { 
      // 竹字头 (Bamboo radical) + 官
      c.lineWidth = 3.2; c.beginPath(); 
      c.moveTo(-12,-16); c.lineTo(-4,-15); c.moveTo(-8,-16); c.lineTo(-8,-9);
      c.moveTo(2,-16); c.lineTo(11,-15); c.moveTo(7,-16); c.lineTo(5,-9);
      c.moveTo(-11,-8); c.lineTo(11,-8); c.moveTo(-10,-8); c.lineTo(-12,2);
      c.moveTo(10,-8); c.lineTo(12,2); c.moveTo(-8,2); c.lineTo(8,2);
      c.moveTo(-7,8); c.lineTo(7,8); c.moveTo(-7,8); c.lineTo(-7,15); c.moveTo(7,8); c.lineTo(7,15);
      c.moveTo(-7,15); c.lineTo(7,15); c.stroke();
    },
    (c) => { 
      // 王 (Jade) + 里 (Ledger/Village)
      c.lineWidth = 3.2; c.beginPath(); 
      c.moveTo(-14,-14); c.lineTo(-4,-14); c.moveTo(-9,-14); c.lineTo(-9,13);
      c.moveTo(-12,-2); c.lineTo(-5,-2); c.moveTo(-14,13); c.lineTo(-3,13);
      c.moveTo(1,-14); c.lineTo(14,-14); c.moveTo(1,-14); c.lineTo(1,-3); c.moveTo(14,-14); c.lineTo(14,-3);
      c.moveTo(1,-3); c.lineTo(14,-3); c.moveTo(7,-14); c.lineTo(7,14);
      c.moveTo(2,5); c.lineTo(13,5); c.moveTo(0,14); c.lineTo(15,14); c.stroke();
    }
  ];

  function drawCalligraphy(pal) {
    if (!dc) return;
    const g = ph(13, 17); if (g <= .01) return;
    const gs = 1.5 * S, cx = W * (portrait ? .885 : .935), y0 = H * (portrait ? .115 : .14);
    const ys = [0, 56 * gs];
    dc.save(); dc.strokeStyle = rgba(pal.inkBlack, .9); dc.lineCap = 'round'; dc.lineJoin = 'round';
    glyphs.forEach((fn, i) => {
      const gp = clamp((g - i * .22) / .38, 0, 1); if (gp <= .01) return;
      dc.save(); dc.translate(cx, y0 + ys[i]); dc.scale(gs, gs);
      dc.beginPath(); dc.rect(-20, -20, 40, 40 * gp); dc.clip();
      dc.globalAlpha = Math.min(1, gp * 1.6); fn(dc); dc.restore();
    });
    
    // Kanri Mon Monogram Seal (管理)
    const sp = clamp((g - .72) / .28, 0, 1);
    if (sp > .01) {
      const sz = 28 * gs, sx = cx - sz / 2, sy = y0 + 85 * gs, [sr, pr] = [pal.sealRed, pal.paperRgb];
      dc.save(); dc.translate(cx, sy + sz / 2); const sc = 1 + (1 - sp) * .25; dc.scale(sc, sc); dc.translate(-cx, -(sy + sz / 2));
      dc.globalAlpha = sp; dc.fillStyle = rgba(sr, .92);
      dc.beginPath(); if (dc.roundRect) dc.roundRect(sx, sy, sz, sz, 3 * gs); else dc.rect(sx, sy, sz, sz); dc.fill();
      dc.strokeStyle = rgba(pr, .9); dc.lineWidth = 1.7 * gs; dc.strokeRect(sx + 3 * gs, sy + 3 * gs, sz - 6 * gs, sz - 6 * gs);
      // Clean 4-fold mini glyph
      dc.beginPath(); const u = gs;
      dc.moveTo(sx + 7 * u, sy + 7 * u); dc.lineTo(sx + 7 * u, sy + sz - 7 * u); 
      dc.moveTo(sx + 4 * u, sy + 14 * u); dc.lineTo(sx + 14 * u, sy + 14 * u);
      dc.moveTo(sx + 15 * u, sy + 8 * u); dc.lineTo(sx + sz - 6 * u, sy + 8 * u); 
      dc.moveTo(sx + 15 * u, sy + 17 * u); dc.lineTo(sx + sz - 6 * u, sy + 17 * u); dc.stroke();
      dc.restore();
      if (sp >= 1) {
        const pr2 = 18 * gs + ((T * 10 * S) % (34 * gs)), pa = (1 - (pr2 - 18 * gs) / (34 * gs)) * .22;
        dc.strokeStyle = rgba(sr, pa); dc.lineWidth = 1.6 * S; dc.beginPath(); dc.arc(cx, sy + sz / 2, pr2, 0, TAU); dc.stroke();
      }
    }
    dc.restore();
  }

  // ---------------------------------------------------------------- main animation loop
  function frame(ts, still) {
    if (t0 === null) { t0 = ts; last = ts; }
    const dt = Math.min(.05, (ts - last) / 1000); last = ts;
    const real = (ts - t0) / 1000;
    T = still ? 4 : real + 3;
    tp = still ? 99 : real * speed;
    const pal = PAL[theme];

    if (!wetFrozen) { drawWet(); if (tp >= 9.3) wetFrozen = true; }
    drawMist(pal);

    if (dc) {
      dc.clearRect(0, 0, W, H);
      drawMidDabs(pal);
      drawWaterfall(pal);
      drawWater(pal, dt);

      // sampan boat glides in from right, ripples out
      const bIn = ph(10.5, 15.5);
      const bx = W * (portrait ? .58 : .60) + (1 - bIn) * W * .5 + Math.sin(T * .12) * 14 * S;
      const by = H * (portrait ? .815 : .835);
      const bScale = .95 * S;
      if (T - lastRipple > 1.45 && bIn > .35) {
        lastRipple = T;
        ripples.push({ 
          x: bx + (Math.random() > .45 ? 135 : -135) * bScale + (Math.random() - .5) * 24 * S, 
          y: by + 6 * S, r: 10 * S, max: 110 * S, a: .22 
        });
      }
      drawBoat(pal, bx, by, bScale, ph(10.5, 13.5));
      drawTrees(pal);
      drawBirds(pal, ph(12.5, 15), dt);
      drawPetals(pal, dt);
      drawCalligraphy(pal);
    }

    drawLand(pal);

    // Smooth scroll internal interpolation
    if (Math.abs(scrollTarget - scrollCur) > .0002) { 
      scrollCur += (scrollTarget - scrollCur) * .12; 
      applyScroll(); 
    }

    if (!still && isVisibleOnScreen && !document.hidden) rafId = requestAnimationFrame(frame); else rafId = null;
  }

  let isVisibleOnScreen = true;

  function start() {
    cancelAnimationFrame(rafId); t0 = null;
    if (reduced) { requestAnimationFrame(ts => frame(ts, true)); return; }
    if (!isVisibleOnScreen || document.hidden) { rafId = null; return; }
    rafId = requestAnimationFrame(frame);
  }

  if (wrap && 'IntersectionObserver' in window) {
    const bgObs = new IntersectionObserver(([entry]) => {
      isVisibleOnScreen = entry.isIntersecting;
      if (isVisibleOnScreen && !document.hidden && !reduced) {
        if (!rafId) start();
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }, { threshold: 0 });
    bgObs.observe(wrap);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (isVisibleOnScreen && !reduced) {
      start();
    }
  });

  // ---------------------------------------------------------------- parallax transforms
  function applyScroll() {
    if (window.disableInternalBgParallax) return;
    const ps = clamp(scrollCur, 0, 1.5), h = innerHeight;
    const ty = k => `translate3d(0,${(-ps * k * h).toFixed(2)}px,0)`;
    if (cvs.wet) cvs.wet.style.transform = ty(depth.scene);
    if (cvs.mist) cvs.mist.style.transform = ty(depth.scene);
    if (cvs.dyn) cvs.dyn.style.transform = ty(depth.scene);
    if (landEl) landEl.style.transform = ty(Math.min(depth.land, .28));
  }

  function onScroll() {
    scrollTarget = Math.max(0, (window.scrollY || document.documentElement.scrollTop || 0) / innerHeight);
    if (reduced) { scrollCur = scrollTarget; applyScroll(); }
  }

  // ---------------------------------------------------------------- init & public API
  build(); 
  start();

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let rz = 0;
  window.addEventListener('resize', () => { 
    clearTimeout(rz); 
    rz = setTimeout(() => {
      const keepT = t0 === null ? null : performance.now() - t0; 
      build();
      if (reduced) start(); else if (keepT !== null) t0 = performance.now() - keepT; 
    }, 180); 
  });

  window.InkBackground = {
    depth,
    setScroll(p) { 
      scrollTarget = Math.max(0, +p || 0); 
      if (reduced) { scrollCur = scrollTarget; applyScroll(); } 
    },
    replay() { 
      wetFrozen = false; landFrozen = false; 
      birds.forEach(b => b.alpha = 0); 
      ripples = []; 
      start(); 
    },
    setTheme(n) { 
      // Hero painting is strictly light mode; ignore dark theme requests
      return; 
    },
    setSpeed(n) { 
      const keep = tp / speed; 
      speed = clamp(+n || 1, .25, 4); 
      t0 = performance.now() - (keep / speed) * 1000; 
    }
  };
})();
