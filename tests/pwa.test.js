const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { APP_SHELL_ASSETS, CACHE_NAME } = require('../pwa-config.js');

const projectRoot = path.resolve(__dirname, '..');

test('manifest declares standalone install metadata and icons', () => {
  const manifestPath = path.join(projectRoot, 'manifest.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.ok(manifest.name);
  assert.ok(manifest.short_name);
  assert.ok(Array.isArray(manifest.icons));
  assert.ok(manifest.icons.length >= 2);

  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(path.join(projectRoot, icon.src)));
  }
});

test('pwa shell asset list covers the local application shell', () => {
  assert.match(CACHE_NAME, /^codex-shell-v\d+$/);

  const expectedAssets = [
    './',
    './index.html',
    './app.js',
    './domain.js',
    './state.js',
    './manifest.webmanifest',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
  ];

  for (const asset of expectedAssets) {
    assert.ok(APP_SHELL_ASSETS.includes(asset));
  }
});
