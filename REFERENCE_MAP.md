# Kanri Website Reference Map

Complete audit of all files in `assets/`, `src/`, and root, tracking which HTML pages, stylesheets, scripts, and documents reference them.

## Summary Statistics

- **Total files cataloged**: 88
- **Files with zero code references**: 28

---

## Detailed File Reference Table

| File Path | Code References | Referencing Files |
| :--- | :--- | :--- |
| `.gitignore` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `404.html` | ❌ 0 code refs (2 md refs) | `README.md`, `REPORT.md` |
| `README.md` | ❌ 0 code refs (2 md refs) | `REPORT.md`, `SEO_PLAN.md` |
| `REPORT.md` | ❌ 0 code refs (1 md refs) | `README.md` |
| `SEO_PLAN.md` | ❌ 0 code refs (2 md refs) | `README.md`, `REPORT.md` |
| `assets/backdrops/aurora.html` | ✅ 2 refs | `REPORT.md`, `changelog/index.html`, `releases/index.html` |
| `assets/backdrops/snowy_mountain_road.html` | ❌ 0 code refs (1 md refs) | `REPORT.md` |
| `assets/backdrops/sumi_e_mist.html` | ✅ 2 refs | `REPORT.md`, `changelog/index.html`, `releases/index.html` |
| `assets/css/cinematic-hero.css` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/css/components.css` | ✅ 23 refs | `404.html`, `hero-showcase.html`, `index.html`, `changelog/index.html`, `docs/index.html`, `docs/backup-restore/index.html` (+17 more) |
| `assets/css/docs.css` | ✅ 20 refs | `changelog/index.html`, `docs/index.html`, `docs/backup-restore/index.html`, `docs/budgets-goals/index.html`, `docs/capture-dedupe/index.html`, `docs/getting-started/index.html` (+14 more) |
| `assets/css/feature-motion-graphics.css` | ✅ 1 refs | `index.html` |
| `assets/css/how-it-works.css` | ✅ 1 refs | `index.html` |
| `assets/css/main.css` | ✅ 23 refs | `404.html`, `hero-showcase.html`, `index.html`, `changelog/index.html`, `docs/index.html`, `docs/backup-restore/index.html` (+17 more) |
| `assets/css/presentation.css` | ✅ 1 refs | `index.html` |
| `assets/css/shutter-menu.css` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/css/typography.css` | ✅ 23 refs | `404.html`, `hero-showcase.html`, `index.html`, `changelog/index.html`, `docs/index.html`, `docs/backup-restore/index.html` (+17 more) |
| `assets/fonts/LastoriaBoldRegular.otf` | ✅ 2 refs | `assets/css/typography.css`, `src/components/ui/signature.tsx` |
| `assets/fonts/google_sans_black.ttf` | ✅ 1 refs | `assets/css/typography.css` |
| `assets/fonts/google_sans_bold.ttf` | ✅ 1 refs | `assets/css/typography.css` |
| `assets/fonts/google_sans_extrabold.ttf` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `assets/fonts/google_sans_medium.ttf` | ✅ 1 refs | `assets/css/typography.css` |
| `assets/fonts/google_sans_regular.ttf` | ✅ 1 refs | `assets/css/typography.css` |
| `assets/fonts/google_sans_semibold.ttf` | ✅ 1 refs | `assets/css/typography.css` |
| `assets/fonts/ndot57.otf` | ✅ 2 refs | `REPORT.md`, `assets/css/typography.css`, `docs/widgets/index.html` |
| `assets/fonts/panchang_bold.otf` | ✅ 1 refs | `REPORT.md`, `assets/css/typography.css` |
| `assets/images/kanri_app_icon_dark.png` | ✅ 22 refs | `404.html`, `index.html`, `changelog/index.html`, `docs/index.html`, `docs/backup-restore/index.html`, `docs/budgets-goals/index.html` (+16 more) |
| `assets/images/kanri_playstore_icon_512.png` | ✅ 1 refs | `index.html` |
| `assets/images/screenshots/goals.png` | ✅ 1 refs | `REPORT.md`, `press/index.html` |
| `assets/images/screenshots/home.png` | ✅ 1 refs | `REPORT.md`, `press/index.html` |
| `assets/images/screenshots/insights.png` | ✅ 1 refs | `REPORT.md`, `press/index.html` |
| `assets/images/screenshots/lend-borrow.png` | ✅ 1 refs | `REPORT.md`, `press/index.html` |
| `assets/images/screenshots/profile.png` | ❌ 0 code refs (1 md refs) | `REPORT.md` |
| `assets/images/widgets/widget_preview_budget.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_dues.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_goals.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_heatmap.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_month_delta.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_quick_actions.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_review_inbox.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_safe_to_spend.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_sky.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_streak.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_today.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/images/widgets/widget_preview_wallets.webp` | ✅ 2 refs | `assets/js/warp-carousel.js`, `src/components/ui/warp-carousel.tsx` |
| `assets/js/ScrollTrigger.min.js` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/js/calculators.js` | ✅ 1 refs | `index.html` |
| `assets/js/cinematic-hero.js` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/js/config.js` | ✅ 1 refs | `index.html`, `README.md`, `REPORT.md` |
| `assets/js/feature-motion-graphics.js` | ✅ 1 refs | `index.html` |
| `assets/js/gsap.min.js` | ✅ 3 refs | `hero-showcase.html`, `index.html`, `assets/js/shutter-menu.js` |
| `assets/js/hero.js` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/js/how-it-works.js` | ✅ 1 refs | `index.html` |
| `assets/js/liquid-button.js` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/js/living-bg.js` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/js/main.js` | ✅ 2 refs | `index.html`, `download/index.html` |
| `assets/js/parser-demo.js` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `assets/js/phone-showcase.js` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `assets/js/presentation.js` | ✅ 1 refs | `index.html` |
| `assets/js/releases.js` | ✅ 2 refs | `changelog/index.html`, `releases/index.html` |
| `assets/js/search.js` | ✅ 13 refs | `docs/index.html`, `docs/backup-restore/index.html`, `docs/budgets-goals/index.html`, `docs/capture-dedupe/index.html`, `docs/getting-started/index.html`, `docs/insights-health-score/index.html` (+7 more) |
| `assets/js/shutter-menu.js` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/js/signature.js` | ✅ 1 refs | `index.html` |
| `assets/js/smooth-parallax.js` | ✅ 2 refs | `hero-showcase.html`, `index.html` |
| `assets/js/theme-switcher.js` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `assets/js/theme.js` | ✅ 23 refs | `404.html`, `hero-showcase.html`, `index.html`, `changelog/index.html`, `docs/index.html`, `docs/backup-restore/index.html` (+17 more) |
| `assets/js/warp-carousel.js` | ✅ 1 refs | `index.html` |
| `assets/js/widget-data-uris.js` | ✅ 1 refs | `index.html` |
| `assets/media/kanri_loop.webm` | ❌ 0 code refs (1 md refs) | `REPORT.md` |
| `assets/media/kanri_loop_silent_1440.mp4` | ❌ 0 code refs (1 md refs) | `REPORT.md` |
| `assets/media/poster.png` | ✅ 1 refs | `index.html`, `REPORT.md`, `SEO_PLAN.md` |
| `assets/signature-omkarnub.json` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `assets/signature-omkarnub.svg` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `hero-showcase.html` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `index.html` | ✅ 22 refs | `404.html`, `hero-showcase.html`, `README.md`, `REPORT.md`, `changelog/index.html`, `docs/index.html` (+18 more) |
| `llms.txt` | ❌ 0 code refs (3 md refs) | `README.md`, `REPORT.md`, `SEO_PLAN.md` |
| `robots.txt` | ❌ 0 code refs (3 md refs) | `README.md`, `REPORT.md`, `SEO_PLAN.md` |
| `sitemap.xml` | ✅ 1 refs | `README.md`, `REPORT.md`, `robots.txt`, `SEO_PLAN.md` |
| `src/components/ui/cinematic-hero.tsx` | ❌ 0 code refs (1 md refs) | `README.md` |
| `src/components/ui/component.tsx` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `src/components/ui/index.ts` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `src/components/ui/liquid-button.tsx` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `src/components/ui/parallax.css` | ❌ 0 code refs (1 md refs) | `README.md` |
| `src/components/ui/signature.tsx` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `src/components/ui/stats-counter.tsx` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `src/components/ui/warp-carousel.tsx` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `src/lib/utils.ts` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |
| `take_screenshot.py` | ❌ 0 code refs | *None (Dead / Template / Isolated)* |

