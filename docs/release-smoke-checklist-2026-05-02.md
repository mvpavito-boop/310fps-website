# Release Smoke Checklist — 310FPS Custom Lab

Дата: 2026-05-02
Последнее обновление: 2026-05-03

## Автоматические проверки

- `npm run lint`
- `npm run build`
- `npm run test:configurator`

## Маршруты

- `/` — главная открывается без console errors; LAB Series ведет с активной карточки на `/lineup/{id}`, вторичная кнопка ведет на `/catalog`.
- `/catalog` — показывает 30 сборок на первом рендере, фильтры не ломают сетку.
- `/catalog/vector-1` — детальная страница товара открывается, содержит Product JSON-LD.
- `/catalog/signal` — legacy redirect на `/lineup/signal`.
- `/lineup/signal`, `/lineup/vector`, `/lineup/canvas`, `/lineup/spectre`, `/lineup/axiom` — страницы линейки открываются, CTA доступны.
- `/configurator` — конфигуратор открывается без image optimizer errors.
- `/contacts` — форма заявки видима, поля имеют `id/name/label`.
- `/admin/login` — логин открывается, без валидной сессии `/admin` редиректит на login.
- После login с локальным `ADMIN_PASSWORD`: `/admin`, `/admin/catalog`, `/admin/components`, `/admin/content`, `/admin/leads` отвечают `200`.

## API smoke

- `POST /api/telegram/lead` с пустым body возвращает `400 name is required`.
- Home quick consultation smoke проходит: блок `Начните за 30 секунд` отправляет лид с `source=home_quick_consultation`, человекочитаемой задачей и контекстом `home-30-seconds`; тестовый лид удаляется.
- All lead forms smoke проходит с mocked Telegram: формы `contacts_page`, `home_stages_modal`, `lineup_{id}` и `configurator` сохраняют источник/контекст/человекочитаемую задачу; тестовые лиды удаляются.
- Без admin cookies `/api/admin/*` редиректит на `/admin/login`.
- После login read API `/api/admin/catalog`, `/api/admin/components`, `/api/admin/faq`, `/api/admin/reviews` отвечают `200`.
- После login invalid `POST /api/admin/catalog {}` возвращает `400 name is required`.
- После login CRUD mutation smoke проходит для catalog, components, FAQ и reviews: временные записи `codex-smoke-*` создаются, читаются, обновляются, удаляются; после удаления catalog/components возвращают `404`, FAQ/reviews отсутствуют в списке.
- После login upload smoke проходит: временный PNG загружается через `/api/admin/upload`, URL сохраняется через `/api/admin/update-images`, каталог возвращает сохраненный image URL; тестовый объект удаляется из Supabase Storage.
- После login lead status smoke проходит: временная заявка переводится `new -> in_progress -> done -> processed`, invalid status возвращает `400 Invalid status`; тестовая заявка удаляется.
- Lead Telegram Direct payload smoke проходит без реального Telegram API: при `TELEGRAM_DIRECT_MESSAGES_TOPIC_ID` route `/api/telegram/lead` добавляет `direct_messages_topic_id` в `sendMessage` payload, callback-кнопки содержат id созданного лида; тестовый лид удаляется.
- Telegram callback smoke проходит без реального Telegram API: route handler с mocked `api.telegram.org` переводит временную заявку в `processed`, затем `archived`, invalid callback не меняет статус и возвращает callback-ответ `Некорректный статус заявки`; строка статуса в Telegram-тексте не дублируется.
- `GET /sitemap.xml` содержит `/catalog/vector-1`, `/catalog/axiom-6` и `/lineup/signal`.
- `GET /robots.txt` содержит canonical sitemap URL.

## Ручные сценарии перед деплоем

- Открыть карточку в каталоге и проверить модалку.
- Открыть детальную страницу товара из названия карточки.
- На главной в LAB Series нажать активную карточку: переход должен быть на страницу модели, не в конфигуратор.
- На мобильном проверить `/catalog`, `/catalog/vector-1`, `/configurator`, `/contacts`.
- Для Direct канала в production env должны быть заданы `TELEGRAM_CHAT_ID` Direct Messages chat и `TELEGRAM_DIRECT_MESSAGES_TOPIC_ID`.
- Отправить тестовую заявку с реальными env `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_DIRECT_MESSAGES_TOPIC_ID`, Supabase env.
- Перед реальным деплоем вручную проверить доставку Telegram-уведомления в Direct канала.
