// Loads CMS-managed content (Markdown + JSON in content/) into the shapes build.mjs renders.
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontMatter } from './frontmatter.mjs';
import { markdownToBlocks, youtubeId, ORIGIN } from './codec.mjs';

const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const list = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(ext)).sort() : []);
const metaFor = (root, kind, slug) => { const f = path.join(root, 'content/meta', kind, slug + '.json'); return fs.existsSync(f) ? readJson(f) : {}; };

export function derive(blocks) {
  const html = blocks.map(b => b.html || (b.items || []).join(' ')).join(' ');
  return {
    images: [...new Set([...html.matchAll(/@img:([^"]+)/g)].map(m => m[1]))],
    videos: blocks.filter(b => b.t === 'video').map(b => b.id),
    // A product box is affiliate content too: its "product:<key>" marker is not a URL (crawfords() ignores it).
    affiliateLinks: [...new Set([
      ...[...html.matchAll(/href="([^"]+)" data-kind="affiliate"/g)].map(m => m[1].replace(/&amp;/g, '&')),
      ...blocks.filter(b => b.t === 'product').map(b => `product:${b.key}`),
    ])],
  };
}

const blockText = blocks => blocks.map(b => (b.html || (b.items || []).join(' ')).replace(/<[^>]+>/g, ' ')).join(' ');
const words = blocks => blockText(blocks).split(/\s+/).filter(Boolean).length;
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

// Meta description fallback: the body's plain text, cut at a word boundary with no trailing punctuation.
export function excerpt(blocks, max = 155) {
  const text = decode(blockText(blocks)).replace(/\s+/g, ' ').replace(/ ([.,;:!?)])/g, '$1').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1), at = cut.lastIndexOf(' ');
  return (at > 0 ? cut.slice(0, at) : text.slice(0, max)).replace(/[\s\p{P}\p{S}]+$/u, '');
}

const RESERVED_PAGES = new Set(['videos', 'blog', 'admin', 'assets', 'img', '404']);
const londonDate = now => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(now); // YYYY-MM-DD
const codecCtx = (resolver, entry, onProblem) => ({ ...resolver, onMissingImage: src => onProblem?.(entry, `image not found: ${src}`) });

export function loadPosts(root, { resolver, now = new Date(), onProblem }) {
  const out = [];
  const today = londonDate(now);
  for (const f of list(path.join(root, 'content/posts'), '.md')) {
    const slug = f.slice(0, -3);
    const { data, body } = parseFrontMatter(fs.readFileSync(path.join(root, 'content/posts', f), 'utf8'));
    if (data.draft === true) continue;
    const date = data.datePublished ? String(data.datePublished) : '';
    if (date && date.slice(0, 10) > today) continue;
    const meta = metaFor(root, 'posts', slug);
    const blocks = markdownToBlocks(body, codecCtx(resolver, `posts/${slug}`, onProblem));
    const liveUrl = meta.liveUrl || `${ORIGIN}/blog/${slug}/`;
    const title = data.title || slug;
    const seo = { canonical: liveUrl, ...(meta.seo || {}), ...(data.seo || {}) };
    seo.title ||= title; seo.description ||= data.summary || excerpt(blocks);
    if (!Array.isArray(seo.jsonld) || !seo.jsonld.length) seo.jsonld = [{ '@type': 'BlogPosting', '@context': 'https://schema.org', headline: title, description: seo.description, datePublished: date, author: { '@type': 'Person', name: 'Paul Cee' }, mainEntityOfPage: liveUrl }];
    const cover = data.cover ? (resolver.keyForFile(String(data.cover)) || String(data.cover)) : null;
    out.push({
      type: 'post', slug, liveUrl, title, seo, datePublished: date, dateModified: meta.dateModified || date,
      author: meta.author || 'Paul Cee', category: meta.category || '', categorySlug: meta.categorySlug || '',
      tags: data.tags || [], readTime: 'readTime' in meta ? meta.readTime : Math.max(1, Math.round(words(blocks) / 200)),
      summary: data.summary || '', cover, heroVideo: data.heroVideo ? youtubeId(data.heroVideo) : null,
      topicKey: data.topic || null, adSlots: meta.adSlots || [], blocks, ...derive(blocks),
    });
  }
  return out.sort((a, b) => (b.datePublished || '').localeCompare(a.datePublished || ''));
}

export function loadPages(root, { resolver, onProblem }) {
  const pages = {};
  for (const f of list(path.join(root, 'content/pages'), '.md')) {
    const slug = f.slice(0, -3);
    if (RESERVED_PAGES.has(slug)) { onProblem?.(`pages/${slug}`, `"${slug}" is a reserved page slug (used by the site); rename the page`); continue; }
    const { data, body } = parseFrontMatter(fs.readFileSync(path.join(root, 'content/pages', f), 'utf8'));
    const meta = metaFor(root, 'pages', slug);
    const blocks = markdownToBlocks(body, codecCtx(resolver, `pages/${slug}`, onProblem));
    const liveUrl = meta.liveUrl || `${ORIGIN}/${slug === 'index' ? '' : slug + '/'}`;
    const seo = { canonical: liveUrl, jsonld: [], ...(meta.seo || {}), ...(data.seo || {}) };
    seo.title ||= data.title || slug; seo.description ||= excerpt(blocks);
    pages[slug] = { type: 'page', slug, liveUrl, h1: data.title || '', seo, adSlots: meta.adSlots || [], blocks, ...derive(blocks) };
  }
  return pages;
}

const ordered = dir => list(dir, '.json').map(f => readJson(path.join(dir, f))).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

export const loadTopics = root => ordered(path.join(root, 'content/topics')).map(t => [t.key, t.label, new RegExp(t.match || '(?!)', 'i')]);

export const loadProducts = root => ordered(path.join(root, 'content/products')).map(p => ({
  key: p.key, name: p.name, path: p.path, cat: p.cat, img: p.img || undefined, re: new RegExp(p.match || '(?!)', 'i'),
  compare: p.compare && p.compare.length ? p.compare.map(c => [c.path, c.label]) : undefined,
}));

export const loadSettings = root => readJson(path.join(root, 'content/settings.json'));

export function loadEvents(root, { today }) {
  const dir = path.join(root, 'content/events');
  const all = list(dir, '.json').map(f => ({ slug: f.slice(0, -5), ...readJson(path.join(dir, f)) })).filter(e => e.name && e.start);
  const isPast = e => String(e.end || e.start).slice(0, 10) < today;
  return {
    upcoming: all.filter(e => !isPast(e)).sort((a, b) => String(a.start).localeCompare(String(b.start))),
    past: all.filter(isPast).sort((a, b) => String(b.start).localeCompare(String(a.start))),
  };
}
