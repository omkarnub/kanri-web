/**
 * Kanri Theme Controller
 * Whole site below hero is dark themed permanently (Dark Ink or AMOLED).
 * Hero Shan Shui painting stays isolated in authentic light mode.
 */
(function() {
  const STORAGE_KEY = 'kanri_theme_preference';
  
  function getSystemPreference() {
    return 'dark';
  }
  
  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'amoled') return 'amoled';
      return 'dark';
    } catch (e) {
      return 'dark';
    }
  }
  
  function applyTheme(theme) {
    const active = (theme === 'amoled') ? 'amoled' : 'dark';
    document.documentElement.setAttribute('data-theme', active);
    
    // Update active button indicator if present
    document.querySelectorAll('[data-theme-value]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-value') === active);
    });
  }
  
  // Initialize dark theme immediately
  const initialTheme = getSavedTheme();
  applyTheme(initialTheme);
  
  // Public theme toggler (Dark / AMOLED)
  window.KanriTheme = {
    set: function(theme) {
      const target = (theme === 'amoled') ? 'amoled' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, target);
      } catch (e) {}
      applyTheme(target);
    },
    cycle: function() {
      const current = getSavedTheme();
      const next = current === 'amoled' ? 'dark' : 'amoled';
      this.set(next);
      return next;
    },
    get: getSavedTheme
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const next = window.KanriTheme.cycle();
        toggleBtn.setAttribute('title', `Theme: ${next}`);
      });
    }
  });
})();
