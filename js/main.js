// Берёт данные из CLINIC (см. config.js) и подставляет в HTML.
// Поддерживает:
//   data-bind="path"                   — подставить текст
//   data-bind-attr="attr|prefix|path"  — установить атрибут (prefix может быть пустым)
//                                        несколько атрибутов через запятую: "src||image,alt||title"
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
    'calendar':   '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    'tooth':      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8c0-3 2.5-6 5-6 1 0 1.5.5 2 .5s1-.5 2-.5c2.5 0 5 3 5 6 0 1.5-.3 3-.7 4.4l-1.3 5.6c-.3 1.5-.8 4-2 4s-1.3-2.5-1.7-4.5-.5-3-1.3-3-1 1-1.3 3-.5 4.5-1.7 4.5-1.7-2.5-2-4l-1.3-5.6C5.3 11 5 9.5 5 8z"/></svg>',
    'map-pin':    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    'clock':      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'phone':      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    'arrow-right':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    'yandex-marker':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FC3F1D" d="M12 2C7.6 2 4 5.6 4 10c0 5.5 7 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8z"/><text x="12" y="13.5" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" fill="#fff" font-size="10">Я</text></svg>',
    'stethoscope':'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg>',
    'smile':      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    'sparkles':   '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>',
    'award':      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>',
    'microscope': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>',
    'trophy':     '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    'syringe':    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>',
    'crown':      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>',
    'baby':       '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>',
    'help-circle':'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'whatsapp':   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>',
    'telegram':   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    'vk':         '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.075 14.27h-1.46c-.55 0-.722-.44-1.71-1.43-.857-.83-1.226-.94-1.44-.94-.296 0-.378.083-.378.486v1.31c0 .345-.11.554-1.018.554-1.5 0-3.16-.91-4.33-2.6-1.762-2.474-2.244-4.337-2.244-4.717 0-.207.083-.4.487-.4h1.46c.36 0 .493.165.633.55.715 2.075 1.91 3.89 2.4 3.89.184 0 .267-.083.267-.55v-2.146c-.055-.985-.578-1.07-.578-1.42 0-.166.137-.332.358-.332h2.295c.305 0 .413.165.413.523v2.89c0 .304.137.41.222.41.183 0 .333-.106.668-.44 1.034-1.158 1.768-2.94 1.768-2.94.097-.207.262-.4.62-.4h1.46c.44 0 .536.227.44.523-.184.846-1.957 3.347-1.957 3.347-.152.247-.21.358 0 .633.151.207.65.633.98 1.018.605.69 1.07 1.27 1.197 1.673.123.398-.082.605-.482.605z"/></svg>'
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

  function applyBindAttrSpec(el, spec, ctx) {
    spec.split(',').forEach(function (one) {
      var parts = one.split('|');
      if (parts.length < 2) return;
      var attr = parts[0].trim();
      var prefix = parts[1] || '';
      var path = parts.slice(2).join('|');
      var value = getByPath(ctx, path);
      if (value != null) el.setAttribute(attr, prefix + value);
    });
  }

  function bindAttrs(root, ctx) {
    root.querySelectorAll('[data-bind-attr]').forEach(function (el) {
      if (el.closest('template')) return;
      var spec = el.dataset.bindAttr;
      if (spec) applyBindAttrSpec(el, spec, ctx);
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
          applyBindAttrSpec(el, el.dataset.bindAttr, item);
        });
        clone.querySelectorAll('[data-icon]').forEach(function (el) {
          var iconName = getByPath(item, el.dataset.icon);
          if (iconName && ICONS[iconName]) el.innerHTML = ICONS[iconName];
        });
        host.appendChild(clone);
      });
    });
  }

  // Подставляет SVG-иконки в статичный HTML.
  // data-icon="имя" — имя берётся напрямую из ICONS.
  // (В renderLists другая логика: там data-icon="поле" и значение поля берётся из item.)
  function bindIcons(root) {
    root.querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.closest('template')) return;
      var iconName = el.dataset.icon;
      if (iconName && ICONS[iconName]) el.innerHTML = ICONS[iconName];
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

  // Stagger-появление карточек при скролле через IntersectionObserver.
  // Принимает CSS-селектор. Если IO нет — сразу показываем всё.
  function setupCardStagger(selector) {
    var cards = document.querySelectorAll(selector);
    if (!cards.length) return;
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach(function (c) { observer.observe(c); });
  }

  // Карусель на мобильных: точки-индикаторы + бесшовная зацикленность.
  // Клонирует первую и последнюю карточки и подкладывает в конец/начало.
  // При прокрутке к клону незаметно перепрыгивает на оригинал — ощущение infinite loop.
  // Универсальная: принимает селектор грида, селектор карточки, id контейнера точек,
  // классы для клона и точки, текст aria-label.
  function setupCarousel(opts) {
    var grid = document.querySelector(opts.gridSelector);
    var dotsContainer = document.getElementById(opts.dotsId);
    if (!grid || !dotsContainer) return;
    var realCards = Array.from(grid.querySelectorAll(opts.cardSelector));
    if (realCards.length < 2) return;

    // Клонируем крайние карточки для бесшовного цикла
    var firstClone = realCards[0].cloneNode(true);
    var lastClone = realCards[realCards.length - 1].cloneNode(true);
    firstClone.classList.add(opts.cloneClass);
    lastClone.classList.add(opts.cloneClass);
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    // Убираем фокусируемость у клонов (фикс Lighthouse aria-hidden-focus):
    // если карточка-клон сама <a>, и любые внутренние <a>/<button> — все получают tabindex=-1
    [firstClone, lastClone].forEach(function (clone) {
      if (clone.matches('a, button, [tabindex]')) clone.setAttribute('tabindex', '-1');
      clone.querySelectorAll('a, button, [tabindex]').forEach(function (el) {
        el.setAttribute('tabindex', '-1');
      });
    });
    grid.insertBefore(lastClone, realCards[0]);
    grid.appendChild(firstClone);

    // Точки — по числу реальных карточек
    realCards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = opts.dotClass;
      dot.setAttribute('aria-label', opts.ariaLabelPrefix + (i + 1));
      dotsContainer.appendChild(dot);
    });
    var dots = Array.from(dotsContainer.querySelectorAll('.' + opts.dotClass));

    function isMobile() {
      if (opts.alwaysCarousel) return true; // карусель всегда активна (используется в Отзывах)
      return window.matchMedia('(max-width: 640px)').matches;
    }
    function getSlideWidth() {
      var gap = parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap || '0');
      return realCards[0].offsetWidth + (isNaN(gap) ? 0 : gap);
    }
    function setInitialPosition() {
      if (!isMobile()) { grid.scrollLeft = 0; return; }
      grid.scrollLeft = getSlideWidth(); // встаём на первый реальный слайд
    }
    function activeIndex() {
      var w = getSlideWidth();
      if (w === 0) return 0;
      var idx = Math.round(grid.scrollLeft / w) - 1; // -1 = клон последнего, 0..N-1 = реальные, N = клон первого
      if (idx < 0) return realCards.length - 1;
      if (idx >= realCards.length) return 0;
      return idx;
    }
    function updateDots() {
      var idx = activeIndex();
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    }

    // При прыжке на оригинал нужно временно убрать smooth scroll —
    // иначе scroll-behavior: smooth из CSS делает скачок плавным
    // и пользователь видит "возврат" вместо бесшовного цикла.
    function jumpTo(scrollLeft) {
      jumping = true;
      var prev = grid.style.scrollBehavior;
      grid.style.scrollBehavior = 'auto';
      grid.scrollLeft = scrollLeft;
      // Возвращаем smooth через 2 RAF — чтобы браузер успел применить jump без анимации
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          grid.style.scrollBehavior = prev;
          jumping = false;
        });
      });
    }

    var jumping = false;
    grid.addEventListener('scroll', function () {
      if (jumping || !isMobile()) return;
      updateDots();
      var w = getSlideWidth();
      var max = grid.scrollWidth - grid.clientWidth;
      // Достигли клона в конце → мгновенный прыжок на первый реальный
      if (grid.scrollLeft >= max - 4) {
        jumpTo(w);
      }
      // Достигли клона в начале → мгновенный прыжок на последний реальный
      else if (grid.scrollLeft <= 4) {
        jumpTo(w * realCards.length);
      }
    }, { passive: true });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        var w = getSlideWidth();
        grid.scrollTo({ left: (i + 1) * w, behavior: 'smooth' });
      });
    });

    // Стрелки prev/next (опционально — используются в Отзывах на десктопе)
    function step(delta) {
      var w = getSlideWidth();
      grid.scrollBy({ left: delta * w, behavior: 'smooth' });
    }
    if (opts.prevId) {
      var prevBtn = document.getElementById(opts.prevId);
      if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    }
    if (opts.nextId) {
      var nextBtn = document.getElementById(opts.nextId);
      if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });
    }

    window.addEventListener('resize', function () {
      setInitialPosition();
      updateDots();
    });

    // Первичная установка после рендера и применения CSS
    requestAnimationFrame(function () {
      setInitialPosition();
      updateDots();
    });
  }

  // Hero-карусель: 3 фото в .hero__photo-stack меняются каждые 5 секунд
  // через переключение класса .is-active. Ken-burns-эффект (медленный zoom)
  // задан в CSS @keyframes hero-ken-burns. Если фото меньше 2 — выходим.
  function setupHeroCarousel() {
    var photos = document.querySelectorAll('.hero__photo-stack .hero__photo');
    if (photos.length < 2) {
      // одно фото — просто показываем без карусели
      if (photos[0]) photos[0].classList.add('is-active');
      return;
    }
    var current = 0;
    photos[0].classList.add('is-active');
    setInterval(function () {
      photos[current].classList.remove('is-active');
      current = (current + 1) % photos.length;
      photos[current].classList.add('is-active');
    }, 5000);
  }

  // Count-up анимация чисел Hero-статистики (от 0 до целевого значения).
  // Запускается через IntersectionObserver когда Hero попадает в viewport.
  // Поддерживает целые числа, дробные (через .) и суффиксы (+, ₽, и т.д.)
  function setupStatCountUp() {
    var stats = document.querySelectorAll('.stat__value');
    if (!stats.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStatValue(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function (s) { observer.observe(s); });
  }
  function animateStatValue(el) {
    var raw = el.textContent.trim();
    // Убираем пробелы (для чисел вида «10 000+») — иначе regex их не примет
    var clean = raw.replace(/\s/g, '');
    var match = clean.match(/^([\d.]+)(\D*)$/);
    if (!match) return;
    var target = parseFloat(match[1]);
    var suffix = match[2] || '';
    var isFloat = clean.indexOf('.') !== -1;
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic — мягкое завершение
      var current = target * eased;
      // Числа ≥1000 форматируем с пробелом (10000 → 10 000) — русский стандарт
      var num = isFloat ? current.toFixed(1) : Math.round(current);
      if (!isFloat && num >= 1000) num = num.toLocaleString('ru-RU');
      el.textContent = num + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Магнитная кнопка: при движении мыши над .btn--magnetic кнопка
  // тянется к курсору на 20% от смещения. На тач-устройствах отключено.
  function setupMagneticButton() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.btn--magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        var y = (e.clientY - rect.top - rect.height / 2) * 0.2;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // Перехватывает submit формы лид-магнита: показывает inline-сообщение
  // об успехе вместо window.alert(). В рабочей версии сюда добавится
  // отправка данных менеджеру (через API/email/CRM).
  // Дополнительно:
  //  - Меняет type/placeholder input в зависимости от выбранного канала
  //    (WhatsApp/Telegram → tel, Email → email).
  //  - Submit-кнопка disabled пока не отмечен чекбокс согласия.
  //  - В success-сообщение подставляется выбранный канал в правильном падеже
  //    (channelLabel из config: «в WhatsApp» / «в Telegram» / «на почту»).
  function setupLeadForm() {
    var lm = (typeof CLINIC !== 'undefined' && CLINIC.leadMagnet) || {};
    var channels = Array.isArray(lm.channels) ? lm.channels : [];
    var template = lm.successTextTemplate ||
      'Готово! PDF отправили {channel}. Проверьте сообщения.';

    function findChannel(value) {
      for (var i = 0; i < channels.length; i++) {
        if (channels[i].value === value) return channels[i];
      }
      return null;
    }

    document.querySelectorAll('[data-form="lead"]').forEach(function (form) {
      var select = form.querySelector('.lead-form__select');
      var input = form.querySelector('.lead-form__input');
      var checkbox = form.querySelector('.lead-form__check-input');
      var submitBtn = form.querySelector('button[type="submit"]');
      var success = form.querySelector('.lead-form__success');

      // Динамический placeholder/type по выбранному каналу
      if (select && input) {
        select.addEventListener('change', function () {
          var ch = findChannel(select.value);
          if (!ch) return;
          if (ch.type) input.type = ch.type;
          if (ch.placeholder) input.placeholder = ch.placeholder;
          input.value = ''; // старое значение может не подходить под новый формат
        });
      }

      // Disabled-кнопка пока чекбокс согласия не отмечен
      if (checkbox && submitBtn) {
        submitBtn.disabled = !checkbox.checked;
        checkbox.addEventListener('change', function () {
          submitBtn.disabled = !checkbox.checked;
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!success) return;
        var ch = findChannel(select ? select.value : '');
        var label = (ch && ch.channelLabel) || 'на ваш контакт';
        success.textContent = template.replace('{channel}', label);
        success.hidden = false;
      });
    });
  }

  // Квиз диагностики с реактивным прогрессом и меняющимся CTA.
  // Стартовое состояние: progress 0%, label «Выберите свою ситуацию», CTA дефолтный.
  // После клика на опцию: progress 50% + label «Шаг 1 из 2 — записывайтесь»,
  // CTA берёт текст из data-cta выбранной опции (поле ctaLabel в config).
  function setupDiagnosisOptions() {
    var options = document.querySelectorAll('.diagnosis-option');
    if (!options.length) return;
    var section = document.querySelector('.section--diagnosis');
    var progressBar = section ? section.querySelector('.progress-bar') : null;
    var progressFill = progressBar ? progressBar.querySelector('.progress-bar__fill') : null;
    var progressLabel = section ? section.querySelector('.progress-bar__label') : null;
    var cta = document.querySelector('.diagnosis__cta');

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) {
          o.classList.remove('is-active');
          o.setAttribute('aria-pressed', 'false');
        });
        opt.classList.add('is-active');
        opt.setAttribute('aria-pressed', 'true');

        if (progressFill) progressFill.style.width = '50%';
        if (progressBar) progressBar.setAttribute('aria-valuenow', '50');
        if (progressLabel) progressLabel.textContent = 'Шаг 1 из 2 — записывайтесь';

        if (cta) {
          var ctaLabel = opt.getAttribute('data-cta');
          if (ctaLabel) cta.textContent = ctaLabel;
        }
      });
    });
  }

  // Добавляет класс .is-scrolled на шапку при прокрутке вниз — для тени.
  function setupHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;
    function update() {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // Бургер-меню на мобиле: toggle .is-open на навигации и оверлее.
  // Закрывается при клике на ссылку, на оверлей или по Esc.
  function setupBurgerMenu() {
    var burger = document.querySelector('.header__burger');
    var nav = document.getElementById('primary-nav');
    var overlay = document.querySelector('.nav-overlay');
    if (!burger || !nav || !overlay) return;

    function open() {
      burger.classList.add('is-open');
      nav.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Закрыть меню');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      burger.classList.remove('is-open');
      nav.classList.remove('is-open');
      overlay.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      document.body.style.overflow = '';
      // hidden ставим после конца transition, чтобы оверлей не пропадал мгновенно
      setTimeout(function () {
        if (!overlay.classList.contains('is-open')) overlay.hidden = true;
      }, 300);
    }
    function toggle() {
      if (burger.classList.contains('is-open')) close();
      else open();
    }

    burger.addEventListener('click', toggle);
    overlay.addEventListener('click', close);
    // Крестик закрытия в шапке drawer (.nav__close) — дублирует функцию бургера
    var navClose = nav.querySelector('.nav__close');
    if (navClose) navClose.addEventListener('click', close);
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.classList.contains('is-open')) close();
    });
    // При расширении окна выше мобильного брейкпоинта — сбрасываем drawer
    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 641px)').matches && burger.classList.contains('is-open')) {
        close();
      }
    });
  }

  // Промо-попап только для демо-сайта (флаг CLINIC.promoModalEnabled).
  // Перехватывает клики на все CTA-ссылки и submit лид-формы и
  // показывает модалку с информацией о разработчике вместо реального действия.
  // Перехватываем:
  //   - href="#cta" — все ссылки на финальный CTA-блок
  //   - tel:, mailto: — звонки и почта
  //   - wa.me / api.whatsapp.com — WhatsApp-ссылки
  //   - t.me, vk.com, instagram.com — соцсети клиники
  //   - yandex.ru/maps — построение маршрута
  // НЕ перехватываем: остальные внутренние якоря (#services, #about и т.д.) —
  // это просто навигация по сайту, должна работать.
  // Внутри самого попапа клики тоже не перехватываем — Telegram-ссылка Виктора
  // должна открыть мессенджер.
  function setupPromoModal() {
    if (typeof CLINIC === 'undefined' || !CLINIC.promoModalEnabled) return;
    var dialog = document.getElementById('promo-modal');
    if (!dialog) return;

    // На демо лид-форма триггерит попап. Снимаем disabled и required, чтобы
    // submit прошёл независимо от заполненности полей и галочки согласия.
    // Дополнительно перехватываем change чекбокса — чтобы setupLeadForm не
    // вернул disabled=true когда пользователь снимет галочку.
    document.querySelectorAll('[data-form="lead"]').forEach(function (form) {
      form.querySelectorAll('button[type="submit"]').forEach(function (btn) { btn.disabled = false; });
      form.querySelectorAll('[required]').forEach(function (el) { el.required = false; });
      form.querySelectorAll('.lead-form__check-input').forEach(function (cb) {
        cb.addEventListener('change', function () {
          var btn = form.querySelector('button[type="submit"]');
          if (btn) btn.disabled = false;
        });
      });
    });

    function openModal() {
      if (typeof dialog.showModal === 'function') {
        try { dialog.showModal(); } catch (e) { dialog.setAttribute('open', ''); }
      } else {
        dialog.setAttribute('open', '');
      }
    }
    function closeModal() {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }

    function isPromoTrigger(href) {
      if (!href) return false;
      if (href === '#cta') return true;
      if (href.charAt(0) === '#') return false; // другие внутренние якоря — не трогаем
      if (/^(tel:|mailto:)/i.test(href)) return true;
      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|t\.me|vk\.com|www\.vk\.com|www\.instagram\.com|instagram\.com|yandex\.ru\/maps)/i.test(href)) return true;
      return false;
    }

    // Перехватчик кликов на CTA-ссылки (делегирование на document)
    document.addEventListener('click', function (e) {
      // Клики внутри попапа пропускаем — наша Telegram-ссылка должна работать
      if (e.target.closest('.promo-modal')) return;
      var link = e.target.closest('a[href]');
      if (!link) return;
      if (!isPromoTrigger(link.getAttribute('href'))) return;
      e.preventDefault();
      openModal();
    });

    // Submit лид-формы — попап вместо success-сообщения.
    // Capture phase + stopImmediatePropagation: успеваем до bubble-обработчика setupLeadForm.
    document.addEventListener('submit', function (e) {
      if (!e.target.closest || !e.target.closest('[data-form="lead"]')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      openModal();
    }, true);

    // Закрытие: data-promo-close на крестике и кнопке «Продолжить смотреть демо»,
    // плюс клик по самому dialog (попадает на backdrop, а не на содержимое)
    dialog.addEventListener('click', function (e) {
      if (e.target.closest('[data-promo-close]')) { closeModal(); return; }
      if (e.target === dialog) closeModal();
    });
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
    bindIcons(document);
    fillOptions(document, CLINIC);
    renderLists(CLINIC);
    // повторно — на случай data-bind-attr внутри отрендеренных карточек, ссылающихся на корневой CLINIC
    bindAttrs(document, CLINIC);
    setupHeaderScroll();
    setupBurgerMenu();
    setupCardStagger('.card--advantage');
    setupCardStagger('.card--service');
    setupCardStagger('.card--promotion');
    setupCardStagger('.card--doctor');
    setupCardStagger('.card--blog');
    setupCardStagger('.card--branch');
    setupCardStagger('.faq__item');
    setupCardStagger('.diagnosis-option');
    setupDiagnosisOptions();
    setupLeadForm();
    setupHeroCarousel();
    setupStatCountUp();
    setupMagneticButton();
    setupCarousel({
      gridSelector: '.section--services .cards-grid',
      cardSelector: '.card--service',
      dotsId: 'services-dots',
      dotClass: 'services-dot',
      cloneClass: 'card--service-clone',
      ariaLabelPrefix: 'Перейти к услуге ',
      prevId: 'services-prev',
      nextId: 'services-next'
    });
    setupCarousel({
      gridSelector: '.section--promotions .cards-grid',
      cardSelector: '.card--promotion',
      dotsId: 'promotions-dots',
      dotClass: 'promotions-dot',
      cloneClass: 'card--promotion-clone',
      ariaLabelPrefix: 'Перейти к акции ',
      prevId: 'promotions-prev',
      nextId: 'promotions-next'
    });
    setupCarousel({
      gridSelector: '.section--doctors .cards-grid',
      cardSelector: '.card--doctor',
      dotsId: 'doctors-dots',
      dotClass: 'doctors-dot',
      cloneClass: 'card--doctor-clone',
      ariaLabelPrefix: 'Перейти к врачу ',
      prevId: 'doctors-prev',
      nextId: 'doctors-next'
    });
    setupCarousel({
      gridSelector: '.section--reviews .cards-grid',
      cardSelector: '.card--review',
      dotsId: 'reviews-dots',
      dotClass: 'reviews-dot',
      cloneClass: 'card--review-clone',
      ariaLabelPrefix: 'Перейти к отзыву ',
      alwaysCarousel: true,
      prevId: 'reviews-prev',
      nextId: 'reviews-next'
    });
    // Промо-попап вызывается ПОСЛЕ setupLeadForm — чтобы успеть переопределить
    // disabled-логику чекбокса согласия, которую вешает setupLeadForm.
    setupPromoModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
