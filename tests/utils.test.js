const test = require('node:test');
const assert = require('node:assert/strict');

const {
  escapeHtml,
  debounce,
  groupBy,
  formatAuditTimestamp,
  getChecklistProgress,
} = require('../utils.js');

test('escapeHtml escapes ampersand', () => {
  assert.equal(escapeHtml('A & B'), 'A &amp; B');
});

test('escapeHtml escapes angle brackets', () => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});

test('escapeHtml escapes single quotes', () => {
  assert.equal(escapeHtml("it's"), 'it&#39;s');
});

test('escapeHtml handles null and undefined', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
});

test('escapeHtml coerces numbers to string', () => {
  assert.equal(escapeHtml(42), '42');
  assert.equal(escapeHtml(0), '0');
});

test('escapeHtml returns empty string for empty input', () => {
  assert.equal(escapeHtml(''), '');
});

test('escapeHtml handles strings with no special characters', () => {
  assert.equal(escapeHtml('hello world'), 'hello world');
});

test('debounce delays execution', (_, done) => {
  let callCount = 0;
  const debounced = debounce(() => { callCount++; }, 50);

  debounced();
  debounced();
  debounced();

  assert.equal(callCount, 0);

  setTimeout(() => {
    assert.equal(callCount, 1);
    done();
  }, 100);
});

test('debounce cancel prevents execution', (_, done) => {
  let callCount = 0;
  const debounced = debounce(() => { callCount++; }, 50);

  debounced();
  debounced.cancel();

  setTimeout(() => {
    assert.equal(callCount, 0);
    done();
  }, 100);
});

test('debounce flush triggers immediate execution', () => {
  let callCount = 0;
  const debounced = debounce(() => { callCount++; }, 500);

  debounced();
  debounced.flush();

  assert.equal(callCount, 1);
});

test('groupBy groups items by key', () => {
  const items = [
    { name: 'a', group: 'x' },
    { name: 'b', group: 'y' },
    { name: 'c', group: 'x' },
  ];

  const result = groupBy(items, 'group');

  assert.equal(Object.keys(result).length, 2);
  assert.equal(result.x.length, 2);
  assert.equal(result.y.length, 1);
});

test('groupBy uses fallback for missing keys', () => {
  const items = [
    { name: 'a', group: 'x' },
    { name: 'b' },
  ];

  const result = groupBy(items, 'group');

  assert.equal(result['Outros'].length, 1);
  assert.equal(result['Outros'][0].name, 'b');
});

test('groupBy handles empty array', () => {
  const result = groupBy([], 'group');
  assert.deepEqual(result, {});
});

test('formatAuditTimestamp returns Nunca for null', () => {
  assert.equal(formatAuditTimestamp(null), 'Nunca');
  assert.equal(formatAuditTimestamp(undefined), 'Nunca');
  assert.equal(formatAuditTimestamp(''), 'Nunca');
});

test('formatAuditTimestamp returns Nunca for invalid date', () => {
  assert.equal(formatAuditTimestamp('not-a-date'), 'Nunca');
});

test('formatAuditTimestamp formats valid ISO date', () => {
  const result = formatAuditTimestamp('2025-01-15T10:30:00.000Z');
  assert.ok(result !== 'Nunca');
  assert.ok(result.length > 0);
});

test('getChecklistProgress counts checked items', () => {
  const card = {
    items: [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ],
  };
  const checklist = { a: true, c: true };

  const result = getChecklistProgress(card, checklist);

  assert.equal(result.done, 2);
  assert.equal(result.total, 3);
});

test('getChecklistProgress handles empty checklist', () => {
  const card = {
    items: [{ id: 'a' }, { id: 'b' }],
  };

  const result = getChecklistProgress(card, {});

  assert.equal(result.done, 0);
  assert.equal(result.total, 2);
});

test('getChecklistProgress handles all checked', () => {
  const card = {
    items: [{ id: 'a' }, { id: 'b' }],
  };

  const result = getChecklistProgress(card, { a: true, b: true });

  assert.equal(result.done, 2);
  assert.equal(result.total, 2);
});
