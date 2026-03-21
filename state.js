(function defineCodexState(root, factory) {
  const exportsObject = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObject;
  }

  root.CodexState = exportsObject;
})(typeof globalThis !== 'undefined' ? globalThis : window, function buildState() {
  const APP_STATE_VERSION = 3;
  const APP_STATE_KEY = `codex-state-v${APP_STATE_VERSION}`;
  const LEGACY_STOCK_KEY = 'codex-stock-v2';
  const LEGACY_CHECKLIST_KEY = 'codex-checklist-v2';

  function createEmptyAppState(now = null) {
    return {
      version: APP_STATE_VERSION,
      stock: {},
      checklist: {},
      prices: {},
      meta: {
        createdAt: now,
        stockUpdatedAt: null,
        checklistUpdatedAt: null,
        lastUpdatedAt: null,
        importedAt: null,
        exportedAt: null,
      },
    };
  }

  function isRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function parseJson(value, fallback) {
    if (typeof value !== 'string') {
      return fallback;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function sanitizeStock(stock) {
    if (!isRecord(stock)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(stock)
        .filter(([key]) => typeof key === 'string' && key)
        .map(([key, value]) => [key, value == null ? '' : String(value)])
        .filter(([, value]) => value !== '')
    );
  }

  function sanitizePrices(prices) {
    if (!isRecord(prices)) return {};

    return Object.fromEntries(
      Object.entries(prices)
        .filter(([key]) => typeof key === 'string' && key)
        .map(([key, value]) => [key, value == null ? '' : String(value)])
        .filter(([, value]) => value !== '' && !isNaN(Number(value)) && Number(value) > 0)
    );
  }

  function sanitizeChecklist(checklist) {
    if (!isRecord(checklist)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(checklist)
        .filter(([key]) => typeof key === 'string' && key)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => [key, true])
    );
  }

  function normalizeMeta(meta, fallbackNow) {
    const safeMeta = isRecord(meta) ? meta : {};

    return {
      createdAt: typeof safeMeta.createdAt === 'string' ? safeMeta.createdAt : fallbackNow,
      stockUpdatedAt: typeof safeMeta.stockUpdatedAt === 'string' ? safeMeta.stockUpdatedAt : null,
      checklistUpdatedAt: typeof safeMeta.checklistUpdatedAt === 'string' ? safeMeta.checklistUpdatedAt : null,
      lastUpdatedAt: typeof safeMeta.lastUpdatedAt === 'string' ? safeMeta.lastUpdatedAt : null,
      importedAt: typeof safeMeta.importedAt === 'string' ? safeMeta.importedAt : null,
      exportedAt: typeof safeMeta.exportedAt === 'string' ? safeMeta.exportedAt : null,
    };
  }

  function isValidImportedAppState(rawState) {
    return isRecord(rawState)
      && rawState.version === APP_STATE_VERSION
      && isRecord(rawState.stock)
      && isRecord(rawState.checklist)
      && isRecord(rawState.meta);
  }

  function normalizeAppState(rawState, fallbackNow) {
    const base = createEmptyAppState(fallbackNow);
    const stock = sanitizeStock(rawState && rawState.stock);
    const checklist = sanitizeChecklist(rawState && rawState.checklist);
    const prices = sanitizePrices(rawState && rawState.prices);
    const meta = normalizeMeta(rawState && rawState.meta, fallbackNow);

    return {
      version: APP_STATE_VERSION,
      stock,
      checklist,
      prices,
      meta: {
        ...base.meta,
        ...meta,
      },
    };
  }

  function saveAppState(storage, appState) {
    const normalized = normalizeAppState(appState, new Date().toISOString());
    storage.setItem(APP_STATE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function hydrateAppState(storage, now = new Date().toISOString()) {
    const stored = parseJson(storage.getItem(APP_STATE_KEY), null);

    if (stored) {
      const normalized = normalizeAppState(stored, now);
      saveAppState(storage, normalized);
      return normalized;
    }

    const legacyStock = sanitizeStock(parseJson(storage.getItem(LEGACY_STOCK_KEY), {}));
    const legacyChecklist = sanitizeChecklist(parseJson(storage.getItem(LEGACY_CHECKLIST_KEY), {}));
    const hasLegacyData = Object.keys(legacyStock).length > 0 || Object.keys(legacyChecklist).length > 0;

    const hydrated = hasLegacyData
      ? normalizeAppState({
          stock: legacyStock,
          checklist: legacyChecklist,
          meta: {
            createdAt: now,
            stockUpdatedAt: Object.keys(legacyStock).length ? now : null,
            checklistUpdatedAt: Object.keys(legacyChecklist).length ? now : null,
            lastUpdatedAt: now,
          },
        }, now)
      : createEmptyAppState(now);

    saveAppState(storage, hydrated);
    storage.removeItem(LEGACY_STOCK_KEY);
    storage.removeItem(LEGACY_CHECKLIST_KEY);
    return hydrated;
  }

  function updateStockValue(appState, itemId, value, now = new Date().toISOString()) {
    const normalized = normalizeAppState(appState, now);
    const nextStock = { ...normalized.stock };
    const serialized = value == null ? '' : String(value);

    if (serialized === '') {
      delete nextStock[itemId];
    } else {
      nextStock[itemId] = serialized;
    }

    return {
      ...normalized,
      stock: nextStock,
      meta: {
        ...normalized.meta,
        stockUpdatedAt: now,
        lastUpdatedAt: now,
      },
    };
  }

  function updatePriceValue(appState, itemId, value, now = new Date().toISOString()) {
    const normalized = normalizeAppState(appState, now);
    const nextPrices = { ...normalized.prices };
    const serialized = value == null ? '' : String(value);

    if (serialized === '' || isNaN(Number(serialized)) || Number(serialized) <= 0) {
      delete nextPrices[itemId];
    } else {
      nextPrices[itemId] = serialized;
    }

    return {
      ...normalized,
      prices: nextPrices,
      meta: {
        ...normalized.meta,
        lastUpdatedAt: now,
      },
    };
  }

  function toggleChecklistValue(appState, checkId, now = new Date().toISOString()) {
    const normalized = normalizeAppState(appState, now);
    const nextChecklist = { ...normalized.checklist };

    if (nextChecklist[checkId]) {
      delete nextChecklist[checkId];
    } else {
      nextChecklist[checkId] = true;
    }

    return {
      ...normalized,
      checklist: nextChecklist,
      meta: {
        ...normalized.meta,
        checklistUpdatedAt: now,
        lastUpdatedAt: now,
      },
    };
  }

  function exportAppState(appState, now = new Date().toISOString()) {
    const normalized = normalizeAppState(appState, now);

    return JSON.stringify({
      ...normalized,
      meta: {
        ...normalized.meta,
        exportedAt: now,
      },
    }, null, 2);
  }

  function importAppState(rawText, now = new Date().toISOString()) {
    const parsed = parseJson(rawText, null);

    if (!isValidImportedAppState(parsed)) {
      throw new Error('Backup inválido');
    }

    const normalized = normalizeAppState(parsed, now);

    return {
      ...normalized,
      meta: {
        ...normalized.meta,
        importedAt: now,
      },
    };
  }

  function resetStoredAppState(storage) {
    storage.removeItem(APP_STATE_KEY);
    storage.removeItem(LEGACY_STOCK_KEY);
    storage.removeItem(LEGACY_CHECKLIST_KEY);
  }

  return {
    APP_STATE_VERSION,
    APP_STATE_KEY,
    LEGACY_STOCK_KEY,
    LEGACY_CHECKLIST_KEY,
    createEmptyAppState,
    saveAppState,
    hydrateAppState,
    updateStockValue,
    updatePriceValue,
    toggleChecklistValue,
    exportAppState,
    importAppState,
    resetStoredAppState,
  };
});
