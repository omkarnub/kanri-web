/**
 * Kanri Website — 3D DotTiles Warp Carousel
 * Showcases Kanri's 12 Pixel DotTiles Widgets in a sleek 3D WebGL2 & Canvas loop.
 * Monochromatic obsidian design system matching Kanri widgets 1:1 with zero artificial rainbow colors.
 */
(function () {
  'use strict';

  const CW = 256;
  const CH = 320;
  const CR = 18;
  const FOCAL = 734.103;
  const G = {
    qA: 0.46401,
    XLA: 165.774,
    zA: 35.354,
    psiA: 1.44638,
    a1: 1.31454,
    a2: 1.10948,
    qB: 0.74999,
    XB: 204.525,
    ZB: 355.405,
    bB: 0.69311,
    bE: 0.04614,
    vC: 203.134,
    aC: 229.260,
    kB: 0.01087,
    bP: 0.99129,
    qPR: 1.01828,
    bPL: 1.00920,
    qPL: 1.07139,
  };

  // 12 Authentic Kanri DotTiles Widgets (Matching the widgets grid 1:1, sleek monochrome)
  const KANRI_WIDGET_CARDS = [
    {
      id: "today",
      title: "Today",
      sizeTag: "2x2 · 4x2",
      description: "Spent today, expense count, pacing bar vs daily budget limit, and 4 checkpoint cards (MORN · AFTN · EVE · NIGHT).",
      image: "assets/images/widgets/widget_preview_today.webp"
    },
    {
      id: "budget",
      title: "Budget",
      sizeTag: "2x1 · 2x2 · 4x2",
      description: "Dual progress bars: used budget percentage, total scale, days remaining, and expected pacing marker.",
      image: "assets/images/widgets/widget_preview_budget.webp"
    },
    {
      id: "wallets",
      title: "Wallets",
      sizeTag: "2x2 · 4x2",
      description: "Net balance hero metric in large Ndot57 numerals, clean Cash and Bank breakdown rows with allocation percentages.",
      image: "assets/images/widgets/widget_preview_wallets.webp"
    },
    {
      id: "goals",
      title: "Goals",
      sizeTag: "2x2 · 4x1",
      description: "Primary savings target progress, percentage saved, and 25/50/75/100% milestone ticks.",
      image: "assets/images/widgets/widget_preview_goals.webp"
    },
    {
      id: "dues",
      title: "Dues",
      sizeTag: "2x2 · 4x2",
      description: "Net balance subtitle and top lend/borrow contacts list with name and +₹ / -₹ amounts.",
      image: "assets/images/widgets/widget_preview_dues.webp"
    },
    {
      id: "sky",
      title: "Financial Sky",
      sizeTag: "4x2",
      description: "Flagship financial weather: recessed dot-matrix sky well (sun/moon arc), today spend, safe to spend per day, and 7-day pacing.",
      image: "assets/images/widgets/widget_preview_sky.webp"
    },
    {
      id: "heatmap",
      title: "Month Heatmap",
      sizeTag: "4x3 · 4x2",
      description: "GitHub-style 7-row (Mon..Sun) by 5-week contribution grid with 4 intensity levels, day labels, and today ring.",
      image: "assets/images/widgets/widget_preview_heatmap.webp"
    },
    {
      id: "streak",
      title: "No-Spend Streak",
      sizeTag: "2x2 · 4x1",
      description: "Consecutive no-spend day streak in Ndot57 numerals, all-time best streak, and a row of 7 pixelated flames.",
      image: "assets/images/widgets/widget_preview_streak.webp"
    },
    {
      id: "safe_to_spend",
      title: "Safe to Spend",
      sizeTag: "2x2 · 4x1",
      description: "Remaining daily spending allowance until cycle end vs today's actual spend.",
      image: "assets/images/widgets/widget_preview_safe_to_spend.webp"
    },
    {
      id: "review_inbox",
      title: "Review Inbox",
      sizeTag: "2x1 · 2x2",
      description: "Count of SMS-detected expenses awaiting categorization and pending amount.",
      image: "assets/images/widgets/widget_preview_review_inbox.webp"
    },
    {
      id: "month_delta",
      title: "Month Delta",
      sizeTag: "2x2 · 4x2",
      description: "Spend so far this month compared to the exact same day last month with ▲ / ▼ delta %.",
      image: "assets/images/widgets/widget_preview_month_delta.webp"
    },
    {
      id: "quick_actions",
      title: "Quick Actions",
      sizeTag: "4x1 · 2x1",
      description: "One-tap pixel-glyph action buttons for Expense (-), Income (+), and Split (÷).",
      image: "assets/images/widgets/widget_preview_quick_actions.webp"
    }
  ];

  function poseAt(q) {
    const s = Math.sign(q) || 1;
    const a = Math.abs(q);
    const half = CW * 0.5;
    if (a <= G.qA) {
      const t = a / G.qA;
      const xl = -half + (G.XLA + half) * Math.pow(t, G.a1);
      const zl = G.zA * t ** 4;
      const psi = G.psiA * Math.pow(t, G.a2);
      return [s * (xl + half * Math.cos(psi)), zl + half * Math.sin(psi), s * psi];
    }
    const dXL = ((G.XLA + half) * G.a1) / G.qA;
    const dZL = (G.zA * 4) / G.qA;
    const dps = (G.psiA * G.a2) / G.qA;
    let Hx, Hz;
    if (a <= G.qB) {
      const L = G.qB - G.qA;
      const t = (a - G.qA) / L;
      const hx = G.XLA + CW * Math.cos(G.psiA);
      const hz = G.zA + CW * Math.sin(G.psiA);
      const dhx = dXL - CW * Math.sin(G.psiA) * dps;
      const dhz = dZL + CW * Math.cos(G.psiA) * dps;
      const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
      const h10 = t ** 3 - 2 * t ** 2 + t;
      const h01 = -2 * t ** 3 + 3 * t ** 2;
      const h11 = t ** 3 - t ** 2;
      Hx = h00 * hx + h10 * L * dhx * G.bB + h01 * G.XB + h11 * L * G.vC * G.bE;
      Hz = h00 * hz + h10 * L * dhz * G.bB + h01 * G.ZB;
    } else {
      const d = a - G.qB;
      Hx = G.XB + G.vC * d + G.aC * d * d;
      Hz = G.ZB;
    }
    const qP = s < 0 ? G.qPL : G.qPR;
    const bP = s < 0 ? G.bPL : G.bP;
    const LP = qP - G.qA;
    const tp = Math.min(1, (a - G.qA) / LP);
    const psi = (2 * tp ** 3 - 3 * tp ** 2 + 1) * G.psiA + (tp ** 3 - 2 * tp ** 2 + tp) * LP * dps * bP + (-2 * tp ** 3 + 3 * tp ** 2) * Math.PI;
    return [s * (Hx - half * Math.cos(psi)), Hz - half * Math.sin(psi), s * psi];
  }

  const TK = [0, 3, 6, 8, 10, 11, 12, 13, 14, 16, 18, 21, 25, 30, 36, 45, 55, 70, 88, 110];
  const TB = [0, 0.02175, 0.12069, 0.22549, 0.35493, 0.43254, 0.51436, 0.5952, 0.6751, 0.83199, 0.9709, 1.12669, 1.27958, 1.40975, 1.53561, 1.68385, 1.79183, 1.89191, 1.95233, 2];
  const DRIFT = 0.06511;
  const REST_PHASE = 81.828;
  const STEP_FRAMES = 110;

  const SLOPES = (() => {
    const n = TK.length;
    const h = TK.slice(1).map((x, i) => x - TK[i]);
    const dl = h.map((hi, i) => (TB[i + 1] - TB[i]) / hi);
    const d = new Array(n).fill(0);
    for (let k = 1; k < n - 1; k++) {
      if (dl[k - 1] * dl[k] <= 0) d[k] = 0;
      else {
        const w1 = 2 * h[k] + h[k - 1];
        const w2 = h[k] + 2 * h[k - 1];
        d[k] = (w1 + w2) / (w1 / dl[k - 1] + w2 / dl[k]);
      }
    }
    const v = (dl[0] + dl[n - 2]) / 2;
    d[0] = v;
    d[n - 1] = v;
    return d;
  })();

  function spin(frames) {
    if (frames <= 0) return 0;
    if (frames >= STEP_FRAMES) return 1;
    let i = 0;
    while (i < TK.length - 2 && frames > TK[i + 1]) i++;
    const h = TK[i + 1] - TK[i];
    const t = (frames - TK[i]) / h;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    return (h00 * TB[i] + h10 * h * SLOPES[i] + h01 * TB[i + 1] + h11 * h * SLOPES[i + 1]) / 2;
  }

  function spinN(frames, n) {
    if (n <= STEP_FRAMES + 0.5) return spin((frames * STEP_FRAMES) / Math.max(1, n));
    const knee = 80;
    if (frames <= knee) return spin(frames);
    return spin(knee + ((frames - knee) * (STEP_FRAMES - knee)) / (n - knee));
  }

  const LEAD = (STEP_FRAMES - REST_PHASE) / 30;

  function autoplayProgress(t, start, step, interval) {
    if (t < LEAD) return start - step + DRIFT + step * spin(REST_PHASE + t * 30);
    const k = Math.floor((t - LEAD) / interval);
    const tau = (t - LEAD - k * interval) * 30;
    return start + k * step + DRIFT + step * spinN(tau, interval * 30);
  }

  /**
   * Paint authentic monochrome DotTiles widget card on 256x320 canvas
   * Matches .widget-tile-card from the removed grid exactly.
   */
  function paintCard(cv, card, family, img) {
    const w = cv.width;
    const h = cv.height;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const k = w / CW;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.save();

    // 1. Sleek Obsidian Card Slate (#08080A)
    ctx.beginPath();
    ctx.roundRect(0, 0, CW, CH, CR);
    ctx.fillStyle = "#08080A";
    ctx.fill();

    // Subtle dark gradient sheen
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CH);
    bgGrad.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    bgGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.01)");
    bgGrad.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Sleek border matching #1E1E24
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1E1E24";
    ctx.stroke();

    // Inner top highlight sheen
    ctx.beginPath();
    ctx.roundRect(1, 1, CW - 2, CH - 2, CR - 1);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.stroke();

    // 2. Widget Preview Image Container
    const pad = 12;
    const imgAreaW = CW - pad * 2; // 232px
    const imgAreaH = 186; // 186px
    const imgAreaX = pad;
    const imgAreaY = pad;

    // Pitch black receptacle with subtle border #16161C
    ctx.beginPath();
    ctx.roundRect(imgAreaX, imgAreaY, imgAreaW, imgAreaH, 12);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#16161C";
    ctx.stroke();

    // Render authentic widget image
    if (img && img.complete && img.naturalWidth > 0) {
      const maxW = imgAreaW - 10;
      const maxH = imgAreaH - 10;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const dw = Math.round(img.naturalWidth * scale);
      const dh = Math.round(img.naturalHeight * scale);
      const dx = Math.round(imgAreaX + (imgAreaW - dw) / 2);
      const dy = Math.round(imgAreaY + (imgAreaH - dh) / 2);

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 12 * k;
      ctx.shadowOffsetY = 4 * k;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = '600 12px "Ndot57", monospace';
      ctx.textAlign = "center";
      ctx.fillText(card.title, imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH / 2);
      ctx.textAlign = "left";
    }

    // 3. Widget Metadata: Title & Size Tag Pill
    const textStartY = imgAreaY + imgAreaH + 18; // y = 216

    // Title
    ctx.font = '700 14px var(--font-sans, "Google Sans", sans-serif)';
    ctx.fillStyle = "#F2F2F5";
    ctx.fillText(card.title, pad + 2, textStartY);

    // Size Tag Pill (right-aligned)
    if (card.sizeTag) {
      ctx.font = '600 8.5px "Ndot57", monospace';
      const stw = ctx.measureText(card.sizeTag).width;
      const pillW = stw + 12;
      const pillH = 16;
      const pillX = CW - pad - pillW - 2;
      const pillY = textStartY - 11;

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 4);
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillText(card.sizeTag, pillX + 6, pillY + 11.5);
    }

    // 4. Exact Widget Description
    if (card.description) {
      ctx.font = '400 9.5px var(--font-sans, "Google Sans", sans-serif)';
      ctx.fillStyle = "rgba(255, 255, 255, 0.58)";

      const words = card.description.split(" ");
      let line = "";
      let lineY = textStartY + 16;
      const maxWidth = CW - pad * 2 - 4;
      const lineHeight = 13.5;
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + (line ? " " : "") + words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, pad + 2, lineY);
          line = words[n];
          lineY += lineHeight;
          lineCount++;
          if (lineCount >= 3) {
            line = line + "...";
            break;
          }
        } else {
          line = testLine;
        }
      }
      if (line && lineCount < 4) {
        ctx.fillText(line, pad + 2, lineY);
      }
    }

    ctx.restore();
  }

  // WebGL Shaders (Pure monochrome geometric warp without artificial rainbow chromatic fringe)
  const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uTex;
