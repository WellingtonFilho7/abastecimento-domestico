const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('vercel config keeps the app deployable as static PWA', () => {
  const vercelPath = path.join(projectRoot, 'vercel.json');
  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  assert.equal(config.version, 2);
  assert.ok(Array.isArray(config.headers));
  assert.ok(config.headers.length >= 3);

  const serviceWorker = config.headers.find(entry => entry.source === '/service-worker.js');
  assert.ok(serviceWorker);
  assert.ok(serviceWorker.headers.some(header => header.key === 'Cache-Control'));

  const manifest = config.headers.find(entry => entry.source === '/manifest.webmanifest');
  assert.ok(manifest);
  assert.ok(manifest.headers.some(header => header.key === 'Cache-Control'));

  const icons = config.headers.find(entry => entry.source === '/icons/(.*)');
  assert.ok(icons);
  assert.ok(icons.headers.some(header => header.key === 'Cache-Control' && header.value.includes('immutable')));
});
