(function bootstrapCodexApp() {
  const {
    appProfile,
    sections,
    protocolCards,
    buildShoppingList,
    computeStockSnapshot,
    formatQuantity,
    getInputStep,
    getItemById,
    getItemsByCategory,
    groupShoppingList,
    summarizeCategory,
  } = window.CodexDomain;

  const {
    createEmptyAppState,
    exportAppState,
    hydrateAppState,
    importAppState,
    resetStoredAppState,
    saveAppState,
    toggleChecklistValue,
    updateStockValue,
  } = window.CodexState;

  const inventorySections = sections.filter(s => s.type === 'inventory');
  const categoryMap = Object.fromEntries(inventorySections.map(s => [s.id, s]));

  const uiSections = [
    { id: 'estoque', label: 'Estoque' },
    { id: 'compras', label: 'Compras' },
    { id: 'config',  label: 'Configurações' },
  ];

  const statusLabels = {
    ok: 'Estável',
    warn: 'Atenção',
    alert: 'Crítico',
    info: 'Info',
  };

  const state = {
    activeTab: window.location.hash.replace('#', '') || 'estoque',
    searchQuery: '',
    persisted: hydrateAppState(localStorage),
    pwa: detectPwaStatus(),
    toastTimer: null,
  };

  const navHost = document.getElementById('nav-tabs');
  const mainHost = document.getElementById('app-main');
  const stateLastUpdated = document.getElementById('state-last-updated');
  const modal = document.getElementById('shopping-modal');
  const shoppingListText = document.getElementById('shopping-list-text');
  const backupImportInput = document.getElementById('backup-import-input');
  const toast = document.getElementById('app-toast');

  const itemSheet = document.getElementById('item-sheet');
  const sheetItemName = document.getElementById('sheet-item-name');
  const sheetItemMeta = document.getElementById('sheet-item-meta');
  const sheetStockInput = document.getElementById('sheet-stock-input');
  const sheetUnit = document.getElementById('sheet-unit');
  const sheetInfo = document.getElementById('sheet-info');
  const sheetState = { itemId: null, step: 1 };

  init();

  function init() {
    if (!uiSections.find(s => s.id === state.activeTab)) {
      state.activeTab = 'estoque';
    }
    registerServiceWorker();
    renderNavigation();
    renderMain();
    bindEvents();
    syncStateMeta();
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const tabTarget = event.target.closest('[data-tab-target]');
      if (tabTarget) {
        showTab(tabTarget.dataset.tabTarget);
        return;
      }

      const sheetOverlay = event.target.closest('.item-sheet-overlay');
      if (sheetOverlay) {
        closeItemSheet();
        return;
      }

      const itemRow = event.target.closest('.item-row[data-item-id]');
      if (itemRow && !event.target.closest('.stock-input')) {
        openItemSheet(itemRow.dataset.itemId);
        return;
      }

      const checklistBox = event.target.closest('.check-box');
      if (checklistBox) {
        toggleChecklist(checklistBox.dataset.checkId);
        return;
      }

      const action = event.target.closest('[data-action]');
      if (!action) {
        if (event.target === modal) {
          closeModal();
        }
        return;
      }

      switch (action.dataset.action) {
        case 'shopping-list':
          openShoppingList();
          break;
        case 'modal-close':
          closeModal();
          break;
        case 'copy-list':
          copyList();
          break;
        case 'export-backup':
          exportBackup();
          break;
        case 'import-backup':
          backupImportInput.click();
          break;
        case 'reset-state':
          resetState();
          break;
        case 'clear-search':
          clearSearch();
          break;
        default:
          break;
      }

      const sheetAction = action.dataset.sheetAction;
      if (sheetAction === 'increment' || sheetAction === 'decrement') {
        stepSheetValue(sheetAction === 'increment' ? 1 : -1);
      }
    });

    document.addEventListener('input', event => {
      const stockInput = event.target.closest('.stock-input');
      if (stockInput) {
        state.persisted = updateStockValue(state.persisted, stockInput.dataset.itemId, stockInput.value, nowIso());
        persistState();
        syncInventoryItemViews(stockInput.dataset.itemId);
        return;
      }

      const searchField = event.target.closest('#inventory-search');
      if (searchField) {
        state.searchQuery = searchField.value;
        renderMain();
        return;
      }

      if (event.target === sheetStockInput && sheetState.itemId) {
        state.persisted = updateStockValue(state.persisted, sheetState.itemId, sheetStockInput.value, nowIso());
        persistState();
        syncInventoryItemViews(sheetState.itemId);
        syncSheetInfo(sheetState.itemId);
      }
    });

    document.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('check-box')) {
        event.preventDefault();
        toggleChecklist(event.target.dataset.checkId);
      }

      if (event.key === 'Escape') {
        if (!itemSheet.hasAttribute('hidden')) {
          closeItemSheet();
          return;
        }
        if (!modal.hasAttribute('hidden')) {
          closeModal();
        }
      }
    });

    backupImportInput.addEventListener('change', handleBackupImport);

    window.addEventListener('hashchange', () => {
      const nextTab = window.location.hash.replace('#', '') || 'estoque';
      if (uiSections.find(s => s.id === nextTab) && nextTab !== state.activeTab) {
        state.activeTab = nextTab;
        renderNavigation();
        renderMain();
      }
    });
  }

  function renderNavigation() {
    navHost.innerHTML = uiSections.map(section => {
      const active = section.id === state.activeTab;
      return `<button
        class="nav-btn${active ? ' active' : ''}"
        type="button"
        data-tab-target="${section.id}"
        role="tab"
        aria-selected="${active}"
      >${section.label}</button>`;
    }).join('');
  }

  function renderMain() {
    const section = uiSections.find(s => s.id === state.activeTab);
    if (!section) {
      state.activeTab = 'estoque';
      return renderMain();
    }

    document.body.dataset.tab = section.id;
    mainHost.innerHTML = `<section class="page" aria-live="polite">${renderPage(section)}</section>`;
    syncStateMeta();
  }

  function renderPage(section) {
    switch (section.id) {
      case 'estoque':
        return renderEstoquePage();
      case 'compras':
        return renderComprasPage();
      case 'config':
        return renderConfigPage();
      default:
        return '';
    }
  }

  function renderEstoquePage() {
    const totalSummary = inventorySections.reduce((acc, s) => {
      const sum = summarizeCategory(s.id, state.persisted.stock);
      acc.total += sum.total;
      acc.ok += sum.ok;
      acc.warn += sum.warn;
      acc.alert += sum.alert;
      return acc;
    }, { total: 0, ok: 0, warn: 0, alert: 0 });

    const query = state.searchQuery.trim().toLowerCase();
    const isSearching = Boolean(query);

    const filteredCategories = inventorySections.map(s => {
      const items = getItemsByCategory(s.id).filter(item => {
        if (!isSearching) return true;
        return [item.label, item.note, item.group, item.tags.join(' '), getCategoryName(item.categoryId)]
          .some(chunk => String(chunk || '').toLowerCase().includes(query));
      });
      return { section: s, items };
    }).filter(entry => entry.items.length > 0);

    return `
      <div class="summary-row" data-inventory-overview>
        <div class="summary-chip chip-alert">
          <strong>${totalSummary.alert}</strong>
          <span>Críticos</span>
        </div>
        <div class="summary-chip chip-warn">
          <strong>${totalSummary.warn}</strong>
          <span>Atenção</span>
        </div>
        <div class="summary-chip chip-ok">
          <strong>${totalSummary.ok}</strong>
          <span>OK</span>
        </div>
      </div>

      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input id="inventory-search" type="text" placeholder="Buscar item…" value="${escapeHtml(state.searchQuery)}" autocomplete="off">
        ${isSearching ? '<button type="button" class="search-icon" data-action="clear-search" style="cursor:pointer;border:0;background:none;font-size:14px;color:var(--text-faint)">✕</button>' : ''}
      </div>

      ${isSearching && !filteredCategories.length ? '<div class="empty">Nenhum item encontrado.</div>' : ''}

      ${filteredCategories.map(({ section: cat, items }) => {
        const groups = groupBy(items, 'group');
        return Object.entries(groups).map(([group, groupItems]) => `
          <div class="card">
            <h3 class="group-header">${cat.label} › ${group}</h3>
            <div class="item-list">
              ${groupItems.map(item => renderItemRow(item)).join('')}
            </div>
          </div>
        `).join('');
      }).join('')}
    `;
  }

  function renderItemRow(item) {
    const snapshot = computeStockSnapshot(item, state.persisted.stock[item.id] || 0);

    return `
      <div class="item-row" data-item-id="${item.id}">
        <div class="item-name">${item.label}</div>
        <div class="item-stock">
          <input
            class="stock-input"
            type="number"
            min="0"
            step="${getInputStep(item)}"
            inputmode="decimal"
            value="${state.persisted.stock[item.id] || ''}"
            data-item-id="${item.id}"
            aria-label="Estoque de ${item.label}"
          >
          <span class="unit-label">${item.unit}</span>
        </div>
        <span class="item-coverage" data-coverage-for="${item.id}">${snapshot.coverage}</span>
        <span data-status-for="${item.id}">${renderBadge(snapshot)}</span>
      </div>
    `;
  }

  function renderBadge(snapshot) {
    const cls = snapshot.status === 'ok' ? 'badge-ok' : snapshot.status === 'warn' ? 'badge-warn' : 'badge-alert';
    return `<span class="badge ${cls}">${statusLabels[snapshot.status]}</span>`;
  }

  function renderComprasPage() {
    const groups = groupShoppingList(state.persisted.stock);
    const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);

    return `
      <div class="summary-row">
        <div class="summary-chip chip-warn">
          <strong>${totalItems}</strong>
          <span>A comprar</span>
        </div>
        <div class="summary-chip chip-ok">
          <strong>${groups.length}</strong>
          <span>Ciclos</span>
        </div>
      </div>

      ${groups.length ? groups.map(group => `
        <div class="card">
          <h3>${group.label} · ${group.items.length} item(ns)</h3>
          ${group.items.map(item => `
            <div class="shopping-item">
              <div class="shopping-check"></div>
              <div class="shopping-item-info">
                <div class="shopping-item-name">${item.label}</div>
                <div class="shopping-item-qty">Comprar ${item.targetToBuyLabel} · atual ${formatQuantity(item.current, item.unit)}</div>
              </div>
              ${renderBadge(item)}
            </div>
          `).join('')}
        </div>
      `).join('') : '<div class="empty">Tudo em dia. Nenhum item precisa de reposição agora.</div>'}

      ${groups.length ? `
        <button type="button" class="btn btn-primary btn-block" data-action="shopping-list">Copiar lista de compras</button>
      ` : ''}
    `;
  }

  function renderConfigPage() {
    const cards = protocolCards.map(card => {
      const progress = getChecklistProgress(card);
      return { ...card, progress };
    });

    return `
      ${cards.map(card => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3 style="margin:0">${card.title}</h3>
            <span class="progress-tag ${card.progress.done === card.progress.total ? 'progress-done' : card.progress.done > 0 ? 'progress-partial' : ''}">${card.progress.done}/${card.progress.total}</span>
          </div>
          ${card.items.map(item => `
            <div class="check-row">
              <button
                type="button"
                class="check-box${state.persisted.checklist[item.id] ? ' checked' : ''}"
                data-check-id="${item.id}"
                aria-pressed="${state.persisted.checklist[item.id] ? 'true' : 'false'}"
              >${state.persisted.checklist[item.id] ? '✓' : ''}</button>
              <span class="check-text">${item.text}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}

      <div class="card">
        <h3>Backup e dados</h3>
        <p style="color:var(--text-soft);font-size:13px;margin-bottom:14px">${appProfile.singleUserNote}</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button type="button" class="btn btn-primary" data-action="export-backup">Exportar backup</button>
          <button type="button" class="btn btn-secondary" data-action="import-backup">Importar backup</button>
          <button type="button" class="btn btn-danger" data-action="reset-state">Resetar tudo</button>
        </div>
      </div>

      <div class="card">
        <h3>Sobre</h3>
        <div style="font-size:12px;color:var(--text-soft);display:grid;gap:4px">
          <div>Estado local v${state.persisted.version}</div>
          <div>Último registro: ${formatAuditTimestamp(state.persisted.meta.lastUpdatedAt)}</div>
          <div>PWA: ${state.pwa.label} — ${state.pwa.note}</div>
          <div>${appProfile.autonomyWindow} · ${appProfile.purchaseStrategy}</div>
        </div>
      </div>
    `;
  }

  function syncInventoryItemViews(itemId) {
    const item = getItemById(itemId);
    if (!item) return;

    const snapshot = computeStockSnapshot(item, state.persisted.stock[itemId] || 0);

    document.querySelectorAll(`[data-coverage-for="${itemId}"]`).forEach(el => {
      el.textContent = snapshot.coverage;
    });

    document.querySelectorAll(`[data-status-for="${itemId}"]`).forEach(el => {
      el.innerHTML = renderBadge(snapshot);
    });

    document.querySelectorAll(`.stock-input[data-item-id="${itemId}"]`).forEach(input => {
      if (input !== document.activeElement) {
        input.value = state.persisted.stock[itemId] || '';
      }
    });

    syncInventoryOverview();
    syncStateMeta();
  }

  function syncInventoryOverview() {
    const host = document.querySelector('[data-inventory-overview]');
    if (!host) return;

    const summary = inventorySections.reduce((acc, s) => {
      const cat = summarizeCategory(s.id, state.persisted.stock);
      acc.total += cat.total; acc.ok += cat.ok; acc.warn += cat.warn; acc.alert += cat.alert;
      return acc;
    }, { total: 0, ok: 0, warn: 0, alert: 0 });

    host.innerHTML = `
      <div class="summary-chip chip-alert"><strong>${summary.alert}</strong><span>Críticos</span></div>
      <div class="summary-chip chip-warn"><strong>${summary.warn}</strong><span>Atenção</span></div>
      <div class="summary-chip chip-ok"><strong>${summary.ok}</strong><span>OK</span></div>
    `;
  }

  function toggleChecklist(checkId) {
    state.persisted = toggleChecklistValue(state.persisted, checkId, nowIso());
    persistState();
    renderMain();
  }

  function openShoppingList() {
    const groups = groupShoppingList(state.persisted.stock);
    shoppingListText.textContent = buildShoppingListText(groups);
    modal.removeAttribute('hidden');
  }

  function buildShoppingListText(groups) {
    if (!groups.length) return 'Tudo verde. Nenhum item abaixo do estoque ideal.';

    return [
      'LISTA DE COMPRAS · ESTOQUE DA CASA',
      `Gerada em ${new Date().toLocaleDateString('pt-BR')}`,
      '',
      ...groups.flatMap(group => [
        `${group.label.toUpperCase()} · ${group.items.length} item(ns)`,
        ...group.items.map(item => {
          const marker = item.status === 'alert' ? '🔴' : '🟡';
          return `${marker} ${item.label} · comprar ${item.targetToBuyLabel} · atual ${formatQuantity(item.current, item.unit)}`;
        }),
        '',
      ]),
    ].join('\n');
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
  }

  function copyList() {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      showToast('Copiar exige contexto seguro.', 'warn');
      return;
    }
    navigator.clipboard.writeText(shoppingListText.textContent).then(() => {
      showToast('Lista copiada.', 'success');
    }).catch(() => {
      showToast('Não foi possível copiar.', 'warn');
    });
  }

  function exportBackup() {
    const payload = exportAppState(state.persisted, nowIso());
    const filename = `estoque-da-casa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado.', 'success');
  }

  function handleBackupImport(event) {
    const [file] = event.target.files || [];
    if (!file) return;

    file.text().then(content => {
      state.persisted = importAppState(content, nowIso());
      persistState();
      renderMain();
      showToast('Backup importado.', 'success');
    }).catch(() => {
      showToast('Backup inválido.', 'error');
    }).finally(() => {
      event.target.value = '';
    });
  }

  function resetState() {
    const confirmed = window.confirm('Isso vai apagar o estoque, o checklist e os metadados. Deseja continuar?');
    if (!confirmed) return;

    resetStoredAppState(localStorage);
    state.persisted = createEmptyAppState(nowIso());
    persistState();
    renderMain();
    showToast('Estado resetado.', 'warn');
  }

  function showTab(tabId) {
    if (tabId === state.activeTab || !uiSections.find(s => s.id === tabId)) return;
    state.activeTab = tabId;
    window.location.hash = tabId;
    renderNavigation();
    renderMain();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function persistState() {
    state.persisted = saveAppState(localStorage, state.persisted);
    syncStateMeta();
  }

  function syncStateMeta() {
    if (stateLastUpdated) {
      stateLastUpdated.textContent = formatAuditTimestamp(state.persisted.meta.lastUpdatedAt);
    }
  }

  function clearSearch() {
    state.searchQuery = '';
    renderMain();
    const field = document.getElementById('inventory-search');
    if (field) field.focus();
  }

  function formatAuditTimestamp(value) {
    if (!value) return 'Nunca';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Nunca';
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function getChecklistProgress(card) {
    const done = card.items.filter(item => state.persisted.checklist[item.id]).length;
    return { done, total: card.items.length };
  }

  function groupBy(items, key) {
    return items.reduce((groups, item) => {
      const k = item[key];
      groups[k] = groups[k] || [];
      groups[k].push(item);
      return groups;
    }, {});
  }

  function getCategoryName(categoryId) {
    const section = categoryMap[categoryId];
    return section ? section.title : categoryId;
  }

  function detectPwaStatus() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    return standalone
      ? { label: 'Instalado', note: 'Rodando em modo app.' }
      : { label: 'Instalável', note: 'Offline após primeira visita.' };
  }

  function registerServiceWorker() {
    if (window.location.protocol === 'file:' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('SW não registrado.', err);
    });
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function showToast(message, tone) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `app-toast app-toast-${tone || 'neutral'}`;
    toast.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  function openItemSheet(itemId) {
    const item = getItemById(itemId);
    if (!item) return;
    sheetState.itemId = itemId;
    sheetState.step = getInputStep(item);
    sheetItemName.textContent = item.label;
    sheetItemMeta.textContent = `${getCategoryName(item.categoryId)} · ${item.note}`;
    sheetStockInput.value = state.persisted.stock[itemId] || '';
    sheetStockInput.step = sheetState.step;
    sheetUnit.textContent = item.unit;
    syncSheetInfo(itemId);
    itemSheet.hidden = false;
    sheetStockInput.focus();
  }

  function closeItemSheet() {
    itemSheet.hidden = true;
    sheetState.itemId = null;
  }

  function stepSheetValue(direction) {
    if (!sheetState.itemId) return;
    const current = Number.parseFloat(sheetStockInput.value) || 0;
    const next = Math.max(0, current + direction * sheetState.step);
    sheetStockInput.value = next;
    state.persisted = updateStockValue(state.persisted, sheetState.itemId, String(next), nowIso());
    persistState();
    syncInventoryItemViews(sheetState.itemId);
    syncSheetInfo(sheetState.itemId);
  }

  function syncSheetInfo(itemId) {
    const item = getItemById(itemId);
    if (!item) return;
    const snapshot = computeStockSnapshot(item, state.persisted.stock[itemId] || 0);
    sheetInfo.innerHTML = `
      <div><strong>${snapshot.stockTargetLabel}</strong> Meta</div>
      <div><strong>${snapshot.coverage}</strong> Cobertura</div>
      <div><strong>${snapshot.purchaseCycleLabel}</strong> Ciclo</div>
      <div><strong>${snapshot.targetToBuyLabel || 'Nenhuma'}</strong> Compra sugerida</div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