uniform vec2 uRes;
uniform float uUnit;
uniform vec4 uPose[8];
uniform vec3 uGlowCol[8];
uniform vec3 uGlowShape[8];
uniform vec3 uBg;
uniform float uWarp;
uniform float uMix;
out vec4 outColor;

const float F = ${FOCAL.toFixed(2)};
const float CW = ${CW.toFixed(1)};
const float CH = ${CH.toFixed(1)};
const float CR = ${CR.toFixed(1)};

float lensH(float a){
  if (a <= 232.0) return a;
  float k[9] = float[9](232.0, 238.0, 245.0, 253.0, 262.0, 275.0, 295.0, 325.0, 360.0);
  float d[9] = float[9](1.1759, 1.0671, 1.0156, 1.0965, 0.6487, 0.2700, -0.1991, -0.4782, -0.0318);
  float s = 232.0;
  for (int i = 0; i < 8; i++){
    if (a <= k[i]) break;
    float x = min(a, k[i+1]);
    float t = (x - k[i]) / (k[i+1] - k[i]);
    s += (x - k[i]) * mix(1.0, mix(d[i], d[i+1], t * 0.5), uWarp);
  }
  if (a > 360.0) s += (a - 360.0) * mix(1.0, d[8], uWarp);
  return s;
}

