// Compare two built sites page by page on SEO and content signals.
// Usage: node tools/compare-output.mjs <baselineDir> <candidateDir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const decode = s => String(s).replace(/&nbsp;/g, ' ').replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const text = s => decode(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));

export function extract(html) {
  const head = (html.match(/<head>([\s\S]*?)<\/head>/) || [, ''])[1];
  const meta = {};
  for (const tag of head.match(/<meta [^>]+>/g) || []) { const a = attrs(tag); const k = a.name || a.property; if (k) meta[k] = a.content; }
  const ads = (html.match(/class="ad[ "]/g) || []).length;
  const main = (html.match(/<main id="main">([\s\S]*)<\/main>/) || [, ''])[1]
    .replace(/<aside class="ad[^"]*"[\s\S]*?<\/aside>/g, ' ')
    .replace(/<div class="ad"><ins[\s\S]*?<\/script><\/div>/g, ' ');
  const prose = [...main.matchAll(/<article class="prose">([\s\S]*?)<\/article>/g)].map(m => m[1]).join(' ');
  return {
    title: text((head.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1]),
    meta,
    canonical: (head.match(/<link rel="canonical" href="([^"]*)"/) || [, ''])[1],
    jsonld: (head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [, ''])[1],
    headings: [...main.matchAll(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/g)].map(m => `${m[1]}:${text(m[2])}`),
    images: [...new Set([...main.matchAll(/<img [^>]*>/g)].map(m => { const a = attrs(m[0]); return `${a.src}|${a.alt ?? ''}`; }))].sort(),
    links: [...new Set([...main.matchAll(/<a [^>]*>/g)].map(m => attrs(m[0]).href).filter(Boolean))].sort(),
    videos: [...main.matchAll(/data-yt="([^"]+)"/g)].map(m => m[1]),
    ads,
    prose: text(prose),
  };
}

export function diffPage(a, b) {
  const out = [];
  for (const k of ['title', 'canonical', 'jsonld', 'prose']) if (a[k] !== b[k]) out.push(k);
  for (const k of new Set([...Object.keys(a.meta), ...Object.keys(b.meta)])) if (a.meta[k] !== b.meta[k]) out.push(`meta:${k}`);
  for (const k of ['headings', 'images', 'links', 'videos']) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out.push(k);
  if (a.ads !== b.ads) out.push('ads');
  return out;
}

function detail(k, a, b) {
  if (Array.isArray(a[k])) {
    const missing = a[k].filter(x => !b[k].includes(x)).slice(0, 3), added = b[k].filter(x => !a[k].includes(x)).slice(0, 3);
    return `  - ${missing.join(' | ')}\n  + ${added.join(' | ')}`;
  }
  const x = String(k.startsWith('meta:') ? a.meta[k.slice(5)] : a[k]), y = String(k.startsWith('meta:') ? b.meta[k.slice(5)] : b[k]);
  let i = 0; while (i < x.length && x[i] === y[i]) i++;
  return `  - …${x.slice(Math.max(0, i - 40), i + 60)}\n  + …${y.slice(Math.max(0, i - 40), i + 60)}`;
}

function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (path.relative(base, p) !== 'admin') walk(p, base, out); }
    else if (p.endsWith('.html')) out.push(path.relative(base, p));
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [baseDir, candDir] = process.argv.slice(2);
  const pages = walk(baseDir); let bad = 0;
  for (const rel of pages) {
    const cf = path.join(candDir, rel);
    if (!fs.existsSync(cf)) { bad++; console.log(`MISSING ${rel}`); continue; }
    const a = extract(fs.readFileSync(path.join(baseDir, rel), 'utf8')), b = extract(fs.readFileSync(cf, 'utf8'));
    const d = diffPage(a, b);
    if (d.length) { bad++; console.log(`DIFF ${rel}: ${d.join(', ')}`); for (const k of d.slice(0, 2)) console.log(detail(k, a, b)); }
  }
  const extra = walk(candDir).filter(r => !pages.includes(r));
  console.log(`${pages.length} pages compared · ${bad} differing · ${extra.length} new in candidate`);
  process.exitCode = bad ? 1 : 0;
}
