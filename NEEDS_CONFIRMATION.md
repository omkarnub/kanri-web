# Items Needing Owner Confirmation (NEEDS_CONFIRMATION.md)

This document lists items, claims, and candidate files across the Kanri website and repository that require confirmation or decisions from the project owner (@omkarnub). In keeping with our strict principle of "never invent facts", these items have been left unchanged or set to safe defaults pending verification.

---

## 1. Domain & Contact Information

### 1.1 Support Email (`support@kanri.app`)
- **Location:** `assets/js/config.js`, `privacy/index.html`, `security/index.html`
- **Context:** Previous documentation referenced `support@kanri.app`. However, domain MX record status and mailbox activity could not be verified from the repository.
- **Current Default:** `CONTACT_EMAIL` in `assets/js/config.js` is set to `null`. User support and bug reports across the site link directly to official GitHub Issues (`https://github.com/omkarnub/Kanri/issues`).
- **Question for Owner:** Is `support@kanri.app` an active mailbox you monitor? If yes, should we activate it in `config.js`? If no, should we continue routing all communications through GitHub Issues?

---

## 2. App Distribution Channels

### 2.1 Google Play Store Listing
- **Location:** `assets/js/config.js`, `download/index.html`
- **Context:** The app is currently distributed via GitHub Releases and Orion Store. No live Google Play Store listing was found.
- **Current Default:** `PLAY_STORE_URL` in `assets/js/config.js` is set to `null`. Google Play badges are omitted from the download page to avoid dead links.
- **Question for Owner:** Is a Google Play Store listing planned or pending review? If so, what will the package listing URL be once approved?

### 2.2 Orion Store URL & Status
- **Location:** `download/index.html`, `assets/js/config.js`
- **Context:** Orion Store is referenced as an alternative community download channel.
- **Question for Owner:** Is the Orion Store repository listing actively updated for each release (v1.19.8+), or should GitHub Releases be presented as the primary direct channel?

---

## 3. Large Assets & Candidate Files for Repository Pruning

### 3.1 Unreferenced Motion Loop Videos (`assets/media/kanri_loop.*`)
- **Files:**
  - `assets/media/kanri_loop.webm` (6.61 MB)
  - `assets/media/kanri_loop_silent_1440.mp4` (3.42 MB)
- **Context:** Totaling ~10.0 MB, neither video is referenced by any HTML, CSS, or JavaScript file across the site. The landing page hero currently uses the interactive 3D CSS/JS phone mockup rather than video playback.
- **Question for Owner:** Were these videos created for a planned future video hero, or can they be safely removed from the repository to reduce clone size?

### 3.2 Unreferenced Profile Screenshot (`assets/images/screenshots/profile.png`)
- **File:** `assets/images/screenshots/profile.png` (2.41 MB)
- **Context:** The press kit (`press/index.html`) displays four screenshots: Home, Insights, Lend-Borrow, and Goals (now optimized as responsive WebPs). `profile.png` is not currently displayed on any page.
- **Question for Owner:** Should the Profile / Settings screenshot be added to the press kit gallery, or should it be deleted from the repository?

### 3.3 Prototype React / Tailwind Files (`src/`)
- **Directory:** `src/components/ui/` (8 files, ~130 KB)
- **Context:** The production website is 100% vanilla HTML, CSS, and modern JavaScript with zero build dependencies. The files in `src/` are React / Framer Motion / Lenis prototypes from early design iterations.
- **Question for Owner:** Can the `src/` directory be safely deleted from `main`, or do you prefer to keep it in a separate branch for component prototyping?

### 3.4 Glass Theme Video Backdrop (`assets/backdrops/snowy_mountain_road.html`)
- **File:** `assets/backdrops/snowy_mountain_road.html` (1.20 MB)
- **Context:** This backdrop contains an embedded base64 video string of ~1.2 MB. It is loaded only when the user selects the "Glass" theme.
- **Question for Owner:** Would you prefer extracting the base64 string into a standalone compressed `.mp4` file loaded on-demand, reducing the HTML file size from 1.2 MB to under 2 KB?

---

## 4. GitHub Release API & Star Reel

### 4.1 Star Counter Display
- **Location:** Header badge (`index.html`)
- **Context:** The repository currently has 9 stars. The counter uses an animated digit reel.
- **Question for Owner:** Would you prefer hiding the single-digit star reel until the repository reaches a milestone (e.g. 50 or 100 stars), showing just a clean "Star on GitHub" link in the meantime?