## Categories of Unreferenced / Dead Candidates

### 1. Unused Media & Screenshots
- `assets/images/screenshots/profile.png`: 2.4 MB, never referenced in HTML/CSS/JS.
- `assets/media/kanri_loop.webm` & `assets/media/kanri_loop_silent_1440.mp4`: ~10 MB, unreferenced by any page.

### 2. Redundant / Unused Scripts & Data
- `assets/js/widget-data-uris.js`: 125 KB, duplicates 12 `.webp` images already present in `assets/images/widgets/`.
- `assets/js/parser-demo.js`: Standalone copy of parser demo; `main.js` implements the in-page parser demo.
- `assets/js/phone-showcase.js`: Standalone phone showcase script from early iteration; not loaded by any active page.
- `assets/js/theme-switcher.js`: Standalone theme switcher mockup script; `theme.js` powers the site's live theme switching.

### 3. Isolated Showcase Page
- `hero-showcase.html`: Standalone mockup page created during hero prototyping.

### 4. Unused Font Files
- `assets/fonts/google_sans_extrabold.ttf`: 133 KB, never declared in `typography.css` or referenced anywhere.

### 5. Template React Components (`src/`)
- `src/components/ui/*.tsx`, `src/lib/utils.ts`, `src/components/ui/parallax.css`: React / Tailwind / Lenis starter components unused by the vanilla static website.
