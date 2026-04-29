# clinic_site

Универсальный шаблон сайта для клиник и стоматологий. Перекрашивается под нового клиента за 15 минут правкой одного файла.

**🌐 Живое демо:** https://clinic-site-tan.vercel.app
**📦 Репозиторий:** https://github.com/vvk5673-ui/clinic_site

Каждый `git push` в `main` автоматически обновляет сайт через Vercel за 30-60 секунд.

## Главная фишка — все клиентские данные в одном файле

`js/config.js` содержит объект `CLINIC` с полями:
- Название, контакты, адрес, часы работы
- Цвета бренда (3 переменные → перекрашивают весь сайт через CSS-переменные)
- 6 преимуществ, 6 услуг, 3 акции, 5 опций диагностики, 4 врача, 6 отзывов, 3 статьи блога, 6 FAQ, 2 филиала
- Все заголовки секций, подзаголовки, тексты кнопок и UI-подписи (через объект `ui`)
- Соцсети (Telegram, WhatsApp, ВКонтакте)

HTML и CSS не содержат текстов — всё подставляется из config через `data-bind` атрибуты.

## Как перекрасить шаблон под нового клиента

**Минимум (~15 минут):**

1. **Открой `js/config.js`** — это файл с данными клиники
2. **Замени поля верхнего уровня:**
   - `name` — название клиники
   - `logoBrand` + `logoDescriptor` — текст логотипа в шапке
   - `phone` + `phoneRaw` — телефон (отображаемый и в формате `+74957861932` для tel:)
   - `email`, `address`, `workingHours`, `cityFromYear`
   - `whatsapp`, `telegram`, `vk`, `instagram` — username/номер мессенджеров
3. **Замени цвета бренда:**
   - `brandColor` — основной (применяется как `--brand-primary` в CSS)
   - `brandColorDark` — тёмный для контраста (`--brand-dark`)
   - `accentColor` — акцентный (`--brand-accent`)
4. **Замени контент 13 блоков:**
   - `heroPhotos` — пути к 3 фото героя (карусель)
   - `advantages` — 6 преимуществ (title, text, icon)
   - `services` — 6 услуг (title, text, price, image)
   - `promotions` — 3 акции (title, text, price, period, badge)
   - `diagnosis` — 5 опций квиза (title, text, icon, ctaLabel)
   - `doctors` — 4 врача (name, role, experience, photo)
   - `reviews` — 6 отзывов (name, avatar, date, source, text, visitTag)
   - `leadMagnet` — лид-магнит PDF (title, subtitle, bullets, cover)
   - `about` — блок «О компании» (quote, text, photo)
   - `blog` — 3 статьи (title, excerpt, date, readTime, image)
   - `faq` — 6 вопросов-ответов
   - `contacts.branches` — 2 филиала (name, address, metro, hours, phoneRaw, whatsapp, photo, routeUrl)
   - `contacts.mapEmbed` — Yandex Maps embed-URL
   - `cta` — финальный CTA (title, text, whatsappLabel)
   - `ui` — короткие UI-подписи (кнопки шапки, заголовки футера, тексты диагностики)
5. **Положи новые фото в `pictures/`** — должны называться так же как в config или поменять пути в config
6. **Положи логотип в `img/logo.svg`** (опционально — основной лого собирается из иконки-зуба + текста бренда)
7. **Обнови мета-теги в `index.html`:**
   - `<title>`, `<meta name="description">`
   - `og:title`, `og:description`, `og:image`, `og:url`
8. **`git push`** → Vercel автоматически задеплоит

**Опционально:**
- В `sections{}` поставь `false` для блоков которые не нужны клиенту (например, `blog: false`) — блок не отрендерится
- Включить/выключить разделы можно без правки HTML/CSS

## Стек

- HTML5 + CSS3 + Vanilla JS (без фреймворков, без сборщиков)
- Шрифты: Cabinet Grotesk (заголовки) + Manrope (body)
- Иконки: Lucide SVG inline + Simple Icons (соцсети)
- Хостинг: Vercel (бесплатный план)

## Структура проекта

```
clinic_site/
├── index.html         — главная страница (одностраничник)
├── css/
│   ├── variables.css  — CSS-переменные (цвета, шрифты, отступы)
│   └── style.css      — все стили
├── js/
│   ├── config.js      — данные клиники (главный файл для перекраски)
│   └── main.js        — движок подстановки данных и интерактив
├── img/               — favicon, логотип
├── pictures/          — фото врачей, услуг, hero и т.д.
├── project.md         — описание проекта
├── CLAUDE.md          — правила работы Claude
├── PLAN.md            — поэтапный план с чек-боксами
└── README.md          — этот файл
```

## Lighthouse Mobile

- **Performance:** 82
- **Accessibility:** 97
- **Best Practices:** 100
- **SEO:** 100

## Готовность

✅ Этапы 0-7 закрыты — шаблон полностью готов для перекраски и холодного outbound.

🔮 Этап 8 (Telegram-бот) — отложен до релевантного урока курса.
