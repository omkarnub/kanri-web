# Kanri Official Website

Official website for **Kanri**, an offline-first personal finance app for Android.

Hosted at: [https://getkanri.vercel.app/](https://getkanri.vercel.app/)

---

## Architecture & Principles

- **Zero External Dependencies:** No external tracking scripts, no CDN font requests, no third-party cookies, and no analytics pixels. All fonts, styles, scripts, and media are self-hosted locally in `assets/`. The only permitted network request is the optional GitHub release lookup, which fails gracefully to static defaults.
- **Progressive Enhancement:** Fully readable and functional with JavaScript disabled. Plain modern JavaScript powers the client-side parser demo, calculators, theme switcher, and instant search.
- **Static Hosting:** Pure static files ready for GitHub Pages, Cloudflare Pages, Netlify, Nginx, or Apache.

---

## Local Previewing

Run any static file server from the repository root:

### Python 3:
```bash
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.

### Node.js:
```bash
npx serve .
```

---

## Directory Structure

```
.
├── index.html                  # Landing page
├── download/index.html         # Official download page with SHA-256 verification
├── docs/                       # Documentation hub (11 chapters)
│   ├── getting-started/
│   ├── capture-dedupe/
│   ├── wallets/
│   ├── lend-borrow/
│   ├── budgets-goals/
│   ├── insights-health-score/
│   ├── widgets/
│   ├── themes/
│   ├── backup-restore/
│   ├── security-model/
│   └── troubleshooting/
├── faq/index.html              # Searchable FAQ accordion
├── privacy/index.html          # Privacy policy
├── security/index.html         # Security model & vulnerability reporting
├── terms/index.html            # Plain-language terms of use
├── changelog/index.html        # Release changelog (v1.19.8 down to v1.19.0)
├── press/index.html            # Press kit & brand assets (with responsive WebPs)
├── 404.html                    # 404 error page
├── sitemap.xml                 # XML sitemap
├── robots.txt                  # Search crawler directives
├── llms.txt                    # Plain text summary for search engines
├── release.json                # Static fallback metadata for latest release (v1.19.8)
├── assets/
│   ├── css/                    # Stylesheets (main, typography, components, docs)
│   ├── js/                     # Scripts (config, theme, parser demo, calculators, search)
│   ├── fonts/                  # Self-hosted fonts (Panchang Bold, Google Sans, Ndot57)
│   ├── images/                 # App icons, screenshots, widget previews
│   ├── media/                  # Video loops, poster, social share image (1200x630)
│   └── backdrops/              # Animated canvas artwork for themes
└── .github/workflows/          # GitHub Actions deployment & validation workflow
```

---

## Configuration

Edit `assets/js/config.js` to update:
- `CONTACT_EMAIL`: Set your official contact email when domain email is configured.
- `PLAY_STORE_URL`: Set the Play Store URL if the app is published to Google Play.
- `VERSION`, `APK_SIZE`, `APK_SHA256`: Updated for new releases (mirrored in `release.json`).

---

## License

This website and its documentation are open-source under the [GPL-3.0 License](https://github.com/omkarnub/Kanri/blob/main/LICENSE).
