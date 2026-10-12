/* Keep the theme control working independently of the theme's CDN dependencies. */
(() => {
  const button = document.getElementById('mode-toggle');
  if (!button) return;
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const validMode = (mode) => mode === 'light' || mode === 'dark';

  try {
    const saved = sessionStorage.getItem('mode');
    if (validMode(saved)) root.setAttribute('data-mode', saved);
  } catch {
    // Switching still works when browser storage is disabled.
  }

  function updateLabel() {
    const mode = root.getAttribute('data-mode');
    const dark = validMode(mode) ? mode === 'dark' : systemTheme.matches;
    const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    return dark;
  }

  // Handle this control before the bundled handler, preventing a double toggle
  // when the theme bundle also loads successfully.
  document.addEventListener('click', (event) => {
    if (!button.contains(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const mode = updateLabel() ? 'light' : 'dark';
    root.setAttribute('data-mode', mode);
    try {
      sessionStorage.setItem('mode', mode);
    } catch {
      // The current page can still change theme without persisting the choice.
    }
    updateLabel();
    window.postMessage({ id: 'theme-mode' }, '*');
  }, true);

  systemTheme.addEventListener('change', updateLabel);
  window.addEventListener('message', (event) => {
    if (event.source === window && event.data?.id === 'theme-mode') updateLabel();
  });
  updateLabel();
})();
