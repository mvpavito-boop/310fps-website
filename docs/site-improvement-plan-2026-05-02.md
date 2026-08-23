# План доработки сайта 310FPS Custom Lab

Дата анализа: 2026-05-02  
Проект: `/Users/310fps/Documents/Projects/Сайт 310FPS`  
Сайт: `https://310fps-lab.vercel.app/`  
Стек: Next.js 16.1.6, React 19.2.3, Tailwind CSS 4, Supabase, Zustand, Framer Motion, Three.js, Vercel

## 1. Краткий вывод

Сайт уже имеет сильную бренд-подачу: темная лабораторная эстетика, четкая идея кастомной сборки, каталог, конфигуратор, лидогенерация, админка, отзывы, FAQ, SEO-маршруты и интеграция с Telegram. Это не пустой лендинг, а почти полноценная коммерческая система.

Главный риск сейчас технический: production build падает, lint не проходит, а часть данных/изображений и админ-механик выглядят недособранными. До визуальных улучшений нужно стабилизировать основу: сборку, типы, данные каталога, админ-доступ и критические сценарии заказа.

## 1.1. Прогресс выполнения

Обновлено: 2026-05-03.

- Готово: `npm run build` проходит, `npm run lint` проходит без предупреждений.
- Готово: каталог защищен fallback-изображениями и fallback-данными при недоступном Supabase.
- Готово: admin session переведена на подписанные cookies, logout очищает обе cookies.
- Готово: добавлены rate limit для admin login, admin upload и заявок.
- Готово: admin CRUD routes получили базовую input validation.
- Готово: конфигуратор покрыт smoke-тестом на SSD array, совместимость socket/auto-replace и LAB Series presets.
- Готово: единый `siteConfig` для canonical URL, metadata, sitemap, robots, Telegram-ссылок и Product JSON-LD.
- Готово: форма заказа из конфигуратора отправляет лид в `/api/telegram/lead`, а не в Telegram webhook.
- Готово: browser smoke routes на desktop/mobile для `/`, `/catalog`, `/lineup/signal`, `/configurator`, `/contacts`, `/admin/login`.
- Готово: каталог рендерит локальный `catalogData` сразу, а Supabase/API обновляет данные поверх без пустого первого состояния.
- Готово: устранены browser warnings по `next/image` для логотипов, каталога и конфигуратора; внешние Unsplash-изображения комплектующих обходят optimizer через `unoptimized`.
- Готово: `/catalog/[id]` стал полноценной детальной страницей товара с metadata, canonical и Product JSON-LD; legacy `/catalog/{lineup}` редиректит на `/lineup/{id}`.
- Готово: sitemap включает 30 детальных страниц готовых сборок.
- Готово: добавлен release smoke checklist в `docs/release-smoke-checklist-2026-05-02.md`.
- Готово: расширена доступность admin-форм: login/search/settings и inline content forms получили связанные labels/id/name; editor forms получают `id/name` через общий `Field`.
- Готово: admin smoke с локальным `ADMIN_PASSWORD`: pages/read API отвечают `200`, invalid catalog POST возвращает `400 name is required`.
- Готово: admin catalog POST генерирует обязательный `id`, сохраняет `images` при создании и возвращает сообщения Supabase-ошибок вместо `Unknown error`.
- Готово: admin CRUD mutation smoke с временными `codex-smoke-*` записями прошел для catalog, components, FAQ и reviews; cleanup и проверка удаления выполнены.
- Готово: admin upload smoke прошел: временный PNG загружается через `/api/admin/upload`, URL сохраняется через `/api/admin/update-images`, storage cleanup выполнен.
- Готово: сценарий статуса заявки проверен на временном лиде: `new -> in_progress -> done -> processed`, invalid status возвращает `400`; cleanup выполнен.
- Готово: `/admin/leads` и admin dashboard отображают статусы `processed` и `archived`, которые приходят из Telegram callback.
- Готово: Telegram callback route проверен без реального Telegram API через mocked `api.telegram.org`: `processed`, `archived`, invalid status, отсутствие дубля строки статуса и cleanup лида.
- Готово: Telegram callback route больше не принимает произвольный статус из `callback_data`, разрешены только `processed` и `archived`.
- Готово: lead route поддерживает отправку в Direct канала через `TELEGRAM_DIRECT_MESSAGES_TOPIC_ID`; mocked smoke подтвердил наличие `direct_messages_topic_id` в Telegram `sendMessage` payload.
- Готово: блок главной `Начните за 30 секунд` собирает заявки с `source=home_quick_consultation`, человекочитаемой задачей и контекстом `home-30-seconds`; smoke с mocked Telegram прошел, cleanup лида выполнен.
- Готово: остальные формы заявок унифицированы: `contacts_page`, `home_stages_modal`, `lineup_{id}`, `configurator` передают источник, контекст и человекочитаемую задачу; all lead forms smoke с mocked Telegram прошел, cleanup лидов выполнен.
- Готово: блок главной LAB Series использует общий источник `LINEUP`, активная карточка ведет на `/lineup/{id}`, а вторичная кнопка остается `Все готовые решения` -> `/catalog`.
- В работе дальше: заменить локальный/production `TELEGRAM_CHAT_ID` с private chat на Direct Messages chat канала и задать `TELEGRAM_DIRECT_MESSAGES_TOPIC_ID`, затем выполнить реальную тестовую заявку.

