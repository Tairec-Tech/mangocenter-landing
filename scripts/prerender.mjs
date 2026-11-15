import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PAGES } from '../src/pages.ts';
import { STORES } from '../src/data.ts';
const raw = readFileSync('dist/index.html', 'utf8');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const configured = process.env.VITE_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
const base = configured ? new URL(configured).origin : '';
const schema = JSON.stringify({ '@context':'https://schema.org','@graph':STORES.map(s=>({ '@type':'HardwareStore', name:s.name, telephone:s.phone, address:{'@type':'PostalAddress',streetAddress:s.address,addressLocality:s.city,addressRegion:s.stateFilter,addressCountry:'VE'}, geo:{'@type':'GeoCoordinates',latitude:s.lat,longitude:s.lng}, hasMap:s.mapsUrl, ...(base ? {url:`${base}/contacto`,image:`${base}/media/sedes.webp`} : {}) })) }).replaceAll('<','\\u003c');
for (const [key,page] of Object.entries(PAGES)) {
 let html=raw.replace(/<title>.*?<\/title>/s,`<title>${esc(page.title)}</title>`).replace(/<meta\s+name="description"[\s\S]*?\/>/,`<meta name="description" content="${esc(page.description)}" />`);
 html=html.replace(/(<div id="view-[^"]+" class="spa-view)(?: view-hidden)?("[^>]*>)/g,(_,a,b)=>a+(a.includes(`view-${key}"`)?'':' view-hidden')+b);
 const tags=[['robots',page.noindex?'noindex,follow':'index,follow'],['twitter:card','summary_large_image'],['twitter:title',page.title],['twitter:description',page.description]].map(([k,v])=>`<meta name="${k}" content="${esc(v)}">`);
 for(const [k,v] of Object.entries({title:page.title,description:page.description,type:'website',locale:'es_VE',site_name:'MangoCenter',image:`${base}/social-card.jpg`,'image:alt':'MangoCenter: todo para tu obra y tu hogar',...(base?{url:base+page.path}:{})})) tags.push(`<meta property="og:${k}" content="${esc(v)}">`);
 tags.push(`<meta name="twitter:image" content="${base}/social-card.jpg">`,`<script type="application/ld+json">${schema}</script>`);
 if(base)tags.push(`<link rel="canonical" href="${base}${page.path}">`);
 html=html.replace('</head>',tags.join('\n')+'\n</head>');
 const target=key==='inicio'?'dist/index.html':key==='no-encontrado'?'dist/404.html':`dist${page.path}/index.html`;
 mkdirSync(target.substring(0,target.lastIndexOf('/')),{recursive:true});writeFileSync(target,html);
}
if(base){writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.values(PAGES).filter(p=>!p.noindex).map(p=>`<url><loc>${esc(base+p.path)}</loc></url>`).join('')}</urlset>`);writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);}
console.log(`Prerendered ${Object.keys(PAGES).length} routes. ${base?'Canonical URLs and sitemap generated.':'Set VITE_SITE_URL for absolute canonical URLs and sitemap.'}`);
