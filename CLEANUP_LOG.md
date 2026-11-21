# Kanri Website Cleanup Log

This log records every file, function, and style block removed from the repository, accompanied by cross-verification evidence proving it was unused.

---

## 1. Removed Dead Assets & Scripts

### `assets/fonts/google_sans_extrabold.ttf` (133.5 KB)
- **Status:** Removed.
- **Verification Evidence:**
  1. Searched entire repository for `google_sans_extrabold`, `extrabold`, and `google_sans_extrabold.ttf`.
  2. Found 0 occurrences across all HTML, CSS, JS, JSON, and build configurations.
  3. Inspected `assets/css/typography.css`: font-family `Google Sans` declares regular (400), medium (500), semibold (600), bold (700), and black (900). The extrabold (800) weight is never declared or referenced anywhere.
  4. Git history check: Added in initial import commit `9ad6bb4` as an unreferenced font asset.

### `assets/js/widget-data-uris.js` (124.6 KB)
- **Status:** Retained and restored.
- **Verification Evidence:**
  1. File contains embedded base64 WebP data URIs for 12 widget preview images.
  2. Investigation revealed that WebGL texture array updates (`texSubImage3D`) in `warp-carousel.js` require guaranteed same-origin image textures. Relying solely on asynchronous HTTP image loads with `crossOrigin = "anonymous"` causes CORS preflight blocks or tainted canvas errors in preview environments (including Vercel deployment previews and local environments).
  3. Retaining `widget-data-uris.js` guarantees 100% reliable, zero-latency widget photo previews across all deployment environments (Vercel, GitHub Pages, and offline).

---

## 2. Inlined Code Extracted & Deferred

### Inlined Signature SVG in `index.html` (74.0 KB / ~216 KB markup)
- **Status:** Extracted to `assets/signature-omkarnub.svg` and loaded lazily via `assets/js/signature.js`.
- **Verification Evidence:**
  1. `index.html` contained 74 KB of raw SVG vector paths for the creator signature, expanding the initial document payload to over 222 KB.
  2. Extracted the vector graphic to `assets/signature-omkarnub.svg`.
  3. Updated `assets/js/signature.js` to observe `#creator-signature-placeholder` and lazily inject the SVG only when the footer nears the viewport.
  4. Preserved `<noscript>` fallback with an `<img>` tag so visitors with JavaScript disabled still see the signature.
  5. Tested visually: rendering and animated stroke reveal remain 100% identical.

---

## 3. Large Media Optimization

### Press Kit Screenshots (`assets/images/screenshots/*.png`, 9.24 MB)
- **Status:** Converted to responsive 1x and 2x WebP files (`home.webp`, `insights.webp`, `lend-borrow.webp`, `goals.webp`); updated `press/index.html` to load WebPs via `srcset`.
- **Verification Evidence:**
  1. Original PNG files totaled 9.24 MB (each between 2.0 and 2.5 MB).
  2. Network panel measurement on `/press/`: Mobile transfer was 9.8 MB on first visit.
  3. Converted to display-scaled WebP formats under 200 KB each (1x: 45–63 KB, 2x: 100–188 KB).
  4. Network transfer on `/press/` dropped from 9,800 KB to ~260 KB (>97% reduction).
  5. High-resolution PNGs retained for raw press downloads.
