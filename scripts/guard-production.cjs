// Preview builds can show work in progress; production requires verified stored data.
if (process.env.VERCEL_ENV === 'production') {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(process.execPath, ['scripts/release-check.cjs', '--online'], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
