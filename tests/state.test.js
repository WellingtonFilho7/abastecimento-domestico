const test = require('node:test');
const assert = require('node:assert/strict');

const {
  APP_STATE_KEY,
  APP_STATE_VERSION,
  LEGACY_CHECKLIST_KEY,
  LEGACY_STOCK_KEY,
  createEmptyAppState,
  exportAppState,
  hydrateAppState,
  importAppState,
  resetStoredAppState,
  toggleChecklistValue,
  updateStockValue,
} = require('../state.js');

function createFakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test('hydrates legacy v2 keys into versioned app state', () => {
  const storage = createFakeStorage({
    [LEGACY_STOCK_KEY]: JSON.stringify({ 'arroz-branco': '4', 'feijao': '2' }),
    [LEGACY_CHECKLIST_KEY]: JSON.stringify({ 'weekly-review-water': true }),
  });

  const hydrated = hydrateAppState(storage, '2026-03-14T10:00:00.000Z');

  assert.equal(hydrated.version, APP_STATE_VERSION);
  assert.equal(hydrated.stock['arroz-branco'], '4');
  assert.equal(hydrated.checklist['weekly-review-water'], true);
  assert.equal(hydrated.meta.lastUpdatedAt, '2026-03-14T10:00:00.000Z');
  assert.ok(storage.getItem(APP_STATE_KEY));
  assert.equal(storage.getItem(LEGACY_STOCK_KEY), null);
  assert.equal(storage.getItem(LEGACY_CHECKLIST_KEY), null);
});

test('updates stock and checklist with timestamp metadata', () => {
  const base = createEmptyAppState('2026-03-14T10:00:00.000Z');
  const withStock = updateStockValue(base, 'arroz-branco', '6', '2026-03-14T10:05:00.000Z');
  const withChecklist = toggleChecklistValue(withStock, 'weekly-review-water', '2026-03-14T10:07:00.000Z');

  assert.equal(withStock.stock['arroz-branco'], '6');
  assert.equal(withStock.meta.stockUpdatedAt, '2026-03-14T10:05:00.000Z');
  assert.equal(withStock.meta.lastUpdatedAt, '2026-03-14T10:05:00.000Z');
  assert.equal(withChecklist.checklist['weekly-review-water'], true);
  assert.equal(withChecklist.meta.checklistUpdatedAt, '2026-03-14T10:07:00.000Z');
  assert.equal(withChecklist.meta.lastUpdatedAt, '2026-03-14T10:07:00.000Z');
});

test('exports and imports a versioned backup without losing state', () => {
  const original = {
    ...createEmptyAppState('2026-03-14T10:00:00.000Z'),
    stock: { 'arroz-branco': '6' },
    checklist: { 'weekly-review-water': true },
    meta: {
      createdAt: '2026-03-14T10:00:00.000Z',
      stockUpdatedAt: '2026-03-14T10:05:00.000Z',
      checklistUpdatedAt: '2026-03-14T10:07:00.000Z',
      lastUpdatedAt: '2026-03-14T10:07:00.000Z',
      importedAt: null,
    },
  };

  const backup = exportAppState(original, '2026-03-14T11:00:00.000Z');
  const imported = importAppState(backup, '2026-03-14T11:05:00.000Z');

  assert.equal(imported.version, APP_STATE_VERSION);
  assert.equal(imported.stock['arroz-branco'], '6');
  assert.equal(imported.checklist['weekly-review-water'], true);
  assert.equal(imported.meta.importedAt, '2026-03-14T11:05:00.000Z');
  assert.equal(imported.meta.lastUpdatedAt, '2026-03-14T10:07:00.000Z');
});

test('reset clears versioned and legacy storage keys', () => {
  const storage = createFakeStorage({
    [APP_STATE_KEY]: JSON.stringify(createEmptyAppState('2026-03-14T10:00:00.000Z')),
    [LEGACY_STOCK_KEY]: JSON.stringify({ 'arroz-branco': '4' }),
    [LEGACY_CHECKLIST_KEY]: JSON.stringify({ 'weekly-review-water': true }),
  });

  resetStoredAppState(storage);

  assert.equal(storage.getItem(APP_STATE_KEY), null);
  assert.equal(storage.getItem(LEGACY_STOCK_KEY), null);
  assert.equal(storage.getItem(LEGACY_CHECKLIST_KEY), null);
});
