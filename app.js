(function bootstrapCodexApp() {
  const {
    appProfile,
    sections,
    storageContainers,
    procurementPhases,
    protocolCards,
    buildShoppingList,
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

<<<<<<< HEAD
  const {
    escapeHtml: esc,
    debounce,
    groupBy,
    formatAuditTimestamp,
    getChecklistProgress,
  } = window.CodexUtils;
=======
  const inventorySections = sections.filter(section => section.type === 'inventory');
  const categoryMap = Object.fromEntries(inventorySections.map(section => [section.id, section]));
  const uiSections = [
    {
      id: 'today',
      label: 'Hoje',
      icon: '◉',
      title: 'Hoje',
      subtitle: 'Tudo o que pede ação imediata, sem abrir relatório.',
    },
    {
      id: 'inventory',
      label: 'Estoque',
      icon: '◫',
      title: 'Estoque',
      subtitle: 'Cards no mobile, tabela no desktop e leitura clara do que recompor.',
    },
    {
      id: 'purchases',
      label: 'Compras',
      icon: '◌',
      title: 'Compras',
      subtitle: 'Feira, contingência e atacado em um fluxo único de execução.',
    },
    {
      id: 'protocols',
      label: 'Protocolos',
      icon: '≣',
      title: 'Protocolos',
      subtitle: 'Checklists e rotinas da casa para semana, mês e contingência.',
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: '◎',
      title: 'Sistema',
      subtitle: 'Backup, auditoria local, bunker hermético e governança do app.',
    },
  ];

  const statusLabels = {
    ok: 'Estável',
    warn: 'Atenção',
    alert: 'Crítico',
    info: 'Info',
  };

  const cyclePriority = ['feira-semanal', 'contingencia-rural', 'atacado-mensal'];
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)

  const state = {
    activeTab: window.location.hash.replace('#', '') || 'today',
    searchQuery: '',
    persisted: hydrateAppState(localStorage),
    pwa: detectPwaStatus(),
    toastTimer: null,
  };

  const navHost = document.getElementById('nav-tabs');
  const bottomNavHost = document.getElementById('bottom-nav');
  const mainHost = document.getElementById('app-main');
  const headerMeta = document.getElementById('header-meta');
  const updateDate = document.getElementById('update-date');
  const stateLastUpdated = document.getElementById('state-last-updated');
  const modal = document.getElementById('shopping-modal');
  const shoppingListText = document.getElementById('shopping-list-text');
  const backupImportInput = document.getElementById('backup-import-input');
  const toast = document.getElementById('app-toast');
  const searchInput = document.getElementById('global-search');
  const searchClear = document.getElementById('search-clear');

  const debouncedPersist = debounce(persistState, 350);

  init();

  function init() {
    if (!uiSections.find(section => section.id === state.activeTab)) {
      state.activeTab = 'today';
    }

    registerServiceWorker();
    refreshChrome();
    renderNavigation();
    renderMain();
    syncShoppingBadge();
    bindEvents();
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const tabTarget = event.target.closest('[data-tab-target]');
      if (tabTarget) {
        showTab(tabTarget.dataset.tabTarget);
        return;
      }

      const shopItem = event.target.closest('[data-shop-id]');
      if (shopItem) {
        toggleShoppingItem(shopItem.dataset.shopId);
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
        case 'clear-shopping':
          clearShoppingChecks();
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
    });

    document.addEventListener('input', event => {
      const input = event.target.closest('.stock-input');
      if (!input) {
        return;
      }

      state.persisted = updateStockValue(state.persisted, input.dataset.itemId, input.value, nowIso());
<<<<<<< HEAD
      debouncedPersist();
      syncInventoryRow(input.dataset.itemId);
=======
      persistState();
      syncInventoryItemViews(input.dataset.itemId);
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
    });

    document.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('check-box')) {
        event.preventDefault();
        toggleChecklist(event.target.dataset.checkId);
      }
<<<<<<< HEAD
=======

      if (event.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closeModal();
      }

      if (event.key === '/' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        searchInput.focus();
      }
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
    });

    searchInput.addEventListener('input', event => {
      state.searchQuery = event.target.value;
      syncSearchUi();
      renderMain();
    });

    searchClear.addEventListener('click', clearSearch);
    backupImportInput.addEventListener('change', handleBackupImport);

    window.addEventListener('hashchange', () => {
      const nextTab = window.location.hash.replace('#', '') || 'today';
      if (uiSections.find(section => section.id === nextTab) && nextTab !== state.activeTab) {
        state.activeTab = nextTab;
        renderNavigation();
        renderMain();
      }
    });
  }

  function refreshChrome() {
    renderHeaderMeta();
    syncStateMeta();

    if (updateDate) {
      updateDate.textContent = new Date().toLocaleDateString('pt-BR');
    }
  }

  function renderHeaderMeta() {
    headerMeta.innerHTML = [
      appProfile.location,
      appProfile.purchaseStrategy,
      appProfile.autonomyWindow,
      state.pwa.label,
    ].concat(appProfile.restrictions).map(item => {
      return `<span class="meta-pill">${item}</span>`;
    }).join('');
  }

  function renderNavigation() {
<<<<<<< HEAD
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
=======
    navHost.innerHTML = uiSections.map(section => renderNavButton(section, 'desktop')).join('');
    bottomNavHost.innerHTML = uiSections.map(section => renderNavButton(section, 'mobile')).join('');
  }

  function renderNavButton(section, mode) {
    const active = section.id === state.activeTab;
    const baseClass = mode === 'mobile' ? 'mobile-nav-btn' : 'nav-btn';
    const roleAttrs = mode === 'desktop'
      ? `role="tab" aria-selected="${active}" aria-controls="section-${section.id}"`
      : `aria-current="${active ? 'page' : 'false'}"`;

    return `
      <button
        class="${baseClass}${active ? ' active' : ''}"
        type="button"
        data-tab-target="${section.id}"
        ${roleAttrs}
      >
        <span class="nav-icon" aria-hidden="true">${section.icon}</span>
        <span class="nav-label">${section.label}</span>
      </button>
    `;
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
  }

  function renderTabBadge(section) {
    if (section.type === 'overview' || section.type === 'protocols') {
      return '';
    }

    if (section.type === 'shopping') {
      const list = buildShoppingList(state.persisted.stock);
      const unchecked = list.filter(item => !state.persisted.checklist['shop-' + item.id]).length;
      if (unchecked > 0) {
        return `<span class="tab-badge tab-badge-shopping">${unchecked}</span>`;
      }
      return '';
    }

    const summary = summarizeCategory(section.id, state.persisted.stock);
    if (summary.alert > 0) {
      return `<span class="tab-badge">${summary.alert}</span>`;
    }

    return '';
  }

  function renderMain() {
<<<<<<< HEAD
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

    if (section.type === 'shopping') {
      return `<div class="shopping-body">${renderShoppingTab()}</div>`;
    }

    if (section.type === 'protocols') {
      return renderProtocols();
    }

    return renderInventorySection(section);
=======
    const section = getUiSection(state.activeTab);
    if (!section) {
      state.activeTab = 'today';
      return renderMain();
    }

    document.body.dataset.tab = section.id;
    mainHost.innerHTML = `
      <section id="section-${section.id}" class="page page-${section.id}" aria-live="polite">
        ${renderPage(section)}
      </section>
    `;
    syncStateMeta();
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
  }

  function renderPage(section) {
    switch (section.id) {
      case 'today':
        return renderTodayPage(section);
      case 'inventory':
        return renderInventoryPage(section);
      case 'purchases':
        return renderPurchasesPage(section);
      case 'protocols':
        return renderProtocolsPage(section);
      case 'system':
        return renderSystemPage(section);
      default:
        return '';
    }
  }

  function renderTodayPage(section) {
    const list = buildShoppingList(state.persisted.stock);
    const grouped = groupShoppingList(state.persisted.stock);
    const criticalItems = list.filter(item => item.status === 'alert');
    const focusItems = (criticalItems.length ? criticalItems : list).slice(0, 6);
    const weeklyGroup = grouped.find(group => group.cycle === 'feira-semanal');
    const pendingChecklist = protocolCards.reduce((total, card) => {
      return total + card.items.filter(item => !state.persisted.checklist[item.id]).length;
    }, 0);
    const results = getSearchResults();
    const categoryCards = inventorySections.map(sectionItem => {
      const summary = summarizeCategory(sectionItem.id, state.persisted.stock);
      return {
        section: sectionItem,
        summary,
      };
    });

    return `
<<<<<<< HEAD
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
=======
      <div class="page-heading">
        <span class="page-kicker">${section.label}</span>
        <h2 class="page-title">O que pede atenção agora</h2>
        <p class="page-sub">A primeira tela do app foi reorganizada para responder compra, urgência e equilíbrio da casa sem parecer relatório.</p>
      </div>

      ${state.searchQuery.trim() ? renderSearchResults(results) : ''}

      <div class="today-hero">
        <article class="hero-card">
          <span class="eyebrow">Prioridade do dia</span>
          <h2>${buildTodayHeadline(criticalItems.length, weeklyGroup)}</h2>
          <p>${buildTodayCopy(list.length, pendingChecklist)}</p>
          <div class="hero-actions">
            <button type="button" class="action-btn" data-action="shopping-list">Abrir lista rápida</button>
            <button type="button" class="action-btn-secondary" data-tab-target="inventory">Ver estoque</button>
          </div>
        </article>

        <div class="hero-stats">
          <article class="hero-stat">
            <span class="mini-label">Itens críticos</span>
            <strong>${criticalItems.length}</strong>
            <span>${criticalItems.length ? 'Abaixo do mínimo' : 'Nenhum item em ruptura'}</span>
          </article>
          <article class="hero-stat">
            <span class="mini-label">Feira da semana</span>
            <strong>${weeklyGroup ? weeklyGroup.items.length : 0}</strong>
            <span>${weeklyGroup ? 'Entram no próximo giro' : 'Sem pendência semanal aberta'}</span>
          </article>
          <article class="hero-stat">
            <span class="mini-label">Checklist aberto</span>
            <strong>${pendingChecklist}</strong>
            <span>${pendingChecklist ? 'Rotinas ainda pendentes' : 'Tudo em dia por enquanto'}</span>
          </article>
        </div>
      </div>

      <section class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Agora</span>
            <h3>Itens críticos agora</h3>
          </div>
          <button type="button" class="ghost-btn" data-tab-target="inventory">Abrir estoque</button>
        </div>
        ${focusItems.length ? `
          <div class="focus-grid">
            ${focusItems.map(renderTodayFocusCard).join('')}
          </div>
        ` : `
          <div class="page-empty">Tudo está dentro do estoque ideal. Se quiser, gere a lista rápida só para conferência do próximo giro.</div>
        `}
      </section>

      <section class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Semana</span>
            <h3>Lista de compras da semana</h3>
          </div>
          <button type="button" class="ghost-btn" data-tab-target="purchases">Ver compras</button>
        </div>
        ${renderWeeklyShoppingPreview(weeklyGroup)}
      </section>

      <section class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Casa</span>
            <h3>Resumo do estoque da casa</h3>
          </div>
          <button type="button" class="ghost-btn" data-tab-target="inventory">Detalhar</button>
        </div>
        <div class="summary-grid">
          ${categoryCards.map(({ section: categorySection, summary }) => {
            return renderCategoryOverviewCard(categorySection, summary);
          }).join('')}
        </div>
      </section>

      <section class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Atalhos</span>
            <h3>Ações rápidas</h3>
          </div>
        </div>
        <div class="hero-actions">
          <button type="button" class="action-btn-secondary" data-tab-target="purchases">Feira + atacado</button>
          <button type="button" class="action-btn-secondary" data-tab-target="protocols">Revisar protocolos</button>
          <button type="button" class="action-btn-secondary" data-tab-target="system">Backup e sistema</button>
        </div>
      </section>
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
    `;
  }

  function renderSearchResults(results) {
    return `
<<<<<<< HEAD
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
=======
      <section class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Busca</span>
            <h3>Resultados para "${escapeHtml(state.searchQuery.trim())}"</h3>
          </div>
          <button type="button" class="ghost-btn" data-action="clear-search">Limpar busca</button>
        </div>
        ${results.length ? `
          <div class="search-results-grid">
            ${results.map(renderSearchResultCard).join('')}
          </div>
        ` : `
          <div class="page-empty">Nenhum item encontrado com esse termo. Tente buscar por categoria, nome do item ou ciclo de compra.</div>
        `}
      </section>
    `;
  }

  function renderTodayFocusCard(snapshot) {
    return `
      <article class="focus-card">
        <div class="focus-top">
          <div>
            <div class="focus-title">${snapshot.label}</div>
            <div class="text-muted">${getCategoryName(snapshot.categoryId)} · ${snapshot.purchaseCycleLabel}</div>
          </div>
          ${renderStatusBadge(snapshot)}
        </div>
        <div class="tag-row">
          ${snapshot.tags.map(tag => `<span class="mini-tag">${tag}</span>`).join('')}
        </div>
        <div class="coverage-block" style="margin-top:14px">
          <div class="coverage-main">${snapshot.coverage}</div>
          <div class="coverage-sub">${snapshot.targetToBuyLabel ? `Comprar ${snapshot.targetToBuyLabel}` : 'Estoque ideal atendido'}</div>
        </div>
      </article>
    `;
  }

  function renderWeeklyShoppingPreview(weeklyGroup) {
    if (!weeklyGroup || !weeklyGroup.items.length) {
      return '<div class="page-empty">A feira da semana está coberta. O próximo foco pode ser o ciclo mensal ou a revisão dos protocolos.</div>';
    }

    return `
      <div class="cycle-grid">
        <article class="cycle-card">
          <div class="cycle-header">
            <div>
              <span class="eyebrow">Feira semanal</span>
              <h3>${weeklyGroup.items.length} item(ns) em espera</h3>
            </div>
            <button type="button" class="sheet-action" data-action="shopping-list">Gerar texto</button>
          </div>
          <div class="cycle-list">
            ${weeklyGroup.items.slice(0, 6).map(renderPurchaseItem).join('')}
          </div>
        </article>
      </div>
    `;
  }

  function renderCategoryOverviewCard(section, summary) {
    const tone = summary.alert > 0 ? 'alert' : summary.warn > 0 ? 'warn' : 'balance';
    const reorderCount = summary.warn + summary.alert;
    const copy = summary.alert > 0
      ? `${summary.alert} crítico(s) e ${summary.warn} em atenção`
      : summary.warn > 0
        ? `${summary.warn} item(ns) abaixo do ideal`
        : `${summary.ok}/${summary.total} estáveis`;

    return `
      <article class="summary-card summary-card-${tone}">
        <span class="summary-card-label">${section.label}</span>
        <strong>${reorderCount || summary.ok}</strong>
        <p class="summary-card-sub">${copy}</p>
      </article>
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
    `;
  }

  function renderInventoryPage(section) {
    const filteredCategories = inventorySections.map(categorySection => {
      const items = getItemsByCategory(categorySection.id).filter(matchesInventoryItem);
      return {
        section: categorySection,
        items,
      };
    }).filter(entry => entry.items.length > 0);

    const totalSummary = inventorySections.reduce((accumulator, categorySection) => {
      const summary = summarizeCategory(categorySection.id, state.persisted.stock);
      accumulator.total += summary.total;
      accumulator.ok += summary.ok;
      accumulator.warn += summary.warn;
      accumulator.alert += summary.alert;
      accumulator.toBuy += summary.toBuy;
      return accumulator;
    }, {
      total: 0,
      ok: 0,
      warn: 0,
      alert: 0,
      toBuy: 0,
    });

    return `
<<<<<<< HEAD
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

  function renderShoppingTab() {
    const groups = groupShoppingList(state.persisted.stock);
    const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);

    if (totalItems === 0) {
      return `
        <div class="shopping-empty">
          <div class="shopping-empty-icon">✓</div>
          <p>Tudo verde. Nenhum item abaixo do estoque ideal.</p>
        </div>
      `;
    }

    const checkedCount = groups.reduce((sum, g) =>
      sum + g.items.filter(item => state.persisted.checklist['shop-' + item.id]).length, 0);

    return `
      <div class="shopping-header">
        <div class="shopping-progress">
          <span class="shopping-progress-count">${checkedCount}/${totalItems}</span>
          <span class="shopping-progress-label">${checkedCount === totalItems ? 'Tudo pego!' : 'itens no carrinho'}</span>
        </div>
        <button type="button" class="btn-secondary btn-sm" data-action="clear-shopping">Limpar checks</button>
      </div>
      <div class="shopping-progress-bar">
        <div class="shopping-progress-fill" style="width: ${totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0}%"></div>
      </div>
      ${groups.map(group => `
        <div class="shopping-group">
          <h3 class="shopping-group-title">${esc(group.label)} <span class="shopping-group-count">${group.items.length}</span></h3>
          <div class="shopping-items">
            ${group.items.map(item => {
              const checked = state.persisted.checklist['shop-' + item.id];
              const marker = item.status === 'alert' ? 'alert' : 'warn';
              return `
                <button
                  type="button"
                  class="shopping-item${checked ? ' shopping-done' : ''}"
                  data-shop-id="${item.id}"
                  aria-pressed="${checked ? 'true' : 'false'}"
                >
                  <span class="shopping-check">${checked ? '✓' : ''}</span>
                  <span class="shopping-item-info">
                    <span class="shopping-item-name">${item.highlight ? '<span class="star">★</span>' : ''}${esc(item.label)}</span>
                    <span class="shopping-item-qty badge-${marker}">Comprar ${esc(item.targetToBuyLabel)}</span>
                  </span>
                  <span class="shopping-item-current">${esc(formatQuantity(item.current, item.unit))} em casa</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }

  function toggleShoppingItem(itemId) {
    const checkId = 'shop-' + itemId;
    state.persisted = toggleChecklistValue(state.persisted, checkId, nowIso());
    debouncedPersist();
    refreshShoppingTab();
  }

  function clearShoppingChecks() {
    const keys = Object.keys(state.persisted.checklist).filter(k => k.startsWith('shop-'));
    keys.forEach(key => {
      if (state.persisted.checklist[key]) {
        state.persisted = toggleChecklistValue(state.persisted, key, nowIso());
      }
    });
    debouncedPersist();
    refreshShoppingTab();
  }

  function refreshShoppingTab() {
    const section = document.getElementById('section-shopping');
    if (!section) {
      return;
    }

    const shoppingSection = sections.find(s => s.id === 'shopping');
    const body = renderShoppingTab();
    const kicker = section.querySelector('.section-kicker');
    const title = section.querySelector('.section-title');
    const sub = section.querySelector('.section-sub');

    // Re-render just the body (everything after sub)
    const bodyContainer = section.querySelector('.shopping-body');
    if (bodyContainer) {
      bodyContainer.innerHTML = body;
    } else {
      // Wrap body content
      let bodyEl = document.createElement('div');
      bodyEl.className = 'shopping-body';
      bodyEl.innerHTML = body;
      // Remove old body content (everything after sub)
      while (sub.nextSibling) {
        sub.nextSibling.remove();
      }
      section.appendChild(bodyEl);
    }
    syncShoppingBadge();
  }

  function syncShoppingBadge() {
    const btn = navHost.querySelector('[data-tab-target="shopping"]');
    if (!btn) {
      return;
    }

    const list = buildShoppingList(state.persisted.stock);
    const unchecked = list.filter(item => !state.persisted.checklist['shop-' + item.id]).length;
    const existing = btn.querySelector('.tab-badge');

    if (unchecked > 0) {
      if (existing) {
        existing.textContent = unchecked;
      } else {
        const badge = document.createElement('span');
        badge.className = 'tab-badge tab-badge-shopping';
        badge.textContent = unchecked;
        btn.appendChild(badge);
      }
    } else if (existing) {
      existing.remove();
    }
=======
      <div class="page-heading">
        <span class="page-kicker">${section.label}</span>
        <h2 class="page-title">${section.title}</h2>
        <p class="page-sub">${state.searchQuery.trim() ? 'Busca ativa: o inventário abaixo foi filtrado pelo termo digitado.' : section.subtitle}</p>
      </div>

      <div class="inventory-layout">
        <section class="panel">
          <div class="section-header">
            <div>
              <span class="eyebrow">Leitura rápida</span>
              <h3>Panorama do estoque</h3>
            </div>
            <button type="button" class="ghost-btn" data-action="shopping-list">Lista rápida</button>
          </div>
          <div class="inventory-overview" data-inventory-overview>
            ${renderInventoryOverviewCards(totalSummary)}
          </div>
        </section>

        ${filteredCategories.length ? filteredCategories.map(({ section: categorySection, items }) => {
          const groups = groupBy(items, 'group');
          const summary = summarizeCategory(categorySection.id, state.persisted.stock);

          return `
            <section class="inventory-layout">
              <div class="page-heading">
                <span class="page-kicker">${categorySection.label}</span>
                <h2 class="page-title">${categorySection.title}</h2>
                <p class="page-sub">${categorySection.alertBody}</p>
              </div>

              <div class="summary-grid" data-category-summary="${categorySection.id}">
                ${renderCategorySummaryCards(summary)}
              </div>

              <div class="inventory-group-stack">
                ${Object.entries(groups).map(([group, groupItems]) => {
                  return renderInventoryGroup(group, groupItems);
                }).join('')}
              </div>
            </section>
          `;
        }).join('') : `
          <div class="page-empty">Nenhum item do inventário combina com a busca atual.</div>
        `}
      </div>
    `;
  }

  function renderInventoryOverviewCards(summary) {
    return [
      {
        label: 'Críticos',
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
        label: 'A recompor',
        value: summary.warn + summary.alert,
        note: `${summary.ok}/${summary.total} estáveis`,
        tone: 'balance',
      },
    ].map(card => `
      <article class="summary-card summary-card-${card.tone}">
        <span class="summary-card-label">${card.label}</span>
        <strong>${card.value}</strong>
        <p class="summary-card-sub">${card.note}</p>
      </article>
    `).join('');
  }

  function renderCategorySummaryCards(summary) {
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
        note: `${summary.ok}/${summary.total} em equilíbrio`,
        tone: 'balance',
      },
    ].map(card => `
      <article class="summary-card summary-card-${card.tone}">
        <span class="summary-card-label">${card.label}</span>
        <strong>${card.value}</strong>
        <p class="summary-card-sub">${card.note}</p>
      </article>
    `).join('');
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
  }

  function renderInventoryGroup(group, groupItems) {
    return `
      <article class="inventory-block">
        <div class="section-header">
          <div>
            <span class="eyebrow">Grupo</span>
            <h3>${group}</h3>
          </div>
        </div>

        <div class="inventory-mobile-list">
          ${groupItems.map(renderInventoryCard).join('')}
        </div>

        <div class="inventory-desktop">
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
        </div>
      </article>
    `;
  }

  function renderInventoryRow(item) {
    const snapshot = computeStockSnapshot(item, state.persisted.stock[item.id] || 0);

    return `
      <tr data-item-id="${item.id}">
        <td>
          <div class="item-name">${item.label}</div>
          <div class="item-note">${item.note}</div>
          <div class="tag-row">
            ${item.tags.map(tag => `<span class="mini-tag">${tag}</span>`).join('')}
          </div>
        </td>
        <td>
          <div class="item-meta">${renderCycleMeta(item, snapshot)}</div>
        </td>
        <td>
          <div class="item-meta">${snapshot.stockTargetLabel}</div>
        </td>
        <td>
          <div class="item-meta">${item.shelfLife}</div>
        </td>
        <td>
          ${renderStockInput(item)}
        </td>
        <td data-coverage-for="${item.id}">
          ${renderCoverageBlock(snapshot)}
        </td>
        <td data-status-for="${item.id}">
          ${renderStatusBadge(snapshot)}
        </td>
      </tr>
    `;
  }

  function renderInventoryCard(item) {
    const snapshot = computeStockSnapshot(item, state.persisted.stock[item.id] || 0);

    return `
      <article class="inventory-card" data-item-id="${item.id}">
        <div class="inventory-card-head">
          <div>
            <div class="inventory-card-title">${item.label}</div>
            <div class="text-muted">${item.note}</div>
          </div>
          <div data-status-for="${item.id}">
            ${renderStatusBadge(snapshot)}
          </div>
        </div>

        <div class="tag-row">
          ${item.tags.map(tag => `<span class="mini-tag">${tag}</span>`).join('')}
        </div>

        <div class="inventory-card-body">
          <div class="inventory-card-grid">
            <div class="inventory-card-meta">
              <span class="mini-label">Ciclo</span>
              <div class="coverage-main">${snapshot.purchaseCycleLabel}</div>
              <div class="coverage-sub">${renderCycleMeta(item, snapshot)}</div>
            </div>
            <div class="inventory-card-meta">
              <span class="mini-label">Meta</span>
              <div class="coverage-main">${snapshot.stockTargetLabel}</div>
              <div class="coverage-sub">${item.shelfLife}</div>
            </div>
          </div>

          ${renderStockInput(item)}

          <div class="inventory-card-meta" data-coverage-for="${item.id}">
            ${renderCoverageBlock(snapshot)}
          </div>
        </div>
      </article>
    `;
  }

  function renderStockInput(item) {
    return `
      <label class="stock-field">
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
    `;
  }

  function renderCoverageBlock(snapshot) {
    return `
      <div class="coverage-block">
        <div class="coverage-main">${snapshot.coverage}</div>
        <div class="coverage-sub">${snapshot.targetToBuyLabel ? `Comprar ${snapshot.targetToBuyLabel}` : 'Estoque ideal atendido'}</div>
      </div>
<<<<<<< HEAD
      <div class="checklist-grid">
        ${protocolCards.map(renderChecklistCard).join('')}
=======
    `;
  }

  function renderStatusBadge(snapshot) {
    return `
      <span class="status-badge status-${snapshot.status}">
        ${statusLabels[snapshot.status] || snapshot.statusLabel}
      </span>
    `;
  }

  function renderPurchasesPage(section) {
    const groups = getFilteredShoppingGroups();
    const cycleCounts = cyclePriority.map(cycle => {
      const group = groups.find(entry => entry.cycle === cycle);
      return {
        cycle,
        label: group ? group.label : getCycleFallbackLabel(cycle),
        count: group ? group.items.length : 0,
      };
    });

    return `
      <div class="page-heading">
        <span class="page-kicker">${section.label}</span>
        <h2 class="page-title">${section.title}</h2>
        <p class="page-sub">${section.subtitle}</p>
      </div>

      <section class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Execução</span>
            <h3>Compras vivas da casa</h3>
          </div>
          <button type="button" class="action-btn" data-action="shopping-list">Abrir lista para copiar</button>
        </div>
        <div class="purchase-overview">
          ${cycleCounts.map(entry => `
            <article class="summary-card summary-card-${entry.count ? 'warn' : 'balance'}">
              <span class="summary-card-label">${entry.label}</span>
              <strong>${entry.count}</strong>
              <p class="summary-card-sub">${entry.count ? 'Item(ns) aguardando compra' : 'Sem pendências agora'}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <div class="purchase-layout">
        ${groups.length ? `
          <div class="cycle-grid">
            ${groups.map(group => `
              <article class="cycle-card">
                <div class="cycle-header">
                  <div>
                    <span class="eyebrow">${group.label}</span>
                    <h3>${group.items.length} item(ns)</h3>
                  </div>
                </div>
                <div class="cycle-list">
                  ${group.items.map(renderPurchaseItem).join('')}
                </div>
              </article>
            `).join('')}
          </div>
        ` : `
          <div class="page-empty">Nenhuma compra pendente para a busca atual. Se o estoque está verde, use essa tela como conferência do próximo ciclo.</div>
        `}

        <section class="panel">
          <div class="section-header">
            <div>
              <span class="eyebrow">Fluxo de ida</span>
              <h3>Roteiro operacional de compra</h3>
            </div>
          </div>
          <div class="phase-grid">
            ${procurementPhases.map(phase => `
              <article class="phase-card">
                <strong>${phase.title}</strong>
                <p>${phase.body}</p>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderPurchaseItem(item) {
    return `
      <div class="cycle-item">
        <div class="cycle-item-main">
          <div>
            <div class="cycle-item-title">${item.label}</div>
            <div class="text-muted">${getCategoryName(item.categoryId)}</div>
          </div>
          ${renderStatusBadge(item)}
        </div>
        <div class="item-meta">Comprar ${item.targetToBuyLabel} · atual ${formatQuantity(item.current, item.unit)}</div>
      </div>
    `;
  }

  function renderProtocolsPage(section) {
    const cards = protocolCards.map(card => {
      const items = card.items.filter(item => matchesProtocolItem(item.text));
      return { ...card, filteredItems: items };
    }).filter(card => !state.searchQuery.trim() || card.filteredItems.length > 0);

    return `
      <div class="page-heading">
        <span class="page-kicker">${section.label}</span>
        <h2 class="page-title">${section.title}</h2>
        <p class="page-sub">${section.subtitle}</p>
      </div>

      <div class="protocol-layout">
        <div class="phase-grid">
          <article class="protocol-callout">
            <span class="eyebrow">PEPS</span>
            <h3>Manutenção do sistema</h3>
            <p>Reabasteça no terço final, limpe potes antes do lote novo e mantenha proteínas fracionadas por uso. O protocolo deve parecer leve, não burocrático.</p>
          </article>
          <article class="protocol-callout">
            <span class="eyebrow">Feira semanal</span>
            <h3>Frescos em giro curto</h3>
            <p>Folhosas e verdes precisam aparecer cedo na semana. A lógica aqui é frescor, não excesso de estoque.</p>
          </article>
          <article class="protocol-callout">
            <span class="eyebrow">Contingência</span>
            <h3>Rural sem drama</h3>
            <p>Água, farmacinha, rota e freezer devem estar sempre auditáveis para um uso individual confiável.</p>
          </article>
        </div>

        ${cards.length ? `
          <div class="checklist-grid">
            ${cards.map(renderChecklistCard).join('')}
          </div>
        ` : `
          <div class="page-empty">Nenhum checklist corresponde à busca atual.</div>
        `}
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
      </div>
    `;
  }

  function renderChecklistCard(card) {
<<<<<<< HEAD
    const progress = getChecklistProgress(card, state.persisted.checklist);
=======
    const progress = getChecklistProgress(card);
    const toneClass = progress.done === progress.total
      ? ' done'
      : progress.done > 0
        ? ' partial'
        : '';
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)

    return `
      <article class="checklist-card" data-card-id="${card.id}">
        <div class="checklist-head">
          <div>
<<<<<<< HEAD
            <p class="eyebrow">Checklist</p>
            <h3>${esc(card.title)}</h3>
=======
            <span class="eyebrow">Checklist</span>
            <h3>${card.title}</h3>
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
          </div>
          <span class="progress-chip${toneClass}">${progress.done}/${progress.total}</span>
        </div>
        <div class="checklist-items">
          ${(card.filteredItems || card.items).map(item => `
            <label class="check-row">
              <button
                type="button"
                class="check-box${state.persisted.checklist[item.id] ? ' checked' : ''}"
                data-check-id="${item.id}"
                aria-pressed="${state.persisted.checklist[item.id] ? 'true' : 'false'}"
                aria-labelledby="check-label-${item.id}"
              >
                ${state.persisted.checklist[item.id] ? '✓' : ''}
              </button>
<<<<<<< HEAD
              <span class="check-text" id="check-label-${item.id}">${esc(item.text)}</span>
            </div>
=======
              <span class="check-text">${item.text}</span>
            </label>
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
          `).join('')}
        </div>
      </article>
    `;
  }

<<<<<<< HEAD
  function showTab(tabId) {
    state.activeTab = tabId;
    window.location.hash = tabId;
    syncActiveTab();

    if (tabId === 'shopping') {
      refreshShoppingTab();
    }
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
=======
  function renderSystemPage(section) {
    return `
      <div class="page-heading">
        <span class="page-kicker">${section.label}</span>
        <h2 class="page-title">${section.title}</h2>
        <p class="page-sub">${section.subtitle}</p>
      </div>

      <div class="system-layout">
        <div class="page">
          <section class="system-hero">
            <span class="eyebrow">Painel local</span>
            <h2>Backup, auditoria e estado vivo deste navegador</h2>
            <p>${appProfile.singleUserNote}</p>
            <div class="system-actions">
              <button type="button" class="action-btn" data-action="export-backup">Exportar backup</button>
              <button type="button" class="action-btn-secondary" data-action="import-backup">Importar backup</button>
              <button type="button" class="ghost-btn" data-action="reset-state">Resetar estado</button>
            </div>
          </section>

          <section class="panel">
            <div class="section-header">
              <div>
                <span class="eyebrow">Auditoria</span>
                <h3>Metadados locais</h3>
              </div>
            </div>
            <div class="system-grid">
              <article class="meta-card">
                <span class="meta-card-label">Storage</span>
                <strong>v${state.persisted.version}</strong>
                <p>Chave versionada do estado local.</p>
              </article>
              <article class="meta-card">
                <span class="meta-card-label">Último registro</span>
                <strong>${formatAuditTimestamp(state.persisted.meta.lastUpdatedAt)}</strong>
                <p>Dado vivo salvo neste navegador.</p>
              </article>
              <article class="meta-card">
                <span class="meta-card-label">Estoque</span>
                <strong>${formatAuditTimestamp(state.persisted.meta.stockUpdatedAt)}</strong>
                <p>Última edição de quantidade.</p>
              </article>
              <article class="meta-card">
                <span class="meta-card-label">Checklist</span>
                <strong>${formatAuditTimestamp(state.persisted.meta.checklistUpdatedAt)}</strong>
                <p>Último toggle de protocolo.</p>
              </article>
              <article class="meta-card">
                <span class="meta-card-label">Modo PWA</span>
                <strong>${state.pwa.label}</strong>
                <p>${state.pwa.note}</p>
              </article>
              <article class="meta-card">
                <span class="meta-card-label">Planejamento</span>
                <strong>${appProfile.autonomyWindow}</strong>
                <p>${appProfile.monthlyBudget} · ${appProfile.purchaseStrategy}</p>
              </article>
            </div>
          </section>
        </div>

        <div class="page">
          <section class="panel">
            <div class="section-header">
              <div>
                <span class="eyebrow">Bunker</span>
                <h3>Infraestrutura de armazenagem</h3>
              </div>
            </div>
            <div class="storage-grid">
              ${storageContainers.map(container => `
                <article class="storage-card">
                  <strong>${container.label}</strong>
                  <p>${container.contents}</p>
                  <p>${container.quantity} un · ${container.totalVolume}</p>
                  <p>${container.note}</p>
                </article>
              `).join('')}
            </div>
          </section>

          <section class="panel">
            <div class="section-header">
              <div>
                <span class="eyebrow">Leitura do sistema</span>
                <h3>Dado, protocolo e hipótese</h3>
              </div>
            </div>
            <div class="governance-grid">
              ${appProfile.governanceCards.map(card => `
                <article class="governance-card">
                  <strong>${card.label}</strong>
                  <p>${card.body}</p>
                </article>
              `).join('')}
            </div>
            <p class="panel-copy">${appProfile.editorialCaveat}</p>
          </section>
        </div>
      </div>
    `;
  }

  function syncInventoryItemViews(itemId) {
    const item = getItemById(itemId);
    if (!item) {
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
      return;
    }

    const snapshot = computeStockSnapshot(item, state.persisted.stock[itemId] || 0);
<<<<<<< HEAD
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
    syncShoppingBadge();
=======

    document.querySelectorAll(`[data-coverage-for="${itemId}"]`).forEach(host => {
      host.innerHTML = renderCoverageBlock(snapshot);
    });

    document.querySelectorAll(`[data-status-for="${itemId}"]`).forEach(host => {
      host.innerHTML = renderStatusBadge(snapshot);
    });

    document.querySelectorAll(`.stock-input[data-item-id="${itemId}"]`).forEach(input => {
      if (input !== document.activeElement) {
        input.value = state.persisted.stock[itemId] || '';
      }
    });

    syncCategorySummary(item.categoryId);
    syncInventoryOverview();
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
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
    document.querySelectorAll(`[data-category-summary="${categoryId}"]`).forEach(host => {
      host.innerHTML = renderCategorySummaryCards(summarizeCategory(categoryId, state.persisted.stock));
    });
  }

  function syncInventoryOverview() {
    const host = document.querySelector('[data-inventory-overview]');
    if (!host) {
      return;
    }

    const summary = inventorySections.reduce((accumulator, categorySection) => {
      const categorySummary = summarizeCategory(categorySection.id, state.persisted.stock);
      accumulator.total += categorySummary.total;
      accumulator.ok += categorySummary.ok;
      accumulator.warn += categorySummary.warn;
      accumulator.alert += categorySummary.alert;
      accumulator.toBuy += categorySummary.toBuy;
      return accumulator;
    }, {
      total: 0,
      ok: 0,
      warn: 0,
      alert: 0,
      toBuy: 0,
    });

<<<<<<< HEAD
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
=======
    host.innerHTML = renderInventoryOverviewCards(summary);
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
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
    shoppingListText.textContent = buildShoppingListText(groups);
    modal.removeAttribute('hidden');
  }

  function buildShoppingListText(groups) {
    if (!groups.length) {
      return 'Tudo verde. Nenhum item abaixo do estoque ideal.';
    }

    return [
      'LISTA DE COMPRAS · CODEX DE RESILIÊNCIA DOMÉSTICA',
      `Gerada em ${new Date().toLocaleDateString('pt-BR')}`,
      '',
      ...groups.flatMap(group => {
        return [
          `${group.label.toUpperCase()} · ${group.items.length} item(ns)`,
          ...group.items.map(item => {
            const marker = item.status === 'alert' ? '🔴' : '🟡';
            return `${marker} ${item.label} · comprar ${item.targetToBuyLabel} · atual ${formatQuantity(item.current, item.unit)}`;
          }),
          '',
<<<<<<< HEAD
        ]),
      ].join('\n');
    }

    modal.showModal();
=======
        ];
      }),
    ].join('\n');
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
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
<<<<<<< HEAD
    renderNavigation();
    showToast('Estado resetado. Um backup automático do estado anterior foi salvo.', 'warn');
=======
    showToast('Estado local resetado.', 'warn');
  }

  function showTab(tabId) {
    if (tabId === state.activeTab || !getUiSection(tabId)) {
      return;
    }

    state.activeTab = tabId;
    window.location.hash = tabId;
    renderNavigation();
    renderMain();
    window.scrollTo({ top: 0, behavior: 'smooth' });
>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
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

<<<<<<< HEAD
=======
  function syncSearchUi() {
    const hasQuery = Boolean(state.searchQuery.trim());
    searchInput.value = state.searchQuery;
    searchClear.hidden = !hasQuery;
  }

  function clearSearch() {
    state.searchQuery = '';
    syncSearchUi();
    renderMain();
    searchInput.focus();
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
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getChecklistProgress(card) {
    const source = card.filteredItems || card.items;
    const done = source.filter(item => state.persisted.checklist[item.id]).length;
    return { done, total: source.length };
  }

  function groupBy(items, key) {
    return items.reduce((groups, item) => {
      const groupKey = item[key];
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  function matchesInventoryItem(item) {
    const query = normalizedQuery();
    if (!query) {
      return true;
    }

    return [
      item.label,
      item.note,
      item.group,
      item.tags.join(' '),
      getCategoryName(item.categoryId),
      item.purchaseCycle,
    ].some(chunk => String(chunk || '').toLowerCase().includes(query));
  }

  function matchesProtocolItem(text) {
    const query = normalizedQuery();
    if (!query) {
      return true;
    }

    return String(text || '').toLowerCase().includes(query);
  }

  function normalizedQuery() {
    return state.searchQuery.trim().toLowerCase();
  }

  function getSearchResults() {
    return inventorySections.flatMap(section => {
      return getItemsByCategory(section.id)
        .filter(matchesInventoryItem)
        .map(item => computeStockSnapshot(item, state.persisted.stock[item.id] || 0));
    }).sort((left, right) => {
      if (left.statusRank !== right.statusRank) {
        return left.statusRank - right.statusRank;
      }

      return left.label.localeCompare(right.label, 'pt-BR');
    }).slice(0, 6);
  }

  function renderSearchResultCard(snapshot) {
    return `
      <article class="search-result-card">
        <div class="search-result-top">
          <div>
            <div class="search-result-title">${snapshot.label}</div>
            <div class="text-muted">${getCategoryName(snapshot.categoryId)} · ${snapshot.purchaseCycleLabel}</div>
          </div>
          ${renderStatusBadge(snapshot)}
        </div>
        <div class="tag-row">
          ${snapshot.tags.map(tag => `<span class="mini-tag">${tag}</span>`).join('')}
        </div>
        <div class="coverage-block" style="margin-top:14px">
          <div class="coverage-main">${snapshot.coverage}</div>
          <div class="coverage-sub">${snapshot.targetToBuyLabel ? `Comprar ${snapshot.targetToBuyLabel}` : 'Sem recomposição agora'}</div>
        </div>
      </article>
    `;
  }

  function buildTodayHeadline(criticalCount, weeklyGroup) {
    if (criticalCount > 0) {
      return `${criticalCount} ponto(s) pedem recomposição antes do próximo giro.`;
    }

    if (weeklyGroup && weeklyGroup.items.length) {
      return `A feira da semana já pode ser preparada com calma.`;
    }

    return 'A casa está estável e pronta para o próximo ciclo.';
  }

  function buildTodayCopy(listCount, pendingChecklist) {
    if (listCount === 0 && pendingChecklist === 0) {
      return 'Estoque e protocolos estão em bom estado. Use a home como conferência rápida e siga a rotina sem ruído.';
    }

    return `${listCount} item(ns) ainda pedem compra e ${pendingChecklist} ponto(s) de protocolo continuam em aberto. A proposta aqui é agir sem planilha mental.`;
  }

  function renderCycleMeta(item, snapshot) {
    if (item.stockMode === 'recurring') {
      return `${formatQuantity(item.monthlyUsage, item.unit)} / mês · ${snapshot.purchaseCycleLabel}`;
    }

    return `Reserva de segurança · ${snapshot.purchaseCycleLabel}`;
  }

  function getFilteredShoppingGroups() {
    const query = normalizedQuery();
    if (!query) {
      return groupShoppingList(state.persisted.stock);
    }

    return groupShoppingList(state.persisted.stock)
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          return [
            item.label,
            item.note,
            item.group,
            item.tags.join(' '),
            getCategoryName(item.categoryId),
            group.label,
          ].some(chunk => String(chunk || '').toLowerCase().includes(query));
        }),
      }))
      .filter(group => group.items.length > 0);
  }

  function getCategoryName(categoryId) {
    const section = categoryMap[categoryId];
    return section ? section.title : categoryId;
  }

  function getUiSection(tabId) {
    return uiSections.find(section => section.id === tabId);
  }

  function getCycleFallbackLabel(cycle) {
    if (cycle === 'feira-semanal') {
      return 'Feira semanal';
    }

    if (cycle === 'contingencia-rural') {
      return 'Contingência rural';
    }

    return 'Atacado mensal';
  }

>>>>>>> 88f0085 (feat: redesign app shell and harden local state)
  function detectPwaStatus() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

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

    navigator.serviceWorker.register('./service-worker.js').catch(error => {
      console.warn('Service worker não pôde ser registrado.', error);
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

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