float lensS(float a){
  float t = clamp((a - 262.0) / 93.0, 0.0, 2.0);
  return 1.0 + uWarp * (0.42 * pow(t, 1.5) + 0.045 * smoothstep(320.0, 360.0, a));
}

float sdRound(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec4 shadeCard(vec4 pose, vec2 ps, float fx, float fy, out float depth){
  depth = 1e9;
  if (pose.w < 0.0) return vec4(0.0);
  float k = ps.x / F;
  float c = cos(pose.z), sn = sin(pose.z);
  float den = sn * k - c;
  if (abs(den) < 1e-5) return vec4(0.0);
  float A = pose.x, B = F + pose.y;
  float s = (A - B * k) / den;
  float t = B + s * sn;
  if (t < 4.0) return vec4(0.0);
  float y = t * ps.y / F;
  float dsdk = (B * c - A * sn) / (den * den);
  float fs = min(abs(dsdk / F) * fx, 48.0);
  float fyc = min(t / F * fy, 48.0);
  vec2 p = vec2(s, y);
  float d = sdRound(p, vec2(CW, CH) * 0.5, CR);
  vec2 q = abs(p) - vec2(CW, CH) * 0.5 + CR;
  vec2 n = q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  if (q.x > 0.0 && q.y > 0.0) n = normalize(q);
  float fp = length(vec2(fs * n.x, fyc * n.y)) + 1e-4;
  if (d > fp) return vec4(0.0);
  float cov = clamp(0.5 - d / fp, 0.0, 1.0);
  if (cov <= 0.0) return vec4(0.0);
  vec2 uv = vec2(s / CW + 0.5, 0.5 - y / CH);
  vec4 tex = textureGrad(uTex, vec3(uv, pose.w), vec2(fs / CW, 0.0), vec2(0.0, fyc / CH));
  depth = t;
  return vec4(tex.rgb, 1.0) * cov;
}

vec4 scene(vec2 ps, float fx, float fy, int base){
  vec4 col[4];
  float dep[4];
  for (int i = 0; i < 4; i++) col[i] = shadeCard(uPose[base + i], ps, fx, fy, dep[i]);
  for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++)
      if (j < 3 - i && dep[j] > dep[j+1]) {
        float td = dep[j]; dep[j] = dep[j+1]; dep[j+1] = td;
        vec4 tc = col[j]; col[j] = col[j+1]; col[j+1] = tc;
      }
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 4; i++) acc += (1.0 - acc.a) * col[i];
  return acc;
}

