/* Read-only preflight. No leads, webhooks, catalog writes, or ad spending. */
if (require.main === module) {
  try { require('./release-env.cjs').loadReleaseEnv(); }
  catch (error) { console.error(error.message); process.exit(1); }
}
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node' } });
require('tsconfig-paths/register');
const fs = require('node:fs');
const path = require('node:path');
const { validateCommerce, migrateCommerce, createInitialCommerce } = require('../src/lib/commerce/model');
const { legalOperatorComplete } = require('../src/lib/legal-operator');
async function runPreflight({ env = process.env, online = false, predeploy = false, ads = false, root = process.cwd(), createClient = require('@supabase/supabase-js').createClient, request = fetch } = {}) {
  const checks = [];
  const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail });
  check('Постоянное хранилище', env.CATALOG_STORAGE === 'supabase', 'Production: CATALOG_STORAGE=supabase; локальные файлы Vercel не сохраняет.');
  check('Настройки базы', env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY, 'Нужны URL, anon key и service role key.');
  check('Защита админки', env.ADMIN_PASSWORD?.length >= 16, 'ADMIN_PASSWORD: не менее 16 символов.');
  check('Подпись сессии', env.ADMIN_SESSION_SECRET?.length >= 32 && env.ADMIN_SESSION_SECRET !== env.ADMIN_PASSWORD, 'Отдельный ADMIN_SESSION_SECRET: не менее 32 символов.');
  check('Telegram', env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && /^[A-Za-z0-9_-]{32,256}$/.test(env.TELEGRAM_WEBHOOK_SECRET || ''), 'Бот, чат и отдельный секрет webhook: 32–256 символов A–Z, a–z, 0–9, _ и -.');
  check('Единый адрес', /^https:\/\/[^/]+\/?$/.test(env.NEXT_PUBLIC_SITE_URL || ''), 'Укажите HTTPS-адрес, включая временный адрес Vercel.');
  check('Реквизиты', legalOperatorComplete({ name: env.LEGAL_OPERATOR_NAME?.trim() || '', inn: env.LEGAL_OPERATOR_INN?.trim() || '', registration: env.LEGAL_OPERATOR_REGISTRATION?.trim() || '', address: env.LEGAL_OPERATOR_ADDRESS?.trim() || '', email: env.LEGAL_OPERATOR_EMAIL?.trim() || '' }), 'LEGAL_OPERATOR_NAME, INN, REGISTRATION, ADDRESS, EMAIL.');
  if (ads) check('Метрика', /^[1-9]\d*$/.test(env.NEXT_PUBLIC_YANDEX_METRIKA_ID || ''), 'Для рекламы нужен ID счётчика и проверенная цель lead_submit.');
  // An online release must never fall back to a valid local draft when the database is unavailable.
  let state;
  if (!online) {
    const file = path.resolve(root, env.CATALOG_LOCAL_PATH || '.local/catalog.json');
    state = fs.existsSync(file) ? migrateCommerce(JSON.parse(fs.readFileSync(file, 'utf8'))) : createInitialCommerce();
  }
  if (online) {
    try {
      const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, global: { fetch: (url, init) => request(url, { ...init, signal: AbortSignal.timeout(10000) }) } });
      const { data, error } = await db.from('site_commerce').select('state').eq('id', 'catalog').maybeSingle();
      const errorCode = error?.code && /^[A-Z0-9]{3,12}$/.test(error.code) ? ` Код: ${error.code}.` : '';
      check('Рабочая база каталога', !error && data?.state, error ? `Каталог недоступен: проверьте соединение, миграцию и права.${errorCode}` : data?.state ? 'Состояние прочитано из Supabase.' : 'Таблица доступна, но каталог ещё не перенесён.');
      if (!error && data?.state) state = migrateCommerce(data.state);
      const tables = [['leads', 'id,context'], ['saved_builds', 'id'], ['faq', 'id'], ['reviews', 'id'], ['site_settings', 'key']];
      const results = await Promise.allSettled(tables.map(async ([table, columns]) => db.from(table).select(columns).limit(0)));
      results.forEach((result, index) => check(`Таблица ${tables[index][0]}`, result.status === 'fulfilled' && !result.value.error, 'Проверка схемы и доступа service role; значения не выводятся.'));
    } catch { check('Рабочая база', false, 'Подключение не установлено. Проверьте проект и переменные окружения.'); }
  }
  if (online && !predeploy) {
    try {
      const response = await request(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`, { signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      const expected = `${(env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')}/api/telegram`;
      check('Адрес webhook', response.ok && data.ok && data.result?.url === expected && !data.result?.last_error_message, 'Должен совпадать с NEXT_PUBLIC_SITE_URL + /api/telegram и не иметь ошибки доставки.');
    } catch { check('Адрес webhook', false, 'Не удалось проверить webhook.'); }
  }
  check('Опубликованный каталог', state?.published, 'Нужен опубликованный снимок; старый демонстрационный каталог не является релизом.');
  if (state?.published) {
    const errors = validateCommerce(state.published, true);
    check('Составы и цены', !errors.length, errors.slice(0, 20).join('\n') || 'Серверная проверка пройдена.');
    const builds = state.published.builds.filter(b => b.published);
    check('Стартовый ассортимент', builds.length >= 12 && new Set(builds.map(b => b.series)).size === 5, 'Не менее 12 проверенных сборок пяти линеек.');
    for (const b of builds) {
      const images = [b.image, ...(b.gallery || []).map(p => p.src)];
      check(`Фотографии ${b.id}`, b.photosVerified && b.gallery?.length && images.every(src => src.startsWith('/') && !src.startsWith('//') && fs.existsSync(path.join(root, 'public', src))), 'Подтверждённое соответствие товару, галерея и доступные файлы.');
    }
  }
  return { checkedAt: new Date().toISOString(), mode: online ? 'online' : 'local', stage: predeploy ? 'predeploy' : 'acceptance', automatedChecksPassed: checks.every(c => c.ok), checks, manualAcceptance: ['После выкладки: установить защищённый webhook и повторить --online без --predeploy.', 'Подтвердить реквизиты, схему обработки данных и коммерческие обещания.', 'Три живые заявки: главная, карточка, конфигуратор; запись в базе, уведомление, изменение статуса.', 'Цена одинакова в каталоге, карточке и конфигураторе; мобильное оформление.', 'До рекламы: цель lead_submit видна в счётчике; клики учитываются отдельно.'] };
}
module.exports = { runPreflight };
if (require.main === module) {
  runPreflight({ online: process.argv.includes('--online'), predeploy: process.argv.includes('--predeploy'), ads: process.argv.includes('--ads') }).then(report => {
    console.log(JSON.stringify(report, null, 2));
    if (!report.automatedChecksPassed) process.exitCode = 1;
  }).catch(() => { console.error('Preflight не завершён: проверьте наличие и структуру каталога.'); process.exitCode = 1; });
}
