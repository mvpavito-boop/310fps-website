/* An explicit release file never loads the working .env.local. Values stay out of logs. */
const fs = require('node:fs');

function loadReleaseEnv(args = process.argv.slice(2)) {
  const index = args.indexOf('--env-file');
  if (index < 0) {
    require('@next/env').loadEnvConfig(process.cwd());
    return;
  }
  const file = args[index + 1];
  if (!file || file.startsWith('--')) throw new Error('Укажите файл после --env-file.');
  let values;
  try { values = require('dotenv').parse(fs.readFileSync(file)); }
  catch { throw new Error('Не удалось прочитать --env-file; проверьте путь и доступ.'); }
  Object.assign(process.env, values);
}

module.exports = { loadReleaseEnv };
