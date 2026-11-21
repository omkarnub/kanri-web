# Kanri Search Engine Optimization (SEO) & Discoverability Plan

This document outlines the keyword architecture, on-page optimization, and indexing checklist for the Kanri website.

---

## 1. Keyword Mapping Matrix

| Page URL | Primary Target Keyword | Secondary Keywords | Search Intent |
| :--- | :--- | :--- | :--- |
| **`/` (Home)** | `offline expense tracker android` | `UPI expense tracker no cloud`, `SMS expense tracker India`, `private budget app Android` | Informational / Download |
| **`/download/`** | `kanri apk download` | `download offline expense tracker apk`, `kanri android release` | Navigational / Download |
| **`/docs/`** | `kanri documentation` | `offline expense tracker architecture`, `how kanri works` | Informational |
| **`/docs/capture-dedupe/`** | `auto expense tracker SMS India` | `UPI notification reader android`, `sms deduplication expense tracker` | Technical / Informational |
| **`/docs/wallets/`** | `cash and bank expense tracker` | `ATM withdrawal transfer expense tracker`, `dual wallet budgeting android` | Informational |
| **`/docs/lend-borrow/`** | `lend and borrow tracker android` | `split bills upi link`, `whatsapp payment reminder generator` | Feature-Specific |
| **`/docs/budgets-goals/`** | `salary cycle budget app` | `safe to spend daily allowance calculator`, `payday budget tracker android` | Feature-Specific |
| **`/docs/widgets/`** | `dot matrix widgets android` | `pixel dottiles widgets`, `home screen expense widgets android` | Feature-Specific |
| **`/docs/security-model/`** | `sqlcipher expense tracker` | `encrypted budget app android`, `offline finance privacy keystore` | High-Trust Research |
| **`/privacy/`** | `kanri privacy policy` | `android expense tracker no analytics`, `drive.file scope expense backup` | Compliance & Trust |
| **`/faq/`** | `is kanri safe` | `does kanri read otp`, `which banks work with kanri` | Reassurance & FAQ |

---

## 2. Repo-Side Metadata Checklist

1. **Repository "About" Description:**
   - Suggested text:
     > *Offline-first personal finance ledger for Android. Parses Indian bank SMS and UPI notifications on your phone with zero ads, zero analytics, and local encryption.*
2. **Repository Website Link:**
   - Link: `https://getkanri.vercel.app/`
3. **Repository Topics (Tags):**
   - Recommended tags: `android`, `expense-tracker`, `kotlin`, `jetpack-compose`, `privacy`, `offline-first`, `upi`, `finance`, `sqlcipher`, `material-design-3`, `open-source`, `gplv3`
4. **Social Preview Image:**
   - Use `assets/media/og-share.png` (1200x630) as the custom Open Graph social preview under *Settings > General > Social preview*.

---

## 3. Search Engine Indexing & Launch Checklist

- [ ] **Google Search Console Setup:**
  - Verify property for `https://getkanri.vercel.app/` using the HTML verification meta tag.
  - Submit sitemap: `https://getkanri.vercel.app/sitemap.xml`.
  - Request indexing for `/` and `/download/`.
- [ ] **Bing Webmaster Tools:**
  - Import verified property from Google Search Console.
  - Submit sitemap.
- [ ] **robots.txt & sitemap.xml Verification:**
  - Verify `robots.txt` returns HTTP 200 and points to `sitemap.xml`.
  - Ensure all internal URLs are absolute, canonical, and end with trailing slashes.
- [ ] **Structured Data Testing:**
  - Validate `SoftwareApplication`, `FAQPage`, and `BreadcrumbList` JSON-LD schemas.
- [ ] **Factual LLM Manifest (`llms.txt`):**
  - Verify `https://getkanri.vercel.app/llms.txt` is accessible for AI search scrapers.
- [ ] **Directories:**
  - Submit to open-source software directories: F-Droid / IzzyOnDroid (if applicable), AlternativeTo (tagged: "Offline", "Open Source", "No Accounts").
