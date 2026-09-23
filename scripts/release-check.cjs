/* Read-only preflight. No leads, webhooks, catalog writes, or ad spending. */
require('@next/env').loadEnvConfig(process.cwd());
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node' } });
require('tsconfig-paths/register');
const fs = require('node:fs');
const path = require('node:path');
const { validateCommerce, migrateCommerce, createInitialCommerce } = require('../src/lib/commerce/model');
const { legalOperatorComplete } = require('../src/lib/legal-operator');
const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail });
const env = process.env;
async function main() {
  check('Постоянное хранилище', env.CATALOG_STORAGE === 'supabase', 'Production: CATALOG_STORAGE=supabase; локальные файлы Vercel не сохраняет.');
  check('Настройки базы', env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY, 'Нужны URL, anon key и service role key.');
  check('Защита админки', env.ADMIN_PASSWORD?.length >= 16, 'ADMIN_PASSWORD: не менее 16 символов.');
  check('Telegram', env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && env.TELEGRAM_WEBHOOK_SECRET?.length >= 32, 'Бот, чат и отдельный секрет webhook от 32 символов.');
  check('Единый адрес', /^https:\/\/[^/]+\/?$/.test(env.NEXT_PUBLIC_SITE_URL || ''), 'Укажите HTTPS-адрес, включая временный адрес Vercel.');
  check('Реквизиты', legalOperatorComplete(), 'LEGAL_OPERATOR_NAME, INN, REGISTRATION, ADDRESS, EMAIL.');
  if (process.argv.includes('--ads')) check('Метрика', /^[1-9]\d*$/.test(env.NEXT_PUBLIC_YANDEX_METRIKA_ID || ''), 'Для рекламы нужен ID счётчика и проверенная цель lead_submit.');
  const file = env.CATALOG_LOCAL_PATH || '.local/catalog.json';
  const local = fs.existsSync(file) ? migrateCommerce(JSON.parse(fs.readFileSync(file, 'utf8'))) : createInitialCommerce();
  let state = local;
  if (process.argv.includes('--online')) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(10000) }) } });
      const { data, error } = await db.from('site_commerce').select('state').eq('id', 'catalog').single();
      check('Рабочая база каталога', !error && data?.state, 'Проверено чтение опубликованного состояния из Supabase.');
      if (!error && data?.state) state = migrateCommerce(data.state);
      for (const [table, columns] of [['leads', 'id,context'], ['saved_builds', 'id'], ['faq', 'id'], ['reviews', 'id'], ['site_settings', 'key']]) {
        const result = await db.from(table).select(columns).limit(0);
        check(`Таблица ${table}`, !result.error, 'Проверка схемы и доступа service role; значения не выводятся.');
      }
    } catch { check('Рабочая база', false, 'Подключение не установлено. Проверьте проект и переменные окружения.'); }
    try {
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`, { signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      const expected = `${(env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')}/api/telegram`;
      check('Адрес webhook', response.ok && data.ok && data.result?.url === expected && !data.result?.last_error_message, 'Должен совпадать с NEXT_PUBLIC_SITE_URL + /api/telegram и не иметь ошибки доставки.');
    } catch { check('Адрес webhook', false, 'Не удалось проверить webhook.'); }
  }
  check('Опубликованный каталог', state.published, 'Нужен опубликованный снимок; старый демонстрационный каталог не является релизом.');
  if (state.published) {
    const errors = validateCommerce(state.published, true);
    check('Составы и цены', !errors.length, errors.slice(0, 20).join('\n') || 'Серверная проверка пройдена.');
    const builds = state.published.builds.filter(b => b.published);
    check('Стартовый ассортимент', builds.length >= 12 && new Set(builds.map(b => b.series)).size === 5, 'Не менее 12 проверенных сборок пяти линеек.');
    for (const b of builds) {
      const images = [b.image, ...(b.gallery || []).map(p => p.src)];
      check(`Фотографии ${b.id}`, b.photosVerified && b.gallery?.length && images.every(src => src.startsWith('/') && !src.startsWith('//') && fs.existsSync(path.join(process.cwd(), 'public', src))), 'Подтверждённое соответствие товару, галерея и доступные файлы.');
    }
  }
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), mode: process.argv.includes('--online') ? 'online' : 'local', automatedChecksPassed: checks.every(c => c.ok), checks, manualAcceptance: ['Подтвердить реквизиты, схему обработки данных и коммерческие обещания.', 'Три живые заявки: главная, карточка, конфигуратор; запись в базе, уведомление, изменение статуса.', 'Цена одинакова в каталоге, карточке и конфигураторе; мобильное оформление.', 'До рекламы: цель lead_submit видна в счётчике; клики учитываются отдельно.'] }, null, 2));
  if (checks.some(c => !c.ok)) process.exitCode = 1;
}
main().catch(() => { console.error('Preflight не завершён: проверьте наличие и структуру локального каталога.'); process.exitCode = 1; });
