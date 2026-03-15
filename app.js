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
      persistState();
      syncInventoryRow(input.dataset.itemId);
    });

    document.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('check-box')) {
        event.preventDefault();
        toggleChecklist(event.target.dataset.checkId);
      }

      if (event.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closeModal();
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
          <span>${section.label}</span>
        </button>
      `;
    }).join('');
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
          <div class="section-kicker">${section.label}</div>
          <h2 class="section-title">${section.title}</h2>
          <p class="section-sub">${section.subtitle}</p>
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
      <div class="hero-grid">
        <article class="hero-panel hero-panel-accent">
          <p class="eyebrow">Perfil estratégico</p>
          <h3>${appProfile.title}</h3>
          <p>${appProfile.assumptionNote}</p>
          <div class="pill-row">
            <span class="pill">Planejamento para ${appProfile.planningHouseholdSize}</span>
            <span class="pill">${state.pwa.label}</span>
            ${appProfile.restrictions.map(restriction => `<span class="pill">${restriction}</span>`).join('')}
          </div>
        </article>
        <div class="stat-grid">
          <article class="stat-card">
            <span class="stat-label">Autonomia</span>
            <strong>${appProfile.autonomyWindow}</strong>
            <span class="stat-note">Meta operacional</span>
          </article>
          <article class="stat-card">
            <span class="stat-label">Compra</span>
            <strong>Híbrida</strong>
            <span class="stat-note">${appProfile.purchaseStrategy}</span>
          </article>
          <article class="stat-card">
            <span class="stat-label">Orçamento</span>
            <strong>${appProfile.monthlyBudget}</strong>
            <span class="stat-note">Referência 2026</span>
          </article>
          <article class="stat-card">
            <span class="stat-label">Modo</span>
            <strong>Solo</strong>
            <span class="stat-note">${appProfile.singleUserNote}</span>
          </article>
        </div>
      </div>

      <div class="grid-2">
        <article class="card">
          <div class="card-heading">
            <p class="eyebrow">Bunker hermético</p>
            <h3>Infraestrutura de armazenagem</h3>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pote</th>
                  <th>Qtd</th>
                  <th>Volume</th>
                  <th>Conteúdo</th>
                </tr>
              </thead>
              <tbody>
                ${storageContainers.map(container => `
                  <tr>
                    <td>
                      <div class="td-item">${container.label}</div>
                      <div class="td-note">${container.note}</div>
                    </td>
                    <td class="td-mono">${container.quantity}</td>
                    <td class="td-mono">${container.totalVolume}</td>
                    <td>${container.contents}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </article>

        <article class="card">
          <div class="card-heading">
            <p class="eyebrow">Atacadão / Assaí</p>
            <h3>Roteiro operacional de compra</h3>
          </div>
          <div class="phase-list">
            ${procurementPhases.map(phase => `
              <div class="phase-item">
                <strong>${phase.title}</strong>
                <p>${phase.body}</p>
              </div>
            `).join('')}
          </div>
        </article>
      </div>

      <div class="grid-2">
        ${renderLocalPanel()}
        ${renderGovernancePanel()}
      </div>
    `;
  }

  function renderLocalPanel() {
    return `
      <article class="card">
        <div class="card-heading">
          <p class="eyebrow">Painel local</p>
          <h3>Backup, reset e auditoria</h3>
        </div>
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Storage</span>
            <strong>v${state.persisted.version}</strong>
            <span class="meta-note">Chave versionada</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Último registro</span>
            <strong>${formatAuditTimestamp(state.persisted.meta.lastUpdatedAt)}</strong>
            <span class="meta-note">Dado vivo</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Estoque</span>
            <strong>${formatAuditTimestamp(state.persisted.meta.stockUpdatedAt)}</strong>
            <span class="meta-note">Última edição</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Checklist</span>
            <strong>${formatAuditTimestamp(state.persisted.meta.checklistUpdatedAt)}</strong>
            <span class="meta-note">Último toggle</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Modo PWA</span>
            <strong>${state.pwa.label}</strong>
            <span class="meta-note">${state.pwa.note}</span>
          </div>
        </div>
        <div class="control-actions">
          <button type="button" class="btn-shopping" data-action="export-backup">Exportar backup</button>
          <button type="button" class="btn-secondary" data-action="import-backup">Importar backup</button>
          <button type="button" class="btn-danger" data-action="reset-state">Resetar estado</button>
        </div>
        <p class="support-copy">O estado fica só neste navegador. Para uso individual confiável, o backup JSON é a redundância manual mais importante.</p>
      </article>
    `;
  }

  function renderGovernancePanel() {
    return `
      <article class="card">
        <div class="card-heading">
          <p class="eyebrow">Leitura do sistema</p>
          <h3>Dado, protocolo e hipótese</h3>
        </div>
        <div class="governance-list">
          ${appProfile.governanceCards.map(card => `
            <div class="governance-item">
              <span class="governance-label">${card.label}</span>
              <p>${card.body}</p>
            </div>
          `).join('')}
        </div>
        <div class="editorial-note">
          <strong>Nota editorial</strong>
          <p>${appProfile.editorialCaveat}</p>
        </div>
      </article>
    `;
  }

  function renderInventorySection(section) {
    const items = getItemsByCategory(section.id);
    const groups = groupBy(items, 'group');

    return `
      <div class="alert-box">
        <strong>${section.alertTitle}</strong>
        <p>${section.alertBody}</p>
      </div>
      <div class="summary-grid" data-category-summary="${section.id}">
        ${renderCategorySummaryCards(section.id)}
      </div>
      ${Object.entries(groups).map(([group, groupItems]) => `
        <article class="card inventory-card">
          <div class="card-heading">
            <p class="eyebrow">${section.label}</p>
            <h3>${group}</h3>
          </div>
          <div class="table-wrap">
            <table class="inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Consumo / ciclo</th>
                  <th>Meta</th>
                  <th>Vida útil</th>
                  <th>Atual</th>
                  <th>Cobertura</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${groupItems.map(renderInventoryRow).join('')}
              </tbody>
            </table>
          </div>
        </article>
      `).join('')}
    `;
  }

  function renderInventoryRow(item) {
    const snapshot = computeStockSnapshot(item, state.persisted.stock[item.id] || 0);
    const monthly = item.stockMode === 'recurring'
      ? formatQuantity(item.monthlyUsage, item.unit)
      : 'Reserva de segurança';

    return `
      <tr data-item-id="${item.id}">
        <td data-label="Item">
          <div class="td-item">${item.highlight ? '<span class="star">★</span>' : ''}${item.label}</div>
          <div class="td-note">${item.note}</div>
          <div class="tag-row">
            ${item.tags.map(tag => `<span class="mini-tag">${tag}</span>`).join('')}
          </div>
        </td>
        <td data-label="Consumo / ciclo">
          <div class="td-mono">${monthly}</div>
          <div class="td-note">${snapshot.purchaseCycleLabel}</div>
        </td>
        <td class="td-mono" data-label="Meta">${snapshot.stockTargetLabel}</td>
        <td class="td-mono" data-label="Vida útil">${item.shelfLife}</td>
        <td data-label="Atual">
          <label class="stock-entry">
            <input
              class="stock-input"
              type="number"
              min="0"
              step="${getInputStep(item)}"
              inputmode="decimal"
              value="${state.persisted.stock[item.id] || ''}"
              data-item-id="${item.id}"
              aria-label="Estoque atual de ${item.label}"
            >
            <span class="unit-chip">${item.unit}</span>
          </label>
        </td>
        <td data-role="coverage" data-label="Cobertura">
          <div class="td-mono">${snapshot.coverage}</div>
          <div class="td-note">${snapshot.targetToBuyLabel ? `Comprar ${snapshot.targetToBuyLabel}` : 'Estoque ideal atendido'}</div>
        </td>
        <td data-role="status" data-label="Status">
          <span class="badge ${snapshot.statusClassName}">${snapshot.statusLabel}</span>
        </td>
      </tr>
    `;
  }

  function renderCategorySummaryCards(categoryId) {
    const summary = summarizeCategory(categoryId, state.persisted.stock);
    const reorderCount = summary.warn + summary.alert;

    return [
      {
        label: 'Crítico',
        value: summary.alert,
        note: 'Abaixo do mínimo',
        tone: 'alert',
      },
      {
        label: 'Atenção',
        value: summary.warn,
        note: 'Fora do ideal',
        tone: 'warn',
      },
      {
        label: 'Recompor',
        value: reorderCount,
        note: `${summary.ok}/${summary.total} já estão verdes`,
        tone: 'balance',
      },
    ].map(card => `
      <article class="summary-card summary-card-${card.tone}">
        <span class="summary-label">${card.label}</span>
        <strong>${card.value}</strong>
        <span class="summary-note">${card.note}</span>
      </article>
    `).join('');
  }

  function renderProtocols() {
    return `
      <div class="action-row">
        <button type="button" class="btn-shopping" data-action="shopping-list">Gerar lista de compras</button>
      </div>
      <div class="grid-2">
        <article class="protocol-box">
          <p class="eyebrow">PEPS</p>
          <h3>Manutenção do sistema</h3>
          <ul>
            <li>Reabastecer o bunker do arroz quando ele entrar no terço final.</li>
            <li>Limpar potes antes do novo lote com pano e álcool 70%.</li>
            <li>Separar compra mensal da feira semanal para não misturar ciclos.</li>
            <li>Usar caixas de papelão para proteger o frio no trajeto até Gurinhém.</li>
          </ul>
        </article>
        <article class="protocol-box protocol-box-alt">
          <p class="eyebrow">Feira semanal</p>
          <h3>Rotina mínima de frescos</h3>
          <ul>
            <li>Frutas: kiwi, ameixa, maçã, pêra, pinha e uva conforme preço e qualidade.</li>
            <li>Legumes: cenoura, batata, cebola e tomate entram na lista base.</li>
            <li>Temperos verdes: coentro, cebolinha e hortelã com reposição curta.</li>
            <li>Folhosas devem ser as primeiras a aparecer na lista da semana.</li>
          </ul>
        </article>
      </div>

      <div class="checklist-grid">
        ${protocolCards.map(renderChecklistCard).join('')}
      </div>
    `;
  }

  function renderChecklistCard(card) {
    const progress = getChecklistProgress(card);

    return `
      <article class="card checklist-card" data-card-id="${card.id}">
        <div class="card-heading card-heading-inline">
          <div>
            <p class="eyebrow">Checklist</p>
            <h3>${card.title}</h3>
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
              >
                ${state.persisted.checklist[item.id] ? '✓' : ''}
              </button>
              <span class="check-text">${item.text}</span>
            </div>
          `).join('')}
        </div>
      </article>
    `;
  }

  function showTab(tabId) {
    state.activeTab = tabId;
    window.location.hash = tabId;
    renderNavigation();
    renderMain();
  }

  function syncAllInventoryRows() {
    document.querySelectorAll('tr[data-item-id]').forEach(row => {
      syncInventoryRow(row.dataset.itemId);
    });
  }

  function syncInventoryRow(itemId) {
    const item = getItemById(itemId);
    const row = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!item || !row) {
      return;
    }

    const snapshot = computeStockSnapshot(item, state.persisted.stock[itemId] || 0);
    const coverageCell = row.querySelector('[data-role="coverage"]');
    const statusCell = row.querySelector('[data-role="status"]');

    coverageCell.innerHTML = `
      <div class="td-mono">${snapshot.coverage}</div>
      <div class="td-note">${snapshot.targetToBuyLabel ? `Comprar ${snapshot.targetToBuyLabel}` : 'Estoque ideal atendido'}</div>
    `;

    statusCell.innerHTML = `<span class="badge ${snapshot.statusClassName}">${snapshot.statusLabel}</span>`;
    syncCategorySummary(item.categoryId);
    syncStateMeta();
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

    const progress = getChecklistProgress(card);
    const counter = host.querySelector('.progress-counter');
    counter.textContent = `${progress.done}/${progress.total}`;
    counter.className = `progress-counter${progress.done === progress.total ? ' progress-done' : progress.done > 0 ? ' progress-partial' : ''}`;
    syncStateMeta();
  }

  function toggleChecklist(checkId) {
    state.persisted = toggleChecklistValue(state.persisted, checkId, nowIso());
    persistState();
    renderMain();
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

    modal.removeAttribute('hidden');
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
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

  function handleBackupImport(event) {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

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
    const confirmed = window.confirm('Isso vai apagar o estoque, o checklist e os metadados salvos neste navegador. Deseja continuar?');
    if (!confirmed) {
      return;
    }

    resetStoredAppState(localStorage);
    state.persisted = createEmptyAppState(nowIso());
    persistState();
    renderMain();
    showToast('Estado local resetado.', 'warn');
  }

  function getChecklistProgress(card) {
    const done = card.items.filter(item => state.persisted.checklist[item.id]).length;
    return { done, total: card.items.length };
  }

  function groupBy(items, key) {
    return items.reduce((groups, item) => {
      const groupKey = item[key];
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {});
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

  function formatAuditTimestamp(value) {
    if (!value) {
      return 'Nunca';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Nunca';
    }

    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
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
