const fs=require('node:fs/promises');
(async()=>{
 const origin='http://localhost:3004';
 const sitemap=await (await fetch(origin+'/sitemap.xml')).text();
 const routes=[...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname))];
 const results=[];
 for(let i=0;i<routes.length;i+=3){
  results.push(...await Promise.all(routes.slice(i,i+3).map(async route=>{
   const r=await fetch(origin+route); const html=await r.text();
   return {route,status:r.status,title:html.match(/<title>(.*?)<\/title>/s)?.[1],h1Count:(html.match(/<h1[\s>]/g)||[]).length};
  })));
 }
 await fs.writeFile('docs/310fps/route-audit-2026-09-06.json',JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({count:results.length,issues:results.filter(r=>r.status!==200||r.h1Count!==1),routes:results.map(r=>r.route)},null,2));
})();