## 2. Текущее состояние

### Что найдено в проекте

- App Router страницы: главная, каталог, карточки линейки, конфигуратор, контакты, FAQ, доставка, гарантия, privacy, баннеры, админка.
- API routes: catalog, components, builds, reviews, FAQ, settings, telegram lead, admin CRUD.
- Supabase: таблицы `components`, `catalog`, `saved_builds`; отдельная миграция расширяет компоненты до актуального 2026 набора.
- Воронка: главная -> каталог/линейка/конфигуратор -> заявка -> Supabase leads + Telegram.
- Есть Vercel-связка и локальные `.env` файлы.

### Проверки

- `npm run build` падает на TypeScript:
  - `src/store/useConfiguratorStore.ts:328`
  - проблема: `selectedComponents.ssd` является массивом, но объект приводится к `Record<string, PCComponent | null>`.
- `npm run lint` падает:
  - 60 errors, 28 warnings.
  - основные причины: `any` в admin/API, require-imports в старых JS-скриптах, React Hooks rule в `ComponentList`, unescaped quotes в `banners`, `prefer-const` в каталоге.
- Git tree грязный:
  - много измененных и новых файлов, включая конфигуратор, каталог, lineup, Supabase migration, `CLAUDE.md`.
  - перед крупными работами нужен аккуратный checkpoint/коммит или отдельная ветка.

## 3. Критические проблемы

### P0: сайт не готов к надежному production cycle

Build сейчас не проходит. Это блокирует безопасный деплой и любые дальнейшие изменения. Первая задача: вернуть `npm run build` и `npm run lint` в зеленое состояние.

### P0: админ-сессия проверяется формально

`/api/admin/login` создает токен и хеш, но `middleware.ts` фактически проверяет только наличие кук и длину токена. Хеш не сверяется с серверным секретом или хранилищем. Это слабое место для админки и `/api/admin/*`.

### P1: каталог зависит от качества данных Supabase

В статическом `src/lib/data/catalog.ts` до сих пор есть ссылки на `/media/images/placeholder_pc1.jpg` и похожие файлы, которых нет в `public/media/images`. В `public/media/images` есть только `axiom.jpg` и bento-изображения. Если Supabase вернет пустые/старые images или API упадет, карточки каталога снова могут сломаться.

### P1: конфигуратор стал сложным, но без тестовой сетки

Логика совместимости, SSD-массивов, пресетов, авто-замен и сохраненных билдов живет в одном Zustand-store. Это money-page, но автоматических тестов на совместимость, пресеты и build load/save нет.

### P1: admin/API типизированы слабо

Большая часть lint-ошибок находится в админских страницах и API routes из-за `any`. Это ухудшает надежность CRUD, загрузок изображений, лидов, FAQ и настроек.

### P2: UX-полировка местами опережает надежность данных

