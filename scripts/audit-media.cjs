// Read-only inventory of existing files and literal source references.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
async function walk(dir) {
  const files = [];
  for (const item of await fs.readdir(dir, {withFileTypes:true})) {
    if (item.name.startsWith('.')) continue;
    const name = path.join(dir,item.name);
    files.push(...(item.isDirectory() ? await walk(name) : [name]));
  }
  return files;
}
(async () => {
  const references = new Map();
  for (const file of await walk('src')) {
    if (!/\.(tsx?|css|json)$/.test(file)) continue;
    const text = await fs.readFile(file,'utf8');
    for (const match of text.matchAll(/(?:["'`(])(\/(?:images|media|videos|brand)\/[^"'`\s)<>${]+\.(?:png|jpe?g|webp|avif|svg|mp4|webm))/g)) {
      const refs = references.get(match[1]) || new Set(); refs.add(file); references.set(match[1],refs);
    }
  }
  const assets = [];
  for (const file of await walk('public')) {
    if (!/\.(png|jpe?g|webp|avif|svg|mp4|webm)$/i.test(file)) continue;
    const buffer = await fs.readFile(file);
    const url = '/'+path.relative('public',file);
    let metadata={};
    if (!/\.(mp4|webm)$/i.test(file)) {
      try { const m=await sharp(buffer).metadata(); metadata={width:m.width,height:m.height,format:m.format}; } catch { metadata={metadataError:true}; }
    }
    assets.push({url,bytes:buffer.length,...metadata,sha256:crypto.createHash('sha256').update(buffer).digest('hex'),referencedBy:[...(references.get(url)||[])]});
  }
  const existing = new Set(assets.map(a=>a.url));
  const missingLiteralReferences = [...references].filter(([url])=>!existing.has(url)).map(([url,refs])=>({url,referencedBy:[...refs]}));
  const byHash={}; for (const asset of assets) (byHash[asset.sha256]??=[]).push(asset.url);
  const report={generatedAt:new Date().toISOString(),note:'Literal source references include archived About variants and planned manifest slots. A missing literal is not automatically a broken public page.',count:assets.length,totalBytes:assets.reduce((a,b)=>a+b.bytes,0),missingLiteralReferences,exactDuplicates:Object.values(byHash).filter(a=>a.length>1),assets};
  await fs.mkdir('docs/310fps',{recursive:true});
  await fs.writeFile('docs/310fps/media-inventory-2026-09-06.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({count:report.count,totalMB:Math.round(report.totalBytes/1024/1024),missing:missingLiteralReferences,duplicates:report.exactDuplicates,largest:assets.filter(a=>a.referencedBy.length).sort((a,b)=>b.bytes-a.bytes).slice(0,12)},null,2));
})();
