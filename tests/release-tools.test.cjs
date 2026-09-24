const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { runPreflight } = require('../scripts/release-check.cjs');

test('predeploy keeps secret and database checks but does not require switching the active webhook', async () => {
  const env = {
    CATALOG_STORAGE: 'supabase', NEXT_PUBLIC_SITE_URL: 'https://release.test',
    ADMIN_PASSWORD: 'test-password-long-enough', ADMIN_SESSION_SECRET: 's'.repeat(40),
    TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_CHAT_ID: '123', TELEGRAM_WEBHOOK_SECRET: 'w'.repeat(40),
  };
  const createClient = () => ({ from: () => ({ select: () => ({
    eq: () => ({ maybeSingle: async () => ({ data: null, error: { code: 'PGRST205' } }) }),
    limit: async () => ({ error: { code: 'PGRST205' } }),
  }) }) });
  let calls = 0;
  const request = async () => { calls++; return Response.json({ ok: true, result: { url: 'https://old.test/api/telegram' } }); };
  const before = await runPreflight({ env, online: true, predeploy: true, createClient, request });
  assert.equal(calls, 0);
  assert.equal(before.automatedChecksPassed, false);
  assert.equal(before.checks.find(c => c.name === 'Рабочая база каталога').ok, false);
  assert.equal(before.checks.find(c => c.name === 'Опубликованный каталог').ok, false);
  assert.equal(before.checks.find(c => c.name === 'Подпись сессии').ok, true);
  assert.equal(before.checks.some(c => c.name === 'Адрес webhook'), false);
  const after = await runPreflight({ env: { ...env, ADMIN_SESSION_SECRET: '' }, online: true, createClient, request });
  assert.equal(calls, 1);
  assert.equal(after.checks.find(c => c.name === 'Адрес webhook').ok, false);
  assert.equal(after.checks.find(c => c.name === 'Подпись сессии').ok, false);
  const verified = await runPreflight({ env, online: true, createClient, request: async () => Response.json({ ok: true, result: { url: 'https://release.test/api/telegram' } }) });
  assert.equal(verified.checks.find(c => c.name === 'Адрес webhook').ok, true);
});

test('an explicit environment file overrides the shell without loading local working secrets', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), '310fps-release-env-'));
  try {
    fs.writeFileSync(path.join(folder, '.env.local'), 'LOCAL_ONLY=must-not-load\nRELEASE_VALUE=working\n');
    fs.writeFileSync(path.join(folder, 'candidate.env'), 'RELEASE_VALUE="ИП тест"\n');
    const helper = path.resolve(__dirname, '../scripts/release-env.cjs');
    const code = `require(${JSON.stringify(helper)}).loadReleaseEnv(['--env-file','candidate.env']);process.stdout.write(JSON.stringify({value:process.env.RELEASE_VALUE,local:process.env.LOCAL_ONLY}));`;
    const env = { ...process.env, RELEASE_VALUE: 'inherited' };
    delete env.LOCAL_ONLY;
    const result = spawnSync(process.execPath, ['-e', code], { cwd: folder, env, encoding: 'utf8' });
    assert.equal(result.status, 0);
    assert.deepEqual(JSON.parse(result.stdout), { value: 'ИП тест' });
    const missing = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(helper)}).loadReleaseEnv(['--env-file','missing.env'])`], { cwd: folder, env, encoding: 'utf8' });
    assert.notEqual(missing.status, 0);
    assert.ok(!missing.stdout.includes('must-not-load'));
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});
