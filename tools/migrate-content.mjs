// One-off migration: content JSON blocks -> Markdown + front matter (+ sidecar meta), and
// topics/products/settings out of code into content/ JSON collections. Completed one-off, kept for
// reference only: the JSON sources it read are gone, so do not re-run it against the current content.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blocksToMarkdown } from '../src/content/codec.mjs';
import { stringifyFrontMatter } from '../src/content/frontmatter.mjs';
import { createImageResolver } from '../src/content/images.mjs';
import { TOPICS, DISCOUNT, DISCLOSURE, TAGLINE, HOME } from '../src/site.config.mjs';
import { PRODUCTS, YT } from '../src/commerce.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C = p => path.join(ROOT, 'content', p);
const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, d) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n'); };
const images = readJson(C('images.json'));
const ctx = createImageResolver(ROOT, images);
const clean = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)));
const topicOf = p => { const hay = `${p.category} ${p.title} ${p.slug}`; for (const [k, , re] of TOPICS) if (re.test(hay)) return k; return 'detecting'; };
const splitSeo = seo => ({ fm: clean({ title: seo.title, description: seo.description, keywords: seo.keywords }), meta: clean({ canonical: seo.canonical, robots: seo.robots, og: seo.og, twitter: seo.twitter, jsonld: seo.jsonld, verification: seo.verification }) });

let n = 0;
for (const f of fs.readdirSync(C('posts')).filter(f => f.endsWith('.json'))) {
  const p = readJson(C('posts/' + f)); const { fm, meta } = splitSeo(p.seo);
  const data = clean({ title: p.title, datePublished: p.datePublished, topic: topicOf(p), tags: p.tags, cover: p.cover ? ctx.fileForKey(p.cover) : undefined, heroVideo: p.heroVideo, summary: p.summary, seo: fm });
  fs.writeFileSync(C(`posts/${p.slug}.md`), stringifyFrontMatter(data, blocksToMarkdown(p.blocks, ctx)));
  writeJson(C(`meta/posts/${p.slug}.json`), { liveUrl: p.liveUrl, author: p.author, category: p.category, categorySlug: p.categorySlug, readTime: p.readTime, dateModified: p.dateModified, adSlots: p.adSlots, seo: meta });
  n++;
}
for (const f of fs.readdirSync(C('pages')).filter(f => f.endsWith('.json'))) {
  const r = readJson(C('pages/' + f)); const { fm, meta } = splitSeo(r.seo);
  fs.writeFileSync(C(`pages/${r.slug}.md`), stringifyFrontMatter({ title: r.h1 || '', seo: fm }, blocksToMarkdown(r.blocks, ctx)));
  writeJson(C(`meta/pages/${r.slug}.json`), { liveUrl: r.liveUrl, adSlots: r.adSlots, seo: meta });
  n++;
}
TOPICS.forEach(([key, label, re], i) => writeJson(C(`topics/${key}.json`), { key, label, description: '', match: re.source, order: i + 1 }));
PRODUCTS.forEach((p, i) => writeJson(C(`products/${p.key}.json`), { key: p.key, name: p.name, path: p.path, cat: p.cat, img: p.img ? ctx.fileForKey(p.img) || p.img : '', compare: (p.compare || []).map(([u, l]) => ({ path: u, label: l })), match: p.re.source, order: i + 1 }));
writeJson(C('settings.json'), { discount: DISCOUNT, disclosure: DISCLOSURE, tagline: TAGLINE, home: { h1: HOME.h1, sub: HOME.sub }, youtube: YT.stats });
fs.mkdirSync(C('events'), { recursive: true }); fs.writeFileSync(C('events/.gitkeep'), '');
console.log(`Migrated ${n} entries, ${TOPICS.length} topics, ${PRODUCTS.length} products, settings`);
