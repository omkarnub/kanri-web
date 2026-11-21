# Kanri Website Implementation & Verification Report

**Date:** November 22, 2026  
**Audited Repository:** `https://github.com/omkarnub/Kanri`  
**Package:** `com.omkarnub.kanri` (v1.19.8, Build 75)

---

## 1. Pages & Endpoints

### Main Pages
1. **`index.html`** (`/`): Landing page featuring the sumi-e mountain hero, interactive on-device parser demo, feature showcases with phone mockups, bill splitter and daily allowance calculators, money health score simulator (0–100), 12 Pixel DotTiles widgets gallery, 5-theme switcher (Light, Dark, AMOLED, Glass, and animated backdrops), permissions table, comparison table, supported banks list, download verification box with copy commands, FAQ accordion, and open-source footer.
2. **`privacy/index.html`** (`/privacy`): Plain-language privacy policy matching the real codebase: permissions breakdown, Google Drive `drive.file` scope explanation, and GitHub Issues contact.
3. **`terms/index.html`** (`/terms`): Plain-language terms of use: GPL-3.0 software provided as-is, non-custodial user backup responsibility, not financial advice, and trademark disclaimer.
4. **`download/index.html`** (`/download`): Dedicated download page featuring release APK links, verified SHA-256 hash, terminal verification commands, and Android 13+ "Allow restricted settings" step-by-step guide.
5. **`faq/index.html`** (`/faq`): Searchable FAQ accordion covering offline mechanics, OTP rejection, supported banks, cash and ATM handling, sideloading restricted settings, backups, and encryption.
6. **`security/index.html`** (`/security`): Complete security architecture, cryptographic specifications (SQLCipher AES-256, Android Keystore, PBKDF2/AES-GCM), zero-telemetry threat model, and GitHub Security Advisories reporting policy.
7. **`press/index.html`** (`/press`): Press kit: concise company summary, downloadable dark/light logotypes, color tokens, typography rules, 4 device screenshots in responsive WebP formats, and brand usage constraints.
8. **`changelog/index.html`** (`/changelog`): Chronological release changelog from v1.19.8 down to v1.19.0 with verified build numbers and checksums.
9. **`404.html`** (`/404`): On-brand 404 page featuring dot-matrix typography and navigation links back home.

### Documentation Hub (`/docs`)
10. **`docs/index.html`**: Hub overview with interactive client-side search and chapter grid.
11. **`docs/getting-started/index.html`**: Chapter 1 — APK download, SHA-256 verification, Android 13+ restricted settings, and onboarding.
12. **`docs/capture-dedupe/index.html`**: Chapter 2 — Priority 999 SMS receiver, Notification Listener scoping, 5-minute sliding window deduplication, and OTP filtering.
13. **`docs/wallets/index.html`**: Chapter 3 — Cash vs. Bank balances, ATM withdrawal modes, and Indian lakh/crore numbering.
14. **`docs/lend-borrow/index.html`**: Chapter 4 — Money owed and borrowed, partial repayment records, one-tap WhatsApp reminders, UPI payment links, and bill splitting (2–20 people).
15. **`docs/budgets-goals/index.html`**: Chapter 5 — Custom budget cycles (1–28), dynamic daily allowance calculation, savings goals pacing, and quick steppers.
16. **`docs/insights-health-score/index.html`**: Chapter 6 — Spending charts, heatmaps, burn-rate projections, and the 4-pillar 0–100 money health score.
17. **`docs/widgets/index.html`**: Chapter 7 — The 12 Pixel DotTiles widgets, Ndot57 font, shared Canvas rendering, and midnight resets.
18. **`docs/themes/index.html`**: Chapter 8 — 5 visual themes, animated backdrops, AGSL GPU shaders, and launcher icons.
19. **`docs/backup-restore/index.html`**: Chapter 9 — Encrypted backups (PBKDF2 with 65,536 iterations + AES-GCM), Google Drive sync, and CSV/JSON/PDF exports.
20. **`docs/security-model/index.html`**: Chapter 10 — SQLCipher AES-256, Android Keystore hardware protection, and threat model.
21. **`docs/troubleshooting/index.html`**: Chapter 11 — Resolving aggressive OEM battery killers (MIUI/HyperOS, OxygenOS/ColorOS, One UI), watchdog rebinds, and permissions.

---

## 2. Claims & Assets Verification Audit

### A. Google Drive Backup Status
- **Code Audit:** In `AndroidManifest.xml`, `android.permission.INTERNET` and `ACCESS_NETWORK_STATE` are present. In `CloudBackupManager.kt` and `GoogleDriveService.kt`, Google Drive backup is implemented using the restricted `drive.file` scope and Google Drive REST API v3.
- **Verification:** The website copy honestly describes Kanri as **"on-device ledger with optional client-side encrypted Google Drive backup"**, avoiding inaccurate claims of having zero internet permission.

### B. Contact Information
- **Code Audit:** `support@kanri.app` is mentioned in older documentation, but mailbox activity is unverified.
- **Verification:** `CONTACT_EMAIL` in `assets/js/config.js` is set to `null`. All support and issue tracking links point directly to GitHub Issues (`https://github.com/omkarnub/Kanri/issues`).

### C. Play Store Status
- **Code Audit:** No live Google Play Store listing exists. The app is distributed via GitHub Releases and Orion Store.
- **Verification:** `PLAY_STORE_URL` is set to `null` in `assets/js/config.js`. Google Play Store badges are omitted across the site. The download section provides direct APK downloads, verified SHA-256 checksums, and Orion Store links.

---

## 3. Assets, Screenshots & Fonts Used

| Required Asset | Audited Source in Repo | Website Implementation |
| :--- | :--- | :--- |
| **Logotype Font** | `app/src/main/res/font/panchang_bold.otf` | Self-hosted in `assets/fonts/panchang_bold.otf`. Zero Google Fonts/external CDN calls. |
| **Interface Font** | `app/src/main/res/font/google_sans_*.ttf` | Self-hosted in `assets/fonts/google_sans_*.ttf`. |
| **Widget Font** | `app/src/main/res/font/ndot57.otf` | Self-hosted in `assets/fonts/ndot57.otf` for authentic dot-matrix numerals. |
| **App Screenshots** | `docs/screenshots/` | Optimized responsive WebP formats in `assets/images/screenshots/` (`home.webp`, `insights.webp`, `lend-borrow.webp`, `goals.webp`). Raw PNGs preserved for press downloads. |
| **Widget Previews** | `app/src/main/res/drawable-nodpi/` | 12 real WebP dot-matrix widget renders in `assets/images/widgets/widget_preview_*.webp`. |
| **Animated Backdrops** | `app/src/main/assets/backgrounds/` | Artwork files (`sumi_e_mist.html`, `aurora.html`, `snowy_mountain_road.html`) in `assets/backdrops/` for live theme switcher previewing. |

---

## 4. Verification Check

1. **Version:** `app/build.gradle.kts` specifies `versionName = "1.19.8"` and `versionCode = 75`. The release APK on disk is `Kanri-v1.19.8-release.apk` with size `28,418,025` bytes (27.1 MB) and SHA-256 hash `34DF85A3EAD322E65BC46CB2C7AB30F2D8FBD682289CBA24740C05C3E47C7538`.
2. **Release Metadata:** All download links, hashes, and size indicators match `release.json` and the official GitHub release.
