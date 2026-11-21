# Kanri Website Suggestions & Architectural Notes

This document catalogs architectural observations, design opportunities, and candidate files deliberately left untouched awaiting project owner review and explicit confirmation.

---

## 1. Candidate Files for Owner Decision

### 1.1 Unused React & Tailwind Starter Files (`src/`)
- **Files:**
  - `src/components/ui/cinematic-hero.tsx` (28.2 KB)
  - `src/components/ui/warp-carousel.tsx` (59.3 KB)
  - `src/components/ui/liquid-button.tsx` (29.6 KB)
  - `src/components/ui/signature.tsx` (5.0 KB)
  - `src/components/ui/stats-counter.tsx` (4.1 KB)
  - `src/components/ui/component.tsx` (3.6 KB)
  - `src/components/ui/parallax.css` (1.8 KB)
  - `src/components/ui/index.ts` (0.2 KB)
  - `src/lib/utils.ts` (0.6 KB)
- **Observation:** The production website is 100% vanilla HTML, CSS, and modern JavaScript with zero build-time framework dependencies. The files in `src/` are React / Framer Motion / Lenis prototypes from early design iterations.
- **Recommendation:** Archive or delete these files from `main` if the site remains a pure static GitHub Pages deployment, preserving the "zero external dependencies" guarantee. Left untouched per non-negotiables pending owner sign-off.

### 1.2 Unreferenced Hero Video Loops (`assets/media/kanri_loop.*`)
- **Files:**
  - `assets/media/kanri_loop.webm` (6.61 MB)
  - `assets/media/kanri_loop_silent_1440.mp4` (3.42 MB)
- **Observation:** Neither video is referenced or requested by any HTML, CSS, or JS file across the repository. Total weight is ~10.0 MB.
- **Recommendation:** Ask the owner whether these are reserved for a planned future video hero or can be removed to reduce repository clone footprint. Left intact pending owner confirmation.

### 1.3 Unreferenced Screenshot (`assets/images/screenshots/profile.png`)
- **File:** `assets/images/screenshots/profile.png` (2.41 MB)
- **Observation:** The press page (`press/index.html`) displays Home, Insights, Lend-Borrow, and Goals screenshots. `profile.png` is not referenced in any markup or style.
- **Recommendation:** If a Profile / Settings press asset is desired, add it to `press/index.html` with responsive WebP variants. Otherwise, archive or remove. Left intact pending owner decision.

### 1.4 Glass Theme Video Backdrop (`assets/backdrops/snowy_mountain_road.html`)
- **File:** `assets/backdrops/snowy_mountain_road.html` (1.20 MB)
- **Observation:** This standalone backdrop iframe contains an embedded base64 video data URL of 1.2 MB.
- **Recommendation:** If retained, extract the base64 string to a standalone compressed `.mp4` / `.webm` file loaded via `<video preload="none">`, reducing the HTML document size from 1.2 MB to under 2 KB.

### 1.5 Hero Showcase Scratchpad (`hero-showcase.html`)
- **File:** `hero-showcase.html` (30.4 KB)
- **Observation:** Created as a prototyping scratchpad during hero development. Unreferenced by sitemap or navigation.
- **Recommendation:** Keep as an isolated internal testbed or move to a `test/` directory.

---

## 2. Design & Feature Suggestions

### 2.1 GitHub Star Reel Threshold
- **Current Behavior:** The header pill features an upward-rolling digit reel showing the repository's 9 stars.
- **Suggestion:** Showing a single digit counter can look modest. Consider displaying the star count only when stars exceed 50 or 100, or linking directly with an icon and "Star on GitHub" until the repository reaches a higher count.

### 2.2 Native Share API for Download Links
- **Suggestion:** On the `/download/` page on mobile devices, adding a 1-tap "Share APK link" button using `navigator.share()` allows users to easily send the official GitHub APK download link to friends or devices via messaging apps without copying URLs.
