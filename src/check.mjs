// QA: internal links/images resolve, SEO tags present, one H1 per page, titles preserved.
import fs from 'node:fs'; import path from 'node:path';
const DIST = path.resolve('dist'); const BASE = (process.env.BASE || '/');
const files = []; const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name); e.isDirectory() ? (e.name !== 'admin' && walk(p)) : p.endsWith('.html') && files.push(p); });
walk(DIST);
const exists = u => { let p = decodeURIComponent(u.split('#')[0].split('?')[0]); if (!p.startsWith(BASE)) return true; p = path.join(DIST, p.slice(BASE.length)); return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html'))); };
const broken = new Map(); const seo = []; let links = 0; let untracked = 0, noAlt = 0;
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8'); const rel = path.relative(DIST, f);
  for (const m of h.matchAll(/(?:href|src)="([^"]+)"/g)) { const u = m[1]; if (/^(https?:|mailto:|tel:|#|data:)/.test(u)) continue; links++; if (!exists(u)) broken.set(u, (broken.get(u) || []).concat(rel)); }
  for (const m of h.matchAll(/href="(https?:\/\/(?:www\.)?crawfordsmd\.com[^"]*)"/g)) if (!/tracking=fa202437c9/.test(m[1])) { untracked++; if (untracked <= 5) console.log('UNTRACKED', m[1], '←', rel); }
  const prose = (h.match(/<article class="prose">([\s\S]*?)<\/article>/) || [, ''])[1];
  noAlt += (prose.match(/<img (?![^>]*class="(?:card__img|byline__avatar|author-box__img)")[^>]*alt=""/g) || []).length;
  if (rel === '404.html') continue;
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1]; const d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const c = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (h1 !== 1 || !t || !d || !c || /192\.168\./.test(h)) seo.push(`${rel}: h1=${h1} title=${!!t} desc=${!!d} canon=${!!c}${/192\.168\./.test(h) ? ' LOCAL-IP' : ''}`);
}
console.log(`${files.length} pages · ${links} internal refs · ${broken.size} broken · ${seo.length} SEO issues · ${untracked} untracked Crawfords links · ${noAlt} content images without alt text (warning)`);
[...broken].slice(0, 25).forEach(([u, r]) => console.log('BROKEN', u, '←', r.slice(0, 3).join(', ')));
seo.slice(0, 25).forEach(x => console.log('SEO', x));
process.exitCode = broken.size || seo.length || untracked ? 1 : 0;
