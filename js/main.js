// Берёт данные из CLINIC (см. config.js) и подставляет в HTML.
// Поддерживает:
//   data-bind="path"                   — подставить текст
//   data-bind-attr="attr|prefix|path"  — установить атрибут (prefix может быть пустым)
//   data-list="path" data-template="id" — отрендерить массив через <template>
//   data-options="path"                — заполнить <select> опциями {value,label}
//   data-section="key"                 — скрыть секцию если sections[key] === false

(function () {
  'use strict';

  // === вспомогательные ===
  function getByPath(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce(function (acc, k) {
      return acc != null ? acc[k] : undefined;
    }, obj);
  }

  function bindText(root, ctx) {
    root.querySelectorAll('[data-bind]').forEach(function (el) {
      // вложенный элемент шаблона может содержать своё data-bind — пропустим если он внутри template
      if (el.closest('template')) return;
      var path = el.dataset.bind;
      var value = getByPath(ctx, path);
      if (value != null) el.textContent = value;
    });
  }

  function bindAttrs(root, ctx) {
    root.querySelectorAll('[data-bind-attr]').forEach(function (el) {
      if (el.closest('template')) return;
      var spec = el.dataset.bindAttr;
      if (!spec) return;
      var parts = spec.split('|');
      if (parts.length < 2) return;
      var attr = parts[0];
      var prefix = parts[1] || '';
      var path = parts.slice(2).join('|');
      var value = getByPath(ctx, path);
      if (value != null) el.setAttribute(attr, prefix + value);
    });
  }

  function fillOptions(root, ctx) {
    root.querySelectorAll('[data-options]').forEach(function (el) {
      var path = el.dataset.options;
      var arr = getByPath(ctx, path);
      if (!Array.isArray(arr)) return;
      el.innerHTML = '';
      arr.forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        el.appendChild(o);
      });
    });
  }

  function renderLists(ctx) {
    document.querySelectorAll('[data-list]').forEach(function (host) {
      var listPath = host.dataset.list;
      var tplId = host.dataset.template;
      if (!listPath || !tplId) return;
      var arr = getByPath(ctx, listPath);
      if (!Array.isArray(arr)) return;
      var tpl = document.getElementById(tplId);
      if (!tpl) return;

      host.innerHTML = '';
      arr.forEach(function (item) {
        var clone = tpl.content.cloneNode(true);
        // подставим текст и атрибуты внутри клона, используя сам item как контекст
        clone.querySelectorAll('[data-bind]').forEach(function (el) {
          var v = getByPath(item, el.dataset.bind);
          if (v != null) el.textContent = v;
        });
        clone.querySelectorAll('[data-bind-attr]').forEach(function (el) {
          var parts = el.dataset.bindAttr.split('|');
          var attr = parts[0];
          var prefix = parts[1] || '';
          var path = parts.slice(2).join('|');
          var v = getByPath(item, path);
          if (v != null) el.setAttribute(attr, prefix + v);
        });
        host.appendChild(clone);
      });
    });
  }

  function applySectionFlags(ctx) {
    var flags = ctx.sections || {};
    document.querySelectorAll('[data-section]').forEach(function (el) {
      var key = el.dataset.section;
      if (flags[key] === false) el.style.display = 'none';
    });
  }

  function applyBrandColors(ctx) {
    var root = document.documentElement;
    if (ctx.brandColor) root.style.setProperty('--brand-primary', ctx.brandColor);
    if (ctx.brandColorDark) root.style.setProperty('--brand-dark', ctx.brandColorDark);
    if (ctx.accentColor) root.style.setProperty('--brand-accent', ctx.accentColor);
  }

  function init() {
    if (typeof CLINIC === 'undefined') {
      console.error('CLINIC не найден. Проверьте js/config.js');
      return;
    }
    applyBrandColors(CLINIC);
    applySectionFlags(CLINIC);
    bindText(document, CLINIC);
    bindAttrs(document, CLINIC);
    fillOptions(document, CLINIC);
    renderLists(CLINIC);
    // повторно — на случай data-bind-attr внутри отрендеренных карточек, ссылающихся на корневой CLINIC
    bindAttrs(document, CLINIC);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
