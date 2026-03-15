(function defineCodexPwaConfig(root, factory) {
  const exportsObject = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObject;
  }

  root.CodexPWAConfig = exportsObject;
})(typeof globalThis !== 'undefined' ? globalThis : self, function buildPwaConfig() {
  const CACHE_NAME = 'codex-shell-v1';
  const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './app.js',
    './domain.js',
    './state.js',
    './manifest.webmanifest',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
  ];

  return {
    CACHE_NAME,
    APP_SHELL_ASSETS,
  };
});
