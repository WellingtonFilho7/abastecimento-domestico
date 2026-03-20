(function bootstrapCodexApp() {
  const {
    appProfile,
    sections,
    storageContainers,
    procurementPhases,
    protocolCards,
    computeStockSnapshot,
    formatQuantity,
    getInputStep,
    getItemById,
    getItemsByCategory,
    groupShoppingList,
    summarizeCategory,
    statusMeta,
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

  const {
    escapeHtml: esc,
    debounce,
    groupBy,
    formatAuditTimestamp,
    getChecklistProgress,
  } = window.CodexUtils;

  const state = {
    activeTab: window.location.hash.replace('#', '') || 'overview',
    persisted: hydrateAppState(localStorage),
    pwa: detectPwaStatus(),
    toastTimer: null,
  };

  const navHost = document.getElementById('nav-tabs');
  const mainHost = document.getElementById('app-main');
  const headerMeta = document.getElementById('header-meta');
  const updateDate = document.getElementById('update-date');
  const stateLastUpdated = document.getElementById('state-last-updated');
  const modal = document.getElementById('shopping-modal');
  const shoppingListText = document.getElementById('shopping-list-text');
  const backupImportInput = document.getElementById('backup-import-input');
  const toast = document.getElementById('app-toast');

  const debouncedPersist = debounce(persistState, 350);

  init();

  function init() {
    if (!sections.find(section => section.id === state.activeTab)) {
      state.activeTab = 'overview';
    }

    registerServiceWorker();
    refreshChrome();
    renderNavigation();
    renderMain();
    bindEvents();
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const tabButton = event.target.closest('[data-tab-target]');
      if (tabButton) {
        showTab(tabButton.dataset.tabTarget);
        return;
      }

      const checklistBox = event.target.closest('.check-box');
      if (checklistBox) {
        toggleChecklist(checklistBox.dataset.checkId);
        return;
      }

      const action = event.target.closest('[data-action]');
      if (!action) {
        if (modal.open && event.target === modal) {
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
        default:
          break;
      }
    });

    document.addEventListener('input', event => {
      const input = event.target.closest('.stock-input');
      if (!input) {
        return;
      }

      state.persisted = updateStockValue(state.persisted, input.dataset.itemId, input.value, nowIso());
      debouncedPersist();
      syncInventoryRow(input.dataset.itemId);
    });

    document.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('check-box')) {
        event.preventDefault();
        toggleChecklist(event.target.dataset.checkId);
      }
    });

    backupImportInput.addEventListener('change', handleBackupImport);
  }

  function refreshChrome() {
    renderHeaderMeta();
    syncStateMeta();

    if (updateDate) {
      updateDate.textContent = new Date().toLocaleDateString('pt-BR');
    }
  }

  function renderHeaderMeta() {
    headerMeta.textContent = `${appProfile.location} · ${appProfile.familySummary} · ${appProfile.purchaseStrategy}`;
  }

  function renderNavigation() {
    navHost.innerHTML = sections.map(section => {
      const active = section.id === state.activeTab;
      const badge = renderTabBadge(section);
      return `
        <button
          class="tab-btn${active ? ' active' : ''}"
          type="button"
          data-tab-target="${section.id}"
          role="tab"
          aria-selected="${active}"
          aria-controls="section-${section.id}"
        >
          <span class="tab-icon">${section.icon}</span>
          <span>${esc(section.label)}</span>
          ${badge}
        </button>
      `;
    }).join('');
  }

  function renderTabBadge(section) {
    if (section.type === 'overview' || section.type === 'protocols') {
      return '';
    }

    const summary = summarizeCategory(section.id, state.persisted.stock);
    if (summary.alert > 0) {
      return `<span class="tab-badge">${summary.alert}</span>`;
    }

    return '';
  }

  function renderMain() {
    mainHost.innerHTML = sections.map(section => {
      const active = section.id === state.activeTab;
      const body = renderSectionBody(section);

      return `
        <section
          id="section-${section.id}"
          class="section${active ? ' active' : ''}"
          role="tabpanel"
          aria-hidden="${active ? 'false' : 'true'}"
        >
          <div class="section-kicker">${esc(section.label)}</div>
          <h2 class="section-title">${esc(section.title)}</h2>
          <p class="section-sub">${esc(section.subtitle)}</p>
          ${body}
        </section>
      `;
    }).join('');

    syncAllInventoryRows();
    syncAllChecklists();
  }

  function renderSectionBody(section) {
    if (section.type === 'overview') {
      return renderOverview();
    }

    if (section.type === 'protocols') {
      return renderProtocols();
    }

    return renderInventorySection(section);
  }

  function renderOverview() {
    return `
      <div class="stat-row">
        <div class="stat-card">
          <span class="stat-label">Autonomia</span>
          <strong>${esc(appProfile.autonomyWindow)}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Compra</span>
          <strong>${esc(appProfile.purchaseStrategy)}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Orçamento</span>
          <strong>${esc(appProfile.monthlyBudget)}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Perfil</span>
          <strong>${esc(appProfile.planningHouseholdSize)}</strong>
        </div>
      </div>

      <div class="pill-row">
        ${appProfile.restrictions.map(r => `<span class="pill">${esc(r)}</span>`).join('')}
        <span class="pill">${esc(state.pwa.label)}</span>
      </div>

      ${renderLocalPanel()}
    `;
  }

  function renderLocalPanel() {
    return `
      <div class="card">
        <h3>Backup e dados</h3>
        <div class="meta-row">
          <span>v${esc(state.persisted.version)}</span>
          <span>Último: ${esc(formatAuditTimestamp(state.persisted.meta.lastUpdatedAt))}</span>
          <span>${esc(state.pwa.label)}</span>
        </div>
        <div class="control-actions">
          <button type="button" class="btn-primary" data-action="export-backup">Exportar backup</button>
          <button type="button" class="btn-secondary" data-action="import-backup">Importar</button>
          <button type="button" class="btn-danger" data-action="reset-state">Resetar</button>
        </div>
      </div>
    `;
  }

  function renderInventorySection(section) {
    const items = getItemsByCategory(section.id);
    const groups = groupBy(items, 'group');

    return `
      <div class="summary-row" data-category-summary="${section.id}">
        ${renderCategorySummaryCards(section.id)}
      </div>
      ${Object.entries(groups).map(([group, groupItems]) => `
        <div class="item-group">
          <h3 class="group-title">${esc(group)}</h3>
          <div class="item-list">
            ${groupItems.map(renderInventoryCard).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }

  function renderInventoryCard(item) {
    const snapshot = computeStockSnapshot(item, state.persisted.stock[item.id] || 0);

    return `
      <div class="item-card" data-item-id="${item.id}">
        <div class="item-name">
          ${item.highlight ? '<span class="star">★</span>' : ''}${esc(item.label)}
        </div>
        <div class="item-body">
          <label class="stock-entry">
            <input
              class="stock-input"
              type="number"
              min="0"
              step="${getInputStep(item)}"
              inputmode="decimal"
              value="${esc(state.persisted.stock[item.id] || '')}"
              data-item-id="${item.id}"
              aria-label="Estoque atual de ${esc(item.label)}"
            >
            <span class="unit-chip">${esc(item.unit)}</span>
          </label>
          <div data-role="coverage" class="item-coverage">
            <span class="coverage-value">${esc(snapshot.coverage)}</span>
            ${snapshot.targetToBuyLabel ? `<span class="coverage-action">Comprar ${esc(snapshot.targetToBuyLabel)}</span>` : ''}
          </div>
          <span data-role="status" class="badge ${snapshot.statusClassName}">${esc(snapshot.statusLabel)}</span>
        </div>
      </div>
    `;
  }

  function renderCategorySummaryCards(categoryId) {
    const summary = summarizeCategory(categoryId, state.persisted.stock);

    return `
      <div class="summary-chip summary-chip-alert">
        <strong>${summary.alert}</strong>
        <span>Crítico</span>
      </div>
      <div class="summary-chip summary-chip-warn">
        <strong>${summary.warn}</strong>
        <span>Atenção</span>
      </div>
      <div class="summary-chip summary-chip-ok">
        <strong>${summary.ok}</strong>
        <span>Ok</span>
      </div>
    `;
  }

  function renderProtocols() {
    return `
      <div class="action-row">
        <button type="button" class="btn-shopping" data-action="shopping-list">Gerar lista de compras</button>
      </div>
      <div class="checklist-grid">
        ${protocolCards.map(renderChecklistCard).join('')}
      </div>
    `;
  }

  function renderChecklistCard(card) {
    const progress = getChecklistProgress(card, state.persisted.checklist);

    return `
      <article class="card checklist-card" data-card-id="${card.id}">
        <div class="card-heading card-heading-inline">
          <div>
            <p class="eyebrow">Checklist</p>
            <h3>${esc(card.title)}</h3>
          </div>
          <span class="progress-counter${progress.done === progress.total ? ' progress-done' : progress.done > 0 ? ' progress-partial' : ''}">
            ${progress.done}/${progress.total}
          </span>
        </div>
        <div class="checklist-items">
          ${card.items.map(item => `
            <div class="check-item">
              <button
                type="button"
                class="check-box${state.persisted.checklist[item.id] ? ' checked' : ''}"
                data-check-id="${item.id}"
                aria-pressed="${state.persisted.checklist[item.id] ? 'true' : 'false'}"
                aria-labelledby="check-label-${item.id}"
              >
                ${state.persisted.checklist[item.id] ? '✓' : ''}
              </button>
              <span class="check-text" id="check-label-${item.id}">${esc(item.text)}</span>
            </div>
          `).join('')}
        </div>
      </article>
    `;
  }

  function showTab(tabId) {
    state.activeTab = tabId;
    window.location.hash = tabId;
    syncActiveTab();
  }

  function syncActiveTab() {
    mainHost.querySelectorAll('.section').forEach(section => {
      const sectionId = section.id.replace('section-', '');
      const isActive = sectionId === state.activeTab;
      section.classList.toggle('active', isActive);
      section.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    navHost.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.dataset.tabTarget === state.activeTab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
  }

  function syncAllInventoryRows() {
    document.querySelectorAll('[data-item-id]').forEach(card => {
      syncInventoryRow(card.dataset.itemId);
    });
  }

  function syncInventoryRow(itemId) {
    const item = getItemById(itemId);
    const card = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!item || !card) {
      return;
    }

    const snapshot = computeStockSnapshot(item, state.persisted.stock[itemId] || 0);
    const coverageEl = card.querySelector('[data-role="coverage"]');
    const statusEl = card.querySelector('[data-role="status"]');

    coverageEl.innerHTML = `
      <span class="coverage-value">${esc(snapshot.coverage)}</span>
      ${snapshot.targetToBuyLabel ? `<span class="coverage-action">Comprar ${esc(snapshot.targetToBuyLabel)}</span>` : ''}
    `;

    statusEl.className = `badge ${snapshot.statusClassName}`;
    statusEl.textContent = snapshot.statusLabel;
    syncCategorySummary(item.categoryId);
    syncNavBadge(item.categoryId);
    syncStateMeta();
  }

  function syncNavBadge(categoryId) {
    const btn = navHost.querySelector(`[data-tab-target="${categoryId}"]`);
    if (!btn) {
      return;
    }

    const existing = btn.querySelector('.tab-badge');
    const summary = summarizeCategory(categoryId, state.persisted.stock);

    if (summary.alert > 0) {
      if (existing) {
        existing.textContent = summary.alert;
      } else {
        const badge = document.createElement('span');
        badge.className = 'tab-badge';
        badge.textContent = summary.alert;
        btn.appendChild(badge);
      }
    } else if (existing) {
      existing.remove();
    }
  }

  function syncCategorySummary(categoryId) {
    const host = document.querySelector(`[data-category-summary="${categoryId}"]`);
    if (!host) {
      return;
    }

    host.innerHTML = renderCategorySummaryCards(categoryId);
  }

  function syncAllChecklists() {
    protocolCards.forEach(card => syncChecklistCard(card.id));
  }

  function syncChecklistCard(cardId) {
    const card = protocolCards.find(entry => entry.id === cardId);
    const host = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!card || !host) {
      return;
    }

    const progress = getChecklistProgress(card, state.persisted.checklist);
    const counter = host.querySelector('.progress-counter');
    counter.textContent = `${progress.done}/${progress.total}`;
    counter.className = `progress-counter${progress.done === progress.total ? ' progress-done' : progress.done > 0 ? ' progress-partial' : ''}`;
    syncStateMeta();
  }

  function syncChecklistItem(checkId) {
    const btn = document.querySelector(`[data-check-id="${checkId}"]`);
    if (!btn) {
      return;
    }

    const isChecked = state.persisted.checklist[checkId];
    btn.classList.toggle('checked', !!isChecked);
    btn.setAttribute('aria-pressed', isChecked ? 'true' : 'false');
    btn.textContent = isChecked ? '✓' : '';

    const cardHost = btn.closest('[data-card-id]');
    if (cardHost) {
      syncChecklistCard(cardHost.dataset.cardId);
    }
  }

  function toggleChecklist(checkId) {
    state.persisted = toggleChecklistValue(state.persisted, checkId, nowIso());
    debouncedPersist();
    syncChecklistItem(checkId);
  }

  function openShoppingList() {
    const groups = groupShoppingList(state.persisted.stock);

    if (!groups.length) {
      shoppingListText.textContent = 'Tudo verde. Nenhum item abaixo do estoque ideal.';
    } else {
      shoppingListText.textContent = [
        'LISTA DE COMPRAS · SISTEMA DE RESILIÊNCIA DOMÉSTICA',
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

    modal.showModal();
  }

  function closeModal() {
    modal.close();
  }

  function copyList() {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      showToast('Copiar exige um contexto compatível com clipboard.', 'warn');
      return;
    }

    navigator.clipboard.writeText(shoppingListText.textContent).then(() => {
      showToast('Lista copiada.', 'success');
    }).catch(() => {
      showToast('Não foi possível copiar a lista.', 'warn');
    });
  }

  function exportBackup() {
    const payload = exportAppState(state.persisted, nowIso());
    const filename = `codex-resiliencia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado.', 'success');
  }

  function silentBackup() {
    try {
      const payload = exportAppState(state.persisted, nowIso());
      const filename = `codex-auto-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (_) {
      // Falha silenciosa no backup automático.
    }
  }

  function handleBackupImport(event) {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    silentBackup();

    file.text().then(content => {
      state.persisted = importAppState(content, nowIso());
      persistState();
      renderMain();
      showToast('Backup importado. Um backup automático do estado anterior foi salvo.', 'success');
    }).catch(() => {
      showToast('Backup inválido.', 'error');
    }).finally(() => {
      event.target.value = '';
    });
  }

  function resetState() {
    const confirmed = window.confirm('Isso vai apagar o estoque, o checklist e os metadados salvos neste navegador. Deseja continuar?');
    if (!confirmed) {
      return;
    }

    silentBackup();

    resetStoredAppState(localStorage);
    state.persisted = createEmptyAppState(nowIso());
    persistState();
    renderMain();
    renderNavigation();
    showToast('Estado resetado. Um backup automático do estado anterior foi salvo.', 'warn');
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

  function detectPwaStatus() {
    if (window.location.protocol === 'file:') {
      return {
        label: 'Arquivo local',
        note: 'Use localhost ou HTTPS para instalar e ativar o offline.',
      };
    }

    if (!('serviceWorker' in navigator)) {
      return {
        label: 'Compatibilidade limitada',
        note: 'Este navegador não oferece o pacote PWA completo.',
      };
    }

    const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
      || window.navigator.standalone === true;

    return standalone
      ? {
          label: 'Instalado',
          note: 'Rodando em modo app, sem chrome do navegador.',
        }
      : {
          label: 'Instalável',
          note: 'Offline após a primeira visita em localhost/HTTPS.',
        };
  }

  function registerServiceWorker() {
    if (window.location.protocol === 'file:' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // Falha silenciosa: o app continua funcional sem SW.
    });
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function showToast(message, tone = 'neutral') {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.className = `app-toast app-toast-${tone}`;
    toast.hidden = false;

    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }
})();
