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
    'baby':       '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>'
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

    function isMobile() { return window.matchMedia('(max-width: 640px)').matches; }
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

    var jumping = false;
    grid.addEventListener('scroll', function () {
      if (jumping || !isMobile()) return;
      updateDots();
      var w = getSlideWidth();
      var max = grid.scrollWidth - grid.clientWidth;
      // Достигли клона в конце → прыжок на первый реальный
      if (grid.scrollLeft >= max - 4) {
        jumping = true;
        grid.scrollLeft = w;
        requestAnimationFrame(function () { jumping = false; });
      }
      // Достигли клона в начале → прыжок на последний реальный
      else if (grid.scrollLeft <= 4) {
        jumping = true;
        grid.scrollLeft = w * realCards.length;
        requestAnimationFrame(function () { jumping = false; });
      }
    }, { passive: true });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        var w = getSlideWidth();
        grid.scrollTo({ left: (i + 1) * w, behavior: 'smooth' });
      });
    });

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
    setupCardStagger('.card--advantage');
    setupCardStagger('.card--service');
    setupCardStagger('.card--promotion');
    setupCarousel({
      gridSelector: '.section--services .cards-grid',
      cardSelector: '.card--service',
      dotsId: 'services-dots',
      dotClass: 'services-dot',
      cloneClass: 'card--service-clone',
      ariaLabelPrefix: 'Перейти к услуге '
    });
    setupCarousel({
      gridSelector: '.section--promotions .cards-grid',
      cardSelector: '.card--promotion',
      dotsId: 'promotions-dots',
      dotClass: 'promotions-dot',
      cloneClass: 'card--promotion-clone',
      ariaLabelPrefix: 'Перейти к акции '
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
