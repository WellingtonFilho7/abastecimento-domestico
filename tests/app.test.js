const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const appSource = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const domain = require('../domain.js');
const state = require('../state.js');

function createAppDom({ hash = '', localStorageSeed = {} } = {}) {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: `http://localhost/${hash ? `#${hash}` : ''}`,
  });

  const { window } = dom;

  window.CodexDomain = domain;
  window.CodexState = state;
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false; },
  });
  window.navigator.serviceWorker = {
    register() {
      return Promise.resolve({});
    },
  };
  window.navigator.clipboard = {
    writeText() {
      return Promise.resolve();
    },
  };
  window.navigator.standalone = false;
  window.scrollTo = () => {};
  window.confirm = () => true;
  window.URL.createObjectURL = () => 'blob:test';
  window.URL.revokeObjectURL = () => {};

  Object.entries(localStorageSeed).forEach(([key, value]) => {
    window.localStorage.setItem(key, value);
  });

  window.eval(appSource);
  return dom;
}

function click(window, element) {
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

function type(window, input, value) {
  input.value = value;
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
}

test('boots into the Estoque page by default', () => {
  const dom = createAppDom();
  const { document } = dom.window;

  assert.equal(document.body.dataset.tab, 'estoque');
  assert.ok(document.querySelector('.summary-chip'));
  assert.ok(document.querySelector('.item-row'));
});

test('search shows matching inventory results from the estoque page', () => {
  const dom = createAppDom();
  const { window } = dom;
  const { document } = window;
  const search = document.getElementById('inventory-search');

  type(window, search, 'arroz');

  const main = document.getElementById('app-main');
  assert.match(main.textContent, /Arroz branco/i);
});

test('shopping action opens the shopping list modal', () => {
  const dom = createAppDom();
  const { window } = dom;
  const { document } = window;
  const trigger = document.querySelector('[data-action="shopping-list"]');
  const modal = document.getElementById('shopping-modal');

  assert.ok(modal.hasAttribute('hidden'));
  click(window, trigger);

  assert.equal(modal.hasAttribute('hidden'), false);
  assert.match(document.getElementById('shopping-list-text').textContent, /LISTA DE COMPRAS/i);
});

test('shopping list text is clean for copy and paste without visual markers', () => {
  const dom = createAppDom();
  const { window } = dom;
  const { document } = window;
  const trigger = document.querySelector('[data-action="shopping-list"]');

  click(window, trigger);

  const text = document.getElementById('shopping-list-text').textContent;

  assert.doesNotMatch(text, /🔴|🟡|• /);
  assert.match(text, /FEIRA SEMANAL|ATACADO MENSAL|CONTINGENCIA RURAL|CONTINGÊNCIA RURAL/i);
  assert.match(text, /Arroz branco|Leite sem lactose|Papel higiênico/i);
});

test('updating stock changes coverage and status in inventory UI', () => {
  const dom = createAppDom();
  const { window } = dom;
  const { document } = window;

  const input = document.querySelector('.stock-input[data-item-id="arroz-branco"]');
  type(window, input, '4');

  assert.match(document.body.dataset.tab, /estoque/i);
  assert.match(document.querySelector('[data-coverage-for="arroz-branco"]').textContent, /15d/i);
  assert.match(document.querySelector('[data-status-for="arroz-branco"]').textContent, /Atenção/i);
});
