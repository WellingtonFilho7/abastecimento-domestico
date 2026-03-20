(function defineCodexUtils(root, factory) {
  const exportsObject = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObject;
  }

  root.CodexUtils = exportsObject;
})(typeof globalThis !== 'undefined' ? globalThis : self, function buildUtils() {

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(fn, ms) {
    let timer = null;

    function debounced() {
      const context = this;
      const args = arguments;

      clearTimeout(timer);
      timer = setTimeout(function runDebounced() {
        fn.apply(context, args);
      }, ms);
    }

    debounced.cancel = function cancel() {
      clearTimeout(timer);
      timer = null;
    };

    debounced.flush = function flush() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
        fn();
      }
    };

    return debounced;
  }

  function groupBy(items, key) {
    return items.reduce(function accumulate(groups, item) {
      var groupKey = item[key] || 'Outros';
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  function formatAuditTimestamp(value) {
    if (!value) {
      return 'Nunca';
    }

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Nunca';
    }

    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  function getChecklistProgress(card, checklist) {
    var done = card.items.filter(function isChecked(item) {
      return checklist[item.id];
    }).length;

    return { done: done, total: card.items.length };
  }

  return {
    escapeHtml: escapeHtml,
    debounce: debounce,
    groupBy: groupBy,
    formatAuditTimestamp: formatAuditTimestamp,
    getChecklistProgress: getChecklistProgress,
  };
});
