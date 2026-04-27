// Берёт данные из CLINIC (см. config.js) и подставляет в HTML.
// Поддерживает:
//   data-bind="path"                   — подставить текст
//   data-bind-attr="attr|prefix|path"  — установить атрибут (prefix может быть пустым)
//   data-list="path" data-template="id" — отрендерить массив через <template>
//   data-options="path"                — заполнить <select> опциями {value,label}
//   data-section="key"                 — скрыть секцию если sections[key] === false
//   data-icon="path"                   — подставить SVG-иконку из ICONS по имени из поля

(function () {
  'use strict';

  // SVG-иконки Lucide (https://lucide.dev) — currentColor наследует цвет родителя
  const ICONS = {
    'users':      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'star':       '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'shield':     '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    'file-check': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>',
    'cpu':        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="14" x2="4" y2="14"/></svg>',
    'calendar':   '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  };

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
        clone.querySelectorAll('[data-icon]').forEach(function (el) {
          var iconName = getByPath(item, el.dataset.icon);
          if (iconName && ICONS[iconName]) el.innerHTML = ICONS[iconName];
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
