const test = require('node:test');
const assert = require('node:assert/strict');

const {
  inventoryItems,
  computeStockSnapshot,
  buildShoppingList,
  groupShoppingList,
  getItemById,
  summarizeCategory,
} = require('../domain.js');

test('computes recurring stock with days and warning status', () => {
  const item = getItemById('arroz-branco');

  const snapshot = computeStockSnapshot(item, 4);

  assert.equal(snapshot.days, 15);
  assert.equal(snapshot.status, 'warn');
  assert.equal(snapshot.targetToBuy, 4);
});

test('computes contingency stock without days using min and ideal targets', () => {
  const item = getItemById('paracetamol');

  const snapshot = computeStockSnapshot(item, 1);

  assert.equal(snapshot.days, null);
  assert.equal(snapshot.status, 'warn');
  assert.equal(snapshot.targetToBuy, 1);
});

test('builds shopping list with quantity deltas and critical items first', () => {
  const baseline = Object.fromEntries(
    inventoryItems.map(item => [item.id, item.idealStock])
  );

  const list = buildShoppingList({
    ...baseline,
    'folhosas-feira': 1,
    'paracetamol': 0,
    'arroz-branco': 4,
  });

  assert.equal(list.length, 3);
  assert.equal(list[0].id, 'folhosas-feira');
  assert.equal(list[0].targetToBuy, 4);
  assert.equal(list[0].purchaseCycle, 'feira-semanal');
  assert.equal(list[1].id, 'paracetamol');
  assert.equal(list[1].targetToBuy, 2);
  assert.equal(list[2].id, 'arroz-branco');
  assert.equal(list[2].targetToBuy, 4);
});

test('inventory catalog is normalized enough for rendering and persistence', () => {
  assert.ok(inventoryItems.length >= 25);

  for (const item of inventoryItems) {
    assert.ok(item.id);
    assert.ok(item.categoryId);
    assert.ok(item.unit);
    assert.ok(typeof item.idealStock === 'number');
    assert.ok(typeof item.minimumStock === 'number');
    assert.ok(item.idealStock >= item.minimumStock);
    assert.ok(['recurring', 'contingency'].includes(item.stockMode));
    assert.ok(Array.isArray(item.tags));
  }
});

test('summarizes a category for fast section-level decisions', () => {
  const baseline = Object.fromEntries(
    inventoryItems.map(item => [item.id, item.idealStock])
  );

  const summary = summarizeCategory('pantry', {
    ...baseline,
    'arroz-branco': 4,
    'feijao': 0,
  });

  assert.equal(summary.total, inventoryItems.filter(item => item.categoryId === 'pantry').length);
  assert.equal(summary.alert, 1);
  assert.equal(summary.warn, 1);
  assert.ok(summary.toBuy > 0);
});

test('groups shopping list by purchase cycle for execution in the field', () => {
  const baseline = Object.fromEntries(
    inventoryItems.map(item => [item.id, item.idealStock])
  );

  const groups = groupShoppingList({
    ...baseline,
    'folhosas-feira': 1,
    'paracetamol': 0,
    'arroz-branco': 4,
  });

  assert.equal(groups.length, 3);
  assert.equal(groups[0].cycle, 'feira-semanal');
  assert.equal(groups[1].cycle, 'contingencia-rural');
  assert.equal(groups[2].cycle, 'atacado-mensal');
  assert.equal(groups[0].items[0].id, 'folhosas-feira');
});
