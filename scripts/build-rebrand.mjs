import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite, escapeHTML } from '../src/rebrand/site.js';
import { metadata } from '../src/rebrand/content.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'src/site');
const authored = path.join(root, 'src/rebrand');
const destination = path.join(root, 'public/rebrand');
await mkdir(destination, { recursive: true });
for (const file of await readdir(authored)) {
  if (/\.(?:js|css)$/.test(file)) await copyFile(path.join(authored, file), path.join(destination, file));
}

const mapping = JSON.parse(await readFile(path.join(root, 'public/asset-map.json'), 'utf8'));
const oldRoutes = JSON.parse(await readFile(path.join(site, 'route-map.json'), 'utf8'));
// This folder is generated. Remove stale captured HTML from public output;
// byte-exact originals remain recoverable under src/source.
await rm(site, { recursive: true, force: true });
await mkdir(site, { recursive: true });
const paths = ['/', '/models', '/research', '/contact', '/pricing', '/use-cases', '/docs', '/privacy-policy', '/terms-and-conditions', ...['financial-research', 'banking', 'corporate-finance', 'document-intelligence', 'autonomous-workflows'].map(slug => `/use-cases/${slug}`)];
const titles = {
  '/': metadata.title,
  '/models': 'fx-1 & fx-1 lite — artificial hedge',
  '/research': 'research & evaluation — artificial hedge',
  '/contact': 'contact — artificial hedge',
  '/pricing': 'model subscriptions & API pricing — artificial hedge',
  '/use-cases': 'applications — artificial hedge',
  '/docs': 'documentation — artificial hedge',
  '/privacy-policy': 'privacy — artificial hedge',
  '/terms-and-conditions': 'terms — artificial hedge',
};
function pageHTML(route) {
  const title = titles[route] || (route.startsWith('/use-cases/') ? `${route.split('/').pop().replaceAll('-', ' ')} — artificial hedge` : 'page not found — artificial hedge');
  const e = escapeHTML;
  const favicon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#ff571a"/><text x="32" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" fill="black">ah</text></svg>');
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(metadata.description)}"><meta property="og:site_name" content="artificial hedge"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(metadata.description)}"><meta property="og:type" content="website"><meta name="theme-color" content="#000000"><link rel="icon" href="${e(favicon)}"><link rel="preload" href="/assets/ba735de2e2a73648-DzOmvPT3Ngtn44pFtTiDqddsgk.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/3f985e5faf719394-m9VYcRxyyn0ZP3WI9vRSpNBosKU.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/rebrand/site.css"><link rel="stylesheet" href="/rebrand/visuals.css"><link rel="stylesheet" href="/rebrand/pages.css"><script>window.__HYDRA_ASSET_MAP__=${JSON.stringify(mapping).replaceAll('</', '<\\/')}</script><script src="/local-runtime.js"></script><script type="module" src="/rebrand/app.js"></script></head><body>${renderSite(route)}</body></html>`;
}

const routes = {}, redirects = {};
for (const route of paths) {
  const relative = route === '/' ? 'index.html' : route.slice(1) + '/index.html';
  const filename = path.join(site, relative);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, pageHTML(route));
  routes[route] = relative;
}
await writeFile(path.join(site, '404.html'), pageHTML('/404'));
// The source database archive remains in src/source. Legacy product URLs lead
// to the corresponding new company page instead of relabelling foreign articles.
for (const route of [...Object.keys(oldRoutes.routes), ...Object.keys(oldRoutes.redirects)]) {
  if (routes[route]) continue;
  redirects[route] = route.startsWith('/blog') ? '/research' : route.startsWith('/use-cases') ? '/use-cases' : route.startsWith('/alternatives') ? '/models' : route.includes('privacy') ? '/privacy-policy' : route.includes('terms') ? '/terms-and-conditions' : '/models';
}
Object.assign(redirects, {'/about':'/models','/blog':'/research','/benchmarks':'/#benchmarks','/architecture':'/#architecture','/terms-of-service':'/terms-and-conditions','/demo':'/contact','/hydragraph':'/models','/fx-1':'/models#fx-1','/fx-1-lite':'/models#fx-1-lite','/dipcatcher':'/pricing#dipcatcher'});
await writeFile(path.join(site, 'route-map.json'), JSON.stringify({routes, redirects}, null, 2));
await writeFile(path.join(site, 'rebrand-report.json'), JSON.stringify({brand:'artificial hedge',models:['fx-1','fx-1 lite'],public_pages:paths.length,legacy_redirects:Object.keys(redirects).length,original_capture:'src/source',evaluations:23,evaluation_model:'fx-1',score_source:'user-provided',GDPval_AA_v2:'1732 Elo',pricing_type:'model usage subscriptions',dipcatcher_status:'under development / releasing soon / waitlist',dipcatcher_free_bundle:'when available until research preview ends',research_preview_ends:'2026-12-12'},null,2));
console.log(`Rebranded ${paths.length} public pages, ${Object.keys(redirects).length} legacy redirects, 23 reported evaluations.`);
