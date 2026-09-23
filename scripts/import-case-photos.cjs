/* Copy finished WebP exports byte-for-byte. Never copy originals or private manifests. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Usage: node scripts/import-case-photos.cjs <finished-case-library>');
const index = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
const output = [];
let bytes = 0;
function inside(base, relative) {
  const resolved = path.resolve(base, relative);
  if (!resolved.startsWith(base + path.sep)) throw new Error('Path outside photo library');
  return resolved;
}
for (const item of index.cases) for (const color of item.colors) {
  const manifests = new Map([[color.manifest, 'Основная серия']]);
  for (const variant of [...(color.series || []), ...(color.lightingVariants || [])])
    manifests.set(variant.manifest, variant.label);
  let series = 0;
  for (const [relative, label] of manifests) {
    const manifestPath = inside(root, relative);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const id = `${item.id}-${color.id}-${++series}`;
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Invalid case ID');
    const photos = [];
    for (const photo of manifest.photos || []) {
      const exported = {};
      for (const [key, folder] of [['src', 'gallery-4x3'], ['cover', 'catalog-16x10']]) {
        const file = photo.files.find(f => f.path.startsWith(folder + '/') && f.path.endsWith('.webp'));
        if (!file) continue;
        const source = inside(path.dirname(manifestPath), file.path);
        const data = fs.readFileSync(source);
        if (file.sha256 && crypto.createHash('sha256').update(data).digest('hex') !== file.sha256)
          throw new Error(`Checksum mismatch: ${id}/${photo.id}`);
        const name = path.basename(file.path);
        if (!/^[\w.-]+\.webp$/.test(name)) throw new Error('Invalid photo filename');
        const target = `public/images/cases/${id}/${folder}/${name}`;
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, data);
        bytes += data.length;
        exported[key] = '/' + target.slice('public/'.length);
      }
      if (exported.src && exported.cover) photos.push({ ...exported, alt: `${item.name}, ${color.label}: ${photo.label || photo.id}`.slice(0, 240) });
    }
    if (photos.length) output.push({ id, name: `${item.name} · ${color.label} · ${label}`, photos });
  }
}
fs.writeFileSync('src/lib/data/case-photos.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ series: output.length, photos: output.reduce((n, c) => n + c.photos.length, 0), bytes }));
