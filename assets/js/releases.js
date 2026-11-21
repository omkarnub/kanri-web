/**
 * Kanri Dynamic Releases Engine
 * Automatically fetches the latest official releases from GitHub API (omkarnub/Kanri).
 * Whenever a new release or APK update is pushed on GitHub, it automatically renders
 * the new release with its direct Download APK button, file size, and release notes.
 *
 * 100% Self-Hosted, Zero External CDNs, with LocalStorage caching & offline resilience.
 */
(() => {
  'use strict';

  const REPO_OWNER = 'omkarnub';
  const REPO_NAME = 'Kanri';
  const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`;
  const CACHE_KEY = 'kanri_releases_cache';
  const CACHE_TIME_KEY = 'kanri_releases_timestamp';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL to respect GitHub rate limits

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('releases-container');
    const syncStatusEl = document.getElementById('releases-sync-status');
    if (!container) return;

    function formatBytes(bytes) {
      if (!bytes || isNaN(bytes)) return '';
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(1)} MB`;
    }

    function formatDate(isoString) {
      if (!isoString) return '';
      try {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (e) {
        return isoString;
      }
    }

    function parseMarkdownToHTML(markdown) {
      if (!markdown) return '';
      const lines = markdown.split('\n');
      let html = '';
      let inList = false;

      for (let rawLine of lines) {
        let line = rawLine.trim();

        // Skip main release title lines like '## What's Changed...'
        if (/^##\s+/i.test(line)) {
          continue;
        }

        // Headings ###
        if (/^###\s+/i.test(line)) {
          if (inList) {
            html += '</ul>';
            inList = false;
          }
          const text = line.replace(/^###\s+/, '');
          html += `<h4 style="font-size:1rem; margin-top:14px; margin-bottom:8px; color:var(--text);">${escapeHTML(text)}</h4>`;
          continue;
        }

        // List items (- or *)
        if (/^[-*]\s+/.test(line)) {
          if (!inList) {
            html += '<ul style="color:var(--text-secondary); font-size:0.9375rem; line-height:1.7; margin-left:20px; margin-bottom:20px;">';
            inList = true;
          }
          let itemText = line.replace(/^[-*]\s+/, '');
          // Bold **text**
          itemText = itemText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          // Inline `code`
          itemText = itemText.replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono); font-size:0.85em; background:rgba(255,255,255,0.06); padding:2px 5px; border-radius:4px;">$1</code>');
          html += `<li>${itemText}</li>`;
          continue;
        }

        // Paragraphs or empty lines
        if (inList) {
          html += '</ul>';
          inList = false;
        }

        if (line.length > 0 && !line.startsWith('---')) {
          let pText = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          pText = pText.replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono); font-size:0.85em; background:rgba(255,255,255,0.06); padding:2px 5px; border-radius:4px;">$1</code>');
          html += `<p style="color:var(--text-secondary); font-size:0.9375rem; line-height:1.7; margin-bottom:12px;">${pText}</p>`;
        }
      }

      if (inList) {
        html += '</ul>';
      }

      return html;
    }

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    }

    function updateSyncStatus(msg, isLive = true) {
      if (!syncStatusEl) return;
      syncStatusEl.innerHTML = `
        <span class="live-dot" style="display:inline-block; width:7px; height:7px; border-radius:999px; background:${isLive ? '#FAF9F5' : '#73726E'}; margin-right:6px; box-shadow:${isLive ? '0 0 8px #FAF9F5' : 'none'};"></span>
        <span>${msg}</span>
      `;
    }

    function syncReleases(releases) {
      if (!Array.isArray(releases) || releases.length === 0) return;

      // Keep track of existing release cards in DOM
      const existingCards = container.querySelectorAll('[data-release-tag]');
      const existingTags = new Set();
      existingCards.forEach(card => {
        existingTags.add(card.getAttribute('data-release-tag').toLowerCase());
      });

      let insertedCount = 0;
      let isFirst = true;

      releases.forEach((rel) => {
        const tag = rel.tag_name || '';
        const lowerTag = tag.toLowerCase();

        // Find APK asset
        const apkAsset = Array.isArray(rel.assets)
          ? rel.assets.find(a => a.name && a.name.toLowerCase().endsWith('.apk'))
          : null;

        const downloadUrl = apkAsset ? apkAsset.browser_download_url : `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${tag}/Kanri-${tag}-release.apk`;
        const sizeText = apkAsset && apkAsset.size ? ` (${formatBytes(apkAsset.size)})` : '';
        const releaseNotesUrl = rel.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${tag}`;
        const pubDate = formatDate(rel.published_at);

        // If card already exists in DOM, ensure its download button and URLs are up-to-date
        if (existingTags.has(lowerTag)) {
          const card = container.querySelector(`[data-release-tag="${tag}"]`) || container.querySelector(`[data-release-tag="${lowerTag}"]`);
          if (card) {
            const dlBtn = card.querySelector('.release-download-btn');
            if (dlBtn && apkAsset && apkAsset.browser_download_url) {
              dlBtn.href = apkAsset.browser_download_url;
              if (apkAsset.size && !dlBtn.textContent.includes('MB')) {
                dlBtn.innerHTML = `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right:6px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Download APK${sizeText}</span>
                `;
              }
            }
          }
        } else {
          // NEW RELEASE DETECTED ON GITHUB THAT IS NOT IN STATIC HTML!
          // Dynamically create and inject the release card at the top
          const card = document.createElement('div');
          card.className = 'card release-card';
          card.setAttribute('data-release-tag', tag);
          card.style.marginBottom = '32px';

          const contentHtml = parseMarkdownToHTML(rel.body);

          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
              <div>
                ${isFirst ? '<span class="badge badge-accent" style="margin-right:8px;">Latest Release</span>' : ''}
                <strong style="font-size:1.5rem; color:var(--text); font-family:var(--font-sans);">${escapeHTML(tag)}</strong>
                <span class="text-mono" style="font-size:0.875rem; color:var(--muted); margin-left:8px;">${escapeHTML(rel.name || '')}</span>
              </div>
              <span style="font-size:0.875rem; color:var(--muted); font-family:var(--font-sans);">${pubDate}</span>
            </div>

            <div class="release-body" style="margin-bottom:20px;">
              ${contentHtml || '<p style="color:var(--text-secondary); font-size:0.9375rem;">Official Kanri Android Release.</p>'}
            </div>

            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <a href="${downloadUrl}" class="btn btn-primary btn-sm release-download-btn" style="display:inline-flex; align-items:center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right:6px;">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download APK${sizeText}</span>
              </a>
              <a href="${releaseNotesUrl}" class="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">
                GitHub Release Notes →
              </a>
            </div>
          `;

          // If this is the newest release, insert at the beginning
          if (insertedCount === 0) {
            // Remove previous "Latest Release" badge from older cards
            const oldBadges = container.querySelectorAll('.badge-accent');
            oldBadges.forEach(b => b.remove());
            container.insertBefore(card, container.firstChild);
          } else {
            container.appendChild(card);
          }

          insertedCount++;
        }

        isFirst = false;
      });

      const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      updateSyncStatus(`Live Sync: Synced with GitHub at ${now}`, true);
    }

    // 1. Try reading from cache first for instant load
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const isCacheFresh = cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_TTL_MS);

    if (cachedData) {
      try {
        const releases = JSON.parse(cachedData);
        syncReleases(releases);
      } catch (e) {
        console.warn('Failed parsing cached releases:', e);
      }
    }

    // 2. Fetch fresh releases from GitHub API if cache is stale or missing
    if (!isCacheFresh) {
      updateSyncStatus('Checking GitHub for new updates...', true);
      fetch(API_URL)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(releases => {
          if (Array.isArray(releases)) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(releases));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
            syncReleases(releases);
          }
        })
        .catch(err => {
          console.warn('GitHub Releases API fetch failed, keeping fallback:', err);
          updateSyncStatus('Displaying verified release archive', false);
        });
    }
  });
})();
