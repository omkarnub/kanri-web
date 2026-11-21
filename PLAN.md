# Kanri Website Polish & Optimization Plan

## Baseline State (Pre-Optimization)

- **Network Transfer**:
  - Landing (`/`): Desktop 1,647 KB | Mobile 1,535 KB
  - Download (`/download/`): Desktop 800 KB | Mobile 800 KB
  - Docs (`/docs/`): Desktop 698 KB | Mobile 698 KB
  - FAQ (`/faq/`): Desktop 696 KB | Mobile 696 KB
  - Press (`/press/`): Desktop 9,800 KB | Mobile 9,800 KB (9.2 MB in 4 uncompressed screenshots)
- **Lighthouse Mobile Baseline**:
  - Landing (`/`): Performance **30** | Accessibility **95** | Best Practices **100** | SEO **100** | LCP: 12.9s | TBT: 8,590ms
  - Download (`/download/`): Performance **89** | Accessibility **98** | Best Practices **100** | SEO **100** | CLS: 0.212
  - Docs (`/docs/`): Performance **99** | Accessibility **98** | Best Practices **100** | SEO **100**
  - FAQ (`/faq/`): Performance **100** | Accessibility **100** | Best Practices **100** | SEO **100**
  - Press (`/press/`): Performance **100** | Accessibility **94** | Best Practices **100** | SEO **100**

---

## Group 1: Consistency and Correctness
- **Single Source of Truth**: Consolidate hardcoded release metadata across 66 locations into `assets/js/config.js` and `release.json` (v1.19.8, Build 75, Target SDK 37, SHA-256 `34DF85A3EAD322E65BC46CB2C7AB30F2D8FBD682289CBA24740C05C3E47C7538`, size 27.1 MB).
- **Heading Semantics**: Fix `index.html` to have exactly one `<h1>` (`KANRI` logo), converting cinematic lines ("Track every rupee,", "not your privacy.") to `<h2>` while preserving their exact visual classes and styles. Fix heading order hierarchy across pages.
- **Unified Navigation & Footer**: Ensure all inner pages expose the standard top header with visible Download action, and replace abbreviated "Home · Privacy" footers with the full 8-link footer (Docs, FAQ, Releases, Privacy, Terms, Security, Press, GitHub).
- **Mobile Hero Polish**: Eliminate awkward line wrapping of "OFFLINE FINANCIAL LEDGER" and vertically stacked kanji on narrow viewports; add subtle scrim for WCAG AA hero text contrast over mountain art.
- **No-JS / Noscript**: Ensure core content renders cleanly without JavaScript; add helpful `<noscript>` fallbacks for interactive demos.

## Group 2: Remove AI Slop (Text & Elements)
- **Banned Words Elimination**: Remove or replace banned marketing jargon (`seamless`, `powerful`, `revolutionary`, `next-generation`, `cutting-edge`, `unlock`, `elevate`, `leverage`, `supercharge`, `game-changing`, `robust`, `effortless`, `sovereignty`, `airgap`, `engine`, `HUD`) with plain, concrete language.
- **Buzzword Cleanup**: Replace invented labels (`Optimal Sovereignty`, `Absolute Airgap`, `Hardware TEE Sealed`, `Zero Manual Friction`, `Tactile Glanceability`, `Objective Evaluation`, `60 FPS vector simulation`, `real-time settlement engine`, `Dynamic Analytics HUD`, `GPU-accelerated canvas routines`, `Split Bill Motion Loop`, `Dual Fusion`, `On-Device Phase`).
- **Consumer Translations**: Reframe jargon into plain consumer language ("Safe-to-Spend" explained as daily allowance until payday; "Dual Wallets" as Cash and Bank balances; "Financial Health Score" as Money Health score; "Peer-to-Peer Ledger" as Money owed and borrowed).
- **Decorative Filler Removal**: Remove fake "live" badges, unbacked status chips, and meaningless uppercase badges. Label real GitHub metrics clearly with static fallbacks.
- **Doubt Log**: Record judgment-call items in `SUGGESTIONS.md` and unverified claims in `NEEDS_CONFIRMATION.md`.

## Group 3: Mobile & Desktop Performance Optimization
- **Press Image Compression**: Convert 4 press screenshots (`home.png`, `insights.png`, `goals.png`, `lend-borrow.png`, 9.2 MB total) to modern WebP format at 1x/2x display sizes under 200 KB each.
- **De-duplicate Widget Data**: Drop `widget-data-uris.js` (125 KB render-blocking script); load existing `assets/images/widgets/*.webp` directly and lazily.
- **Extract Signature SVG**: Move 216 KB inlined SVG from `index.html` to external SVG loaded lazily via fetch/img without layout shift.
- **Image Attributes & Preloading**: Add explicit `width`, `height`, `loading="lazy"`, `decoding="async"` across images; `fetchpriority="high"` on hero mountain art. Preload only above-the-fold brand/interface fonts with `font-display: swap`.
- **Local Share Image**: Replace external GitHub raw URL in `og:image` and `twitter:image` with local self-hosted `assets/media/poster.png` (1200x630).
- **Execution Efficiency**: Pause canvas and RAF loops when offscreen or when tab is hidden using `IntersectionObserver` and `visibilitychange`. Add weak-device throttling (`deviceMemory`, `hardwareConcurrency`, `prefers-reduced-data`).

## Group 4: Ultra Smooth Animations & Transitions
- **Motion Tokens**: Define global CSS transitions (`--duration-fast: 120ms`, `--duration-base: 200ms`, `--duration-smooth: 320ms`, `--ease-out`, `--ease-in-out`).
- **Theme Transitions**: Add smooth color and background fading on theme switch without theme flashing on load.
- **Pinned Hero Spacing**: Fix the 900px dead dark stretch after the hero tagline; ensure no empty gap exceeds 120px at any viewport width. Fix mobile phone carousel black box.
- **Component Motion**: Smooth out shutter menu, accordion drawers, calculators, tabs, and copy-to-clipboard interactions. Implement View Transitions API for page transitions.
- **Accessibility & Reduced Motion**: Full `prefers-reduced-motion` compliance across living background, cinematic hero, warp carousel, and steppers.

## Group 5: Dead Code Verification & Repository Cleanup
- **Candidate Verification**: Cross-verify unused candidates (`google_sans_extrabold.ttf`, `profile.png`, `kanri_loop.*`, `src/` React templates, standalone mockup scripts) using codebase references and git history.
- **Documentation Overhaul**: Rewrite `REPORT.md`, `SEO_PLAN.md`, and `README.md` to be plain, factual, and accurate, removing references to non-existent `website/` folders.
- **Deliverables**: Maintain `CLEANUP_LOG.md`, `SUGGESTIONS.md`, and `NEEDS_CONFIRMATION.md`.

## Group 6: SEO, Verification & Guardrails in CI
- **Metadata**: Unique titles (<60 chars) and descriptions (<160 chars) tailored to offline personal finance keywords.
- **JSON-LD**: Validate `SoftwareApplication`, `FAQPage`, and `BreadcrumbList`.
- **Sitemap & Robots**: Regenerate `sitemap.xml`, ensure `robots.txt` points to it, and update `llms.txt` with factual statements only.
- **CI Guardrails**: Add GitHub Actions workflow check verifying no broken internal links, all images have alt attributes, exactly one h1 per page, zero non-self requests, no images over 300 KB, and zero banned slop words.

## Group 7: Final Verification & Reporting
- Re-run full screenshot suite at 1440px and 390px.
- Re-run network transfer measurements and Lighthouse mobile audits.
- Complete acceptance checklist and compile `CHANGES.md` and final summary.
