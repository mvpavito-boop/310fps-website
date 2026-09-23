/* eslint-disable @typescript-eslint/no-require-imports -- Administrative CLI using the installed TypeScript runtime. */
// Preview by default. --apply appends missing records through versioned catalog storage.
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node' } });
require('tsconfig-paths/register');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { importWorkbook } = require('../src/lib/commerce/import-workbook');
const { readCommerce, writeCommerce, storageKind } = require('../src/lib/commerce/store');

async function main() {
  const args = process.argv.slice(2);
  const file = args.find(arg => !arg.startsWith('--'));
  if (!file || args.some(arg => arg.startsWith('--') && arg !== '--apply')) throw new Error('Укажите путь к XLSX и при необходимости --apply.');
  const current = await readCommerce();
  const result = await importWorkbook(await fs.readFile(path.resolve(file)), 'prices', current.draft, { addMissingOnly: true });
  const before = new Map(current.draft.components.map(c => [c.id, c]));
  const added = result.doc.components.filter(c => !before.has(c.id));
  for (const part of current.draft.components) assert.deepEqual(result.doc.components.find(c => c.id === part.id), part, `Изменена существующая позиция ${part.id}`);
  assert.deepEqual(result.doc.pricing, current.draft.pricing, 'Изменены настройки цен');
  assert.deepEqual(result.doc.builds, current.draft.builds, 'Изменены сборки');
  const apply = args.includes('--apply');
  const saved = apply && added.length ? await writeCommerce(result.doc, current.revision, false) : current;
  if (apply) {
    assert.deepEqual(saved.published, current.published, 'Публичный каталог должен остаться прежним');
    const reread = await readCommerce();
    assert(reread.revision >= saved.revision);
    assert(added.every(part => reread.draft.components.some(c => c.id === part.id)), 'Не все новые модели сохранились');
  }
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'preview', file: path.resolve(file), storage: storageKind(),
    previousRevision: current.revision, revision: saved.revision, before: current.draft.components.length,
    added: added.length, after: result.doc.components.length, builds: result.doc.builds.length,
    addedByCategory: Object.fromEntries([...new Set(added.map(c => c.category))].map(category => [category, added.filter(c => c.category === category).length])),
    newPricesFilled: added.filter(c => c.purchasePrice !== null).length,
    preservedExistingComponents: true, preservedBuilds: true, preservedPricing: true, preservedPublication: true }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