Главная и каталог визуально сильные, но в продуктовых карточках и модалках нет полноценного fallback для пустых `images`, пустых specs, пустого fps. Это важно для живого каталога, где данные будут меняться через админку.

## 4. Цель доработки

Сделать сайт 310FPS коммерчески надежным: он должен собираться, деплоиться, принимать заявки, показывать каталог без битых состояний, иметь защищенную админку и давать пользователю уверенный премиальный опыт на главной, каталоге и конфигураторе.

## 5. Критерии готовности

- `npm run build` проходит без ошибок.
- `npm run lint` проходит или имеет явно зафиксированные исключения для legacy scripts.
- Каталог не показывает битые изображения при любых данных.
- Конфигуратор корректно работает с одним/несколькими SSD, пресетами и сохраненными сборками.
- Админка защищена валидируемой сессией.
- Все формы имеют `label/name/id`, видимые ошибки и успешные состояния.
- Основные маршруты вручную проверены: `/`, `/catalog`, `/lineup/[id]`, `/configurator`, `/contacts`, `/admin`.
- Есть минимальный smoke-test checklist перед деплоем.

## 6. План работ

### Этап 1. Стабилизация сборки и типов (1-2 дня)

| Задача | Оценка | Зависимости | Готово, когда |
|---|---:|---|---|
| Исправить тип `selectedComponents` и `loadPreset` для SSD-массива | 2-4ч | нет | `npm run build` проходит дальше текущей ошибки |
| Убрать/типизировать `any` в API и admin страницах | 6-10ч | нет | lint-ошибки по `no-explicit-any` закрыты |
| Вынести legacy JS-скрипты из lint scope или перевести на ESM | 1-2ч | нет | `parse_chats.js` и `test_avito.js` не ломают lint |
| Исправить React Hooks warnings/errors в `ComponentList` | 2-4ч | нет | нет ошибок `react-hooks/set-state-in-effect` |
| Почистить неиспользуемые импорты | 1-2ч | нет | lint warnings заметно сокращены |

### Этап 2. Данные каталога и изображения (1 день)

| Задача | Оценка | Зависимости | Готово, когда |
|---|---:|---|---|
| Добавить централизованный `getSafeImage(src, fallback)` | 2ч | этап 1 желательно | карточки не падают на пустых/битых `images` |
| Заменить `placeholder_pc*.jpg` на реальные локальные assets или fallback | 2-4ч | нет | `rg placeholder_pc` ничего не находит или ссылки существуют |
| Синхронизировать static catalog, Supabase catalog и lineup | 4-6ч | доступ к Supabase | карточки и пресеты используют согласованные id/specs/images |
| Добавить в API fallback на `catalogData`, если Supabase недоступен | 2ч | нет | `/api/catalog` не возвращает 500 для пользователя |

### Этап 3. Безопасность админки и API (1-2 дня)

| Задача | Оценка | Зависимости | Готово, когда |
|---|---:|---|---|
| Переделать admin session на подписанный токен или JWT/HMAC | 4-6ч | этап 1 | middleware реально проверяет подлинность сессии |
| Добавить logout-инвалидацию и единый срок жизни сессии | 2ч | session fix | выход очищает все admin cookies |
| Проверить все `/api/admin/*` на service role usage и input validation | 4-6ч | типизация API | неверные payload не проходят в БД |
| Добавить rate limit для login и upload | 2-4ч | session fix | brute force и upload-spam ограничены |

### Этап 4. Конфигуратор как главный продуктовый сценарий (2-3 дня)

| Задача | Оценка | Зависимости | Готово, когда |
|---|---:|---|---|
| Покрыть store unit-тестами: price, power, socket, cooling, PSU, SSD array | 6-10ч | этап 1 | тесты ловят ключевые регрессии |
| Проверить `loadPreset` на всех LAB Series | 4-6ч | синхронизация данных | каждый пресет загружает максимум компонентов без ложных матчей |
| Улучшить пустое состояние конфигуратора | 3-4ч | нет | понятно, что нужно выбрать первым |
| Упростить логику auto-replace и явно показывать последствия замены | 4-6ч | тесты | пользователь видит что изменится и почему |
| Проверить сохранение/загрузку билдов по UUID | 3-4ч | Supabase | сохраненная ссылка восстанавливает сборку |

