/* Dry run by default. Explicit revision protects an existing remote catalog. */
try { require('./release-env.cjs').loadReleaseEnv(); }
catch (error) { console.error(error.message); process.exit(1); }
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node' } });
require('tsconfig-paths/register');
const fs = require('node:fs');
const { createClient } = require('@supabase/supabase-js');
const { migrateCommerce, validateCommerce } = require('../src/lib/commerce/model');
async function main() {
  const local = migrateCommerce(JSON.parse(fs.readFileSync(process.env.CATALOG_LOCAL_PATH || '.local/catalog.json', 'utf8')));
  const errors = [...validateCommerce(local.draft), ...(local.published ? validateCommerce(local.published, true) : [])];
  if (errors.length) throw new Error(errors.slice(0, 10).join('\n'));
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(10000) }) } });
  const { data, error } = await db.from('site_commerce').select('state,revision').eq('id', 'catalog').maybeSingle();
  if (error) throw new Error('Не удалось прочитать удалённый каталог. Сначала примените SQL-миграции.');
  const revision = data?.revision ?? 0;
  console.log(JSON.stringify({ localRevision: local.revision, remoteRevision: revision, components: local.draft.components.length, builds: local.draft.builds.length, hasPublishedSnapshot: Boolean(local.published), apply: process.argv.includes('--apply') }));
  if (!process.argv.includes('--apply')) return;
  const index = process.argv.indexOf('--expected-remote-revision');
  if (index < 0 || !/^\d+$/.test(process.argv[index + 1] || '') || Number(process.argv[index + 1]) !== revision) throw new Error('Повторите dry run; укажите --expected-remote-revision с проверенной версией.');
  const folder = `.local/migration-backups/${new Date().toISOString().replace(/[:.]/g, '-')}`;
  fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
  fs.writeFileSync(`${folder}/local.json`, JSON.stringify(local), { flag: 'wx', mode: 0o600 });
  fs.writeFileSync(`${folder}/remote.json`, JSON.stringify(data), { flag: 'wx', mode: 0o600 });
  const next = { ...local, revision: revision + 1, updatedAt: new Date().toISOString() };
  const result = await db.rpc('save_site_commerce', { expected_revision: revision, next_state: next });
  if (result.error) throw new Error('Перенос не выполнен: ошибка или конфликт версии. Резервные копии сохранены.');
  const verified = await db.from('site_commerce').select('state').eq('id', 'catalog').single();
  const { isDeepStrictEqual } = require('node:util');
  if (verified.error || !isDeepStrictEqual(verified.data?.state, next)) throw new Error('Запись отправлена, но контрольное чтение не совпало. Проверьте базу до повторной попытки.');
  console.log('Перенос подтверждён контрольным чтением. Черновик не опубликован автоматически.');
}
main().catch(error => { console.error(error.message?.startsWith('Не ') || error.message?.startsWith('Перенос') || error.message?.startsWith('Повторите') || error.message?.startsWith('Запись') ? error.message : 'Перенос не завершён. Проверьте конфигурацию и доступность базы.'); process.exitCode = 1; });