vec3 render(vec2 pu, float halfH, int base){
  float au = min(abs(pu.x), 360.0);
  float px = 1.0 / uUnit;
  vec3 bg = uBg;
  if (au < 236.0 || uWarp <= 0.0) {
    vec4 c = scene(pu, px, px, base);
    return c.rgb + (1.0 - c.a) * bg;
  }
  float S0 = lensS(au);
  float sg = pu.x < 0.0 ? -1.0 : 1.0;
  float blur = 1.0 + 30.0 * pow(smoothstep(240.0, 340.0, au), 1.5) * uWarp;
  float fyb = 1.0 + 15.0 * smoothstep(280.0, 352.0, au) * uWarp;
  float gain = 1.0 + 0.17 * smoothstep(285.0, 350.0, au) * uWarp;

  // Clean monochromatic wide-lens perspective warp without artificial color chromatic aberration
  float h = lensH(au);
  float h0 = lensH(au - 0.5);
  float h1 = lensH(au + 0.5);
  float fx = px * max(abs(h1 - h0), 0.02) * blur;
  vec4 c = scene(vec2(sg * h, pu.y / S0), fx, px / S0 * fyb, base);
  c.rgb = min(c.rgb * gain, vec3(c.a));
  return c.rgb + (1.0 - c.a) * bg;
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 pu = (fc - 0.5 * uRes) / uUnit;
  float halfH = 0.5 * uRes.y / uUnit;
  vec3 col = render(pu, halfH, 0);
  if (uMix > 0.0) col = mix(col, render(pu, halfH, 4), uMix);
  outColor = vec4(col, 1.0);
}`;

  function initWarpCarousel(container) {
    if (!container) return;

    const cards = KANRI_WIDGET_CARDS;
    const N = cards.length;
    const interval = 3.6;
    const step = 1;
    const warp = 1.0;
    const bgCol = [0, 0, 0];
    const family = '"Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Create Canvas
    const canvas = document.createElement("canvas");
    canvas.className = "warp-carousel-canvas";
    canvas.style.cssText = "width:100%; height:100%; display:block; cursor:grab; user-select:none; touch-action:none;";
    container.innerHTML = "";
    container.appendChild(canvas);

    // Preload actual widget preview images (from embedded base64 data URIs or asset path)
    const widgetImages = {};
    cards.forEach((card) => {
      const img = new Image();
      const dataUri = (typeof window !== "undefined" && window.KANRI_WIDGET_DATA_URIS && window.KANRI_WIDGET_DATA_URIS[card.id])
        ? window.KANRI_WIDGET_DATA_URIS[card.id]
        : card.image;
      img.src = dataUri;
      widgetImages[card.id] = img;
    });

    // Pre-render 12 card offscreen canvases
    const isWeakDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                           (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                           (navigator.connection && navigator.connection.saveData);
      const dpr = isWeakDevice ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const cardCanvases = cards.map((c) => {
      const cv = document.createElement("canvas");
      cv.width = Math.round(CW * dpr * 1.5);
      cv.height = Math.round(CH * dpr * 1.5);
      const img = widgetImages[c.id];
      paintCard(cv, c, family, (img && img.complete && img.naturalWidth > 0) ? img : null);
      return cv;
    });

    // Attempt WebGL2
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    let glState = null;
    if (gl) {
      const sh = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.warn("Shader err:", gl.getShaderInfoLog(s));
          return null;
        }
        return s;
      };
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (vs && fs) {
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, "aPos");
        gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
          gl.enableVertexAttribArray(0);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

          const tex = gl.createTexture();
          const loc = {};
          ["uTex", "uRes", "uUnit", "uPose", "uGlowCol", "uGlowShape", "uBg", "uWarp", "uMix"].forEach((n) => {
            loc[n] = gl.getUniformLocation(prog, n);
          });

          // Upload textures for all 12 cards
          const w = cardCanvases[0].width;
          const h = cardCanvases[0].height;
          gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
          gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, w, h, cardCanvases.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          cardCanvases.forEach((cv, i) => {
            try {
              gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, w, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, cv);
            } catch (err) {
              console.warn("Initial texSubImage3D error for card index", i, err);
            }
          });
          gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
          gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

          glState = { gl, prog, tex, loc, layers: cardCanvases.length, texW: w };
        }
      }
    }

    // Repaint canvases and re-upload textures once images complete
    cards.forEach((card, idx) => {
      const img = widgetImages[card.id];
      const updateTexture = () => {
        const cv = cardCanvases[idx];
        paintCard(cv, card, family, img);
        if (glState) {
          try {
            const { gl, tex } = glState;
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, idx, cv.width, cv.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, cv);
            gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
          } catch (err) {
            console.warn("Could not update WebGL texture for card", card.id, err);
          }
        }
      };

      if (img.complete && img.naturalWidth > 0) {
        updateTexture();
      } else {
        img.onload = updateTexture;
        img.onerror = () => {
          console.warn("Could not load image for widget:", card.id);
        };
      }
    });

    // 2D Fallback Context if WebGL2 unavailable
    const ctx2d = !glState ? canvas.getContext("2d") : null;

    let startTime = performance.now();
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let manualOffset = 0;

    function resize() {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = Math.max(380, rect.height || 480);
      const isWeakDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                           (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                           (navigator.connection && navigator.connection.saveData);
      const dpr = isWeakDevice ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (glState) {
        glState.gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }
    resize();
    window.addEventListener("resize", resize);

    // Pointer Drag Handlers
    canvas.addEventListener("pointerdown", (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartOffset = manualOffset;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      manualOffset = dragStartOffset - dx / 220;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      canvas.style.cursor = "grab";
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    let isInView = true;
    let rafId = null;

    if ('IntersectionObserver' in window) {
      const warpObs = new IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView && !document.hidden) {
          if (!rafId) rafId = requestAnimationFrame(frame);
        } else {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }, { rootMargin: '100px 0px' });
      warpObs.observe(container);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (isInView) {
        if (!rafId) rafId = requestAnimationFrame(frame);
      }
    });

    // Render loop
    function frame(now) {
      if (!isInView || document.hidden) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(frame);
      const elapsedSec = (now - startTime) / 1000;
      const baseProgress = autoplayProgress(elapsedSec, 0, step, interval);
      const currentProgress = baseProgress + manualOffset;

      const w = canvas.width;
      const h = canvas.height;
      if (w <= 0 || h <= 0) return;

      const unit = (w < 600) ? Math.max(0.68, Math.min(w / 480, h / 450)) : Math.min(w / 720, h / 450);

      // Generalized poseSet for N = 12 Kanri Widgets
      const ids = Array.from({ length: N }, (_, c) => {
        let q = ((c - currentProgress + N / 2) % N + N) % N - N / 2;
        return { c, q };
      })
      .sort((a, b) => Math.abs(a.q) - Math.abs(b.q))
      .slice(0, 4);

      const poses = [];
      const glowCols = [];
      const glowShapes = [];

      ids.forEach(({ c, q }) => {
        if (Math.abs(q) > 2.05) {
          poses.push(0, 0, 0, -1);
          glowCols.push(0, 0, 0);
          glowShapes.push(0, 1, 0);
        } else {
          const p = poseAt(q);
          poses.push(p[0], p[1], p[2], c);
          glowCols.push(0, 0, 0);
          glowShapes.push(0, 1, 0);
        }
      });

      if (glState) {
        const { gl, prog, loc } = glState;
        gl.useProgram(prog);
        gl.uniform2f(loc.uRes, w, h);
        gl.uniform1f(loc.uUnit, unit);
        gl.uniform4fv(loc.uPose, new Float32Array([...poses, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1]));
        gl.uniform3fv(loc.uGlowCol, new Float32Array([...glowCols, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        gl.uniform3fv(loc.uGlowShape, new Float32Array([...glowShapes, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]));
        gl.uniform3f(loc.uBg, 0, 0, 0);
        gl.uniform1f(loc.uWarp, warp);
        gl.uniform1f(loc.uMix, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else if (ctx2d) {
        // Fallback 2D rendering
        ctx2d.fillStyle = "#000000";
        ctx2d.fillRect(0, 0, w, h);
        ctx2d.save();
        ctx2d.translate(w / 2, h / 2);
        ids.forEach(({ c, q }) => {
          if (Math.abs(q) > 2.05) return;
          const p = poseAt(q);
          const sc = FOCAL / (FOCAL + p[1]);
          const px = p[0] * sc * unit;
          const py = -p[1] * 0.08 * unit;
          const cv = cardCanvases[c];
          if (cv && sc > 0.3) {
            ctx2d.save();
            ctx2d.translate(px, py);
            ctx2d.scale(sc * unit * 0.9, sc * unit * 0.9);
            ctx2d.drawImage(cv, -CW / 2, -CH / 2, CW, CH);
            ctx2d.restore();
          }
        });
        ctx2d.restore();
      }
    }

    if (isInView && !document.hidden) rafId = requestAnimationFrame(frame);
  }

  // Lazy mount on viewport approach (400px ahead of scroll)
  function init() {
    const el = document.getElementById("warp-carousel-root");
    if (el) {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            initWarpCarousel(el);
          }
        }, { rootMargin: '400px' });
        observer.observe(el);
      } else {
        initWarpCarousel(el);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