### Этап 5. UX, доступность и конверсия (2-3 дня)

| Задача | Оценка | Зависимости | Готово, когда |
|---|---:|---|---|
| Пройти формы: labels, names, ids, validation, success/error states | 4-6ч | этап 1 | формы доступны и не теряют заявку |
| Проверить touch targets на мобильном | 2-4ч | нет | кнопки/пагинация удобны пальцем |
| Усилить каталог above-the-fold | 4-6ч | images fix | пользователь сразу видит продукт, цену, фильтры |
| Добавить fallback/skeleton для каталога и lineup без пустых дыр | 3-4ч | data fix | загрузка ощущается контролируемой |
| Выравнять бренд-термины: Custom Lab, LAB Series, контакты, footer | 2-3ч | нет | нет конфликтующих названий и старых формулировок |

### Этап 6. SEO, аналитика и доверие (1-2 дня)

| Задача | Оценка | Зависимости | Готово, когда |
|---|---:|---|---|
| Проверить metadata для всех страниц, canonical, OG images | 3-4ч | нет | карточки красиво шарятся, sitemap корректен |
| Добавить Product schema на карточки/lineup с image и offers | 3-4ч | data fix | валидируется rich results без критичных ошибок |
| Подключить события: CTA, lead submit, configurator save, Telegram click | 4-6ч | выбор аналитики | видна конверсия по воронке |
| Обновить README под реальный проект | 1-2ч | финальная структура | новый разработчик понимает запуск и архитектуру |

## 7. Рекомендуемый порядок

1. Сделать checkpoint текущего git-состояния.
2. Починить build.
3. Починить lint или явно исключить legacy-зоны.
4. Закрыть изображения и fallback данных каталога.
5. Усилить security admin-сессии.
6. Покрыть конфигуратор минимальными тестами.
7. Полировать UX каталога/конфигуратора.
8. Проверить SEO/аналитику и задеплоить.

## 8. Риски

| Риск | Влияние | Вероятность | Что сделать |
|---|---|---:|---|
| Supabase данные расходятся со static data | Высокое | Высокая | Назначить один источник правды и миграции для синхронизации |
| Новые изменения уже лежат в грязном git tree | Среднее | Высокая | Не начинать крупный refactor без checkpoint |
| Админка выглядит рабочей, но сессия слабая | Высокое | Средняя | Починить до публикации/передачи доступа |
| Конфигуратор ломается на edge-case совместимости | Высокое | Средняя | Добавить тесты store перед UX-изменениями |
| Битые изображения возвращаются через админку | Среднее | Высокая | Валидация upload + fallback rendering |

## 9. Минимальный релизный чеклист

- `npm run build`
- `npm run lint`
- Проверка главной на desktop/mobile.
- Проверка `/catalog`: фильтры, сортировка, карточка, модалка, CTA.
- Проверка `/lineup/[id]`: заявка и переход в конфигуратор с preset.
- Проверка `/configurator`: выбор CPU/GPU/SSD, конфликт сокета, сохранение сборки.
- Проверка `/contacts`: заявка уходит в Supabase и Telegram.
- Проверка `/admin/login`, `/admin/catalog`, `/admin/components`, `/admin/leads`.
- Проверка sitemap/robots/OG image.

## 10. Быстрый план на 5 рабочих дней

### День 1

- Починить TypeScript build.
- Убрать самые массовые lint-ошибки.
- Исключить или привести в порядок legacy JS-скрипты.

### День 2

- Закрыть изображения/fallback каталога.
- Синхронизировать static/Supabase/lineup данные.
- Проверить `/catalog` и `/lineup/[id]`.

### День 3

- Починить admin session.
- Проверить admin CRUD и upload.
- Добавить input validation для admin API.

### День 4

- Добавить тесты для конфигуратора.
- Проверить пресеты LAB Series.
- Улучшить loading/empty states конфигуратора.

### День 5

- Доступность форм и мобильных controls.
- SEO/Schema/README.
- Финальный smoke-test и деплой.
