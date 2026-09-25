// Extracts content + SEO metadata from the WebSite X5 preview export (pages)
// and the live blog HTML (posts) into clean JSON for the new site.
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SCR = process.env.X5_WORKDIR || path.resolve(__dirname, '..'); // folder holding src/Preview (X5 export) and live/ (fetched blog)
const PREVIEW = path.join(SCR, 'src/Preview');
const LIVEBLOG = path.join(SCR, 'live/blog');
const OUT = process.argv[2];
const ORIGIN = 'https://www.paulcee.co.uk';

fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'posts'), { recursive: true });

// Live sitemap decides which pages are real + their live extension (.html/.php)
const LIVE_PAGES = fs.readFileSync(path.join(SCR, 'live/sitemap-pages.txt'), 'utf8').trim().split(/\r?\n/);
const liveUrlFor = {};
for (const u of LIVE_PAGES) {
  const file = u.replace(ORIGIN + '/', '');
  const base = file.replace(/\.(html|php)$/, '');
  liveUrlFor[base === 'index' ? 'index' : base] = u;
}

const AFFILIATE_HOSTS = /(crawfordsmd\.com|minelab\.com|bit\.ly|amzn\.|amazon\.|ebay\.|awin|tidd\.ly|swagier|coiltek|emite|anderson)/i;
const assets = new Map(); // key: source rel path -> {from, alts:Set}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function urlFromOnclick(oc) {
  if (!oc) return null;
  const m = oc.match(/url:\s*'([^']+)'/) || oc.match(/imPopUpWin\('([^']+)'/) || oc.match(/location(?:\.href)?\s*=\s*'([^']+)'/) || oc.match(/window\.open\('([^']+)'/);
  return m ? m[1] : null;
}

// Normalise an href. Returns {href, kind}
function normHref(href, ctx) {
  if (!href) return null;
  href = href.trim();
  if (/^(javascript:|#$)/i.test(href)) return null;
  if (/^mailto:|^tel:/i.test(href)) return { href, kind: 'contact' };
  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href);
      if (/paulcee\.co\.uk$/i.test(u.hostname)) return internal(u.pathname.replace(/^\//, '') + u.search, ctx);
    } catch { }
    return { href, kind: AFFILIATE_HOSTS.test(href) ? 'affiliate' : 'external' };
  }
  if (href.startsWith('//')) return { href: 'https:' + href, kind: 'external' };
  return internal(href, ctx);
}
function internal(p, ctx) {
  // resolve relative to the page directory
  let rel = ctx.isPost ? path.posix.normalize('blog/' + p) : path.posix.normalize(p);
  rel = rel.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
  if (/^blog\/(index\.php)?\?/.test(rel) || /^blog\/?\?/.test(rel) || /^\?/.test(p) && ctx.isPost) {
    const q = (rel.split('?')[1] || p.replace(/^\?/, '')).split('&')[0];
    if (/^(category|tag|month|author|start)=/.test(q)) return { href: '@blog/', kind: 'internal' };
    return { href: '@blog/' + q + '/', kind: 'internal' };
  }
  if (/^blog\/?(index\.(php|html))?$/.test(rel)) return { href: '@blog/', kind: 'internal' };
  const m = rel.match(/^([a-z0-9-]+)\.(html|php)(#.*)?$/i);
  if (m) return { href: '@' + (m[1] === 'index' || m[1] === 'home' ? '' : m[1] + '/') + (m[3] || ''), kind: 'internal' };
  if (/\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(rel)) return { href: '@asset:' + rel, kind: 'asset' };
  return { href: ORIGIN + '/' + rel, kind: 'external' };
}

function registerImg(src, ctx, alt) {
  if (!src || src.startsWith('data:')) return null;
  let rel;
  if (/^https?:\/\//.test(src)) {
    const u = new URL(src);
    if (!/paulcee\.co\.uk$/i.test(u.hostname)) return { ext: src };
    rel = u.pathname.replace(/^\//, '');
  } else {
    rel = (ctx.isPost ? path.posix.normalize('blog/' + src) : path.posix.normalize(src)).replace(/^(\.\.\/)+/, '');
  }
  rel = decodeURIComponent(rel.split('?')[0]);
  if (!assets.has(rel)) assets.set(rel, { rel, alts: new Set(), usedBy: new Set() });
  const a = assets.get(rel);
  if (alt) a.alts.add(alt);
  a.usedBy.add(ctx.slug);
  return { rel };
}

const BLOCK = new Set(['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'section', 'article', 'header', 'footer', 'figure', 'iframe', 'hr']);

// Convert a DOM subtree to clean semantic HTML
function clean($, root, ctx) {
  const out = [];
  let inline = []; // pending inline buffer for current paragraph
  const flush = (cls) => {
    const html = inline.join('').replace(/(<br>\s*)+$/g, '').replace(/^(\s*<br>)+/g, '').trim();
    if (html && html.replace(/<br>|&nbsp;|\s/g, '')) out.push({ t: 'p', html, cls });
    inline = [];
  };
  const inl = (node) => {
    if (node.type === 'text') return esc(node.data.replace(/\s+/g, ' '));
    if (node.type !== 'tag') return '';
    const $n = $(node); const tag = node.tagName.toLowerCase();
    const kids = () => node.children.map(inl).join('');
    switch (tag) {
      case 'br': return '<br>';
      case 'b': case 'strong': { const k = kids(); return k.trim() ? `<strong>${k}</strong>` : k; }
      case 'i': case 'em': { const k = kids(); return k.trim() ? `<em>${k}</em>` : k; }
      case 'img': {
        const r = registerImg($n.attr('src'), ctx, $n.attr('alt'));
        if (!r) return '';
        ctx.images.push(r.rel || r.ext);
        return `<img src="${attr(r.rel ? '@img:' + r.rel : r.ext)}" alt="${attr($n.attr('alt') || '')}"${$n.attr('title') ? ` title="${attr($n.attr('title'))}"` : ''} width="${$n.attr('width') || ''}" height="${$n.attr('height') || ''}">`;
      }
      case 'a': case 'button': {
        const n = normHref($n.attr('href'), ctx) || normHref(urlFromOnclick($n.attr('onclick')), ctx);
        const k = kids();
        if (!n) return k;
        if (n.kind === 'affiliate') ctx.affiliateLinks.add(n.href);
        const btn = tag === 'button' ? ' class="btn"' : '';
        return `<a href="${attr(n.href)}" data-kind="${n.kind}"${btn}>${k || esc(n.href)}</a>`;
      }
      case 'span': case 'font': case 'u': case 'sup': case 'sub': case 'small': case 'label': case 'abbr': {
        const style = ($n.attr('style') || '');
        const k = kids();
        if (/font-weight:\s*(bold|[6-9]00)/.test(style) && k.trim()) return `<strong>${k}</strong>`;
        if (tag === 'sup' || tag === 'sub') return `<${tag}>${k}</${tag}>`;
        return k;
      }
      default: return kids();
    }
  };
  const walk = (node) => {
    if (node.type === 'text') { inline.push(esc(node.data.replace(/\s+/g, ' '))); return; }
    if (node.type !== 'tag') return;
    const $n = $(node); const tag = node.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'svg', 'form', 'input', 'select', 'textarea'].includes(tag)) return;
    if (tag === 'ins' && $n.hasClass('adsbygoogle')) { flush(); const s = $n.attr('data-ad-slot'); if (s) { ctx.adSlots.push(s); out.push({ t: 'ad', slot: s }); } return; }
    if (/^h[1-6]$/.test(tag)) {
      flush();
      // images inside headings become standalone figures
      $n.find('img').each((i, im) => { walk(im); flush(); });
      $n.find('img').remove();
      const html = node.children.map(inl).join('').trim();
      if (html.replace(/<[^>]+>/g, '').trim()) out.push({ t: tag === 'h1' || tag === 'h2' ? 'h2' : tag === 'h3' ? 'h3' : 'h4', html: html.replace(/<\/?strong>/g, '') });
      return;
    }
    if (tag === 'img') {
      // standalone image => figure (if it isn't inline in running text)
      if (inline.join('').replace(/<[^>]+>|\s|&nbsp;/g, '')) { inline.push(inl(node)); return; }
      flush(); const h = inl(node); if (h) out.push({ t: 'figure', html: h }); return;
    }
    if (tag === 'a' || tag === 'button') {
      const hasBlock = $n.find(Array.from(BLOCK).join(',')).length > 0;
      const onlyImg = $n.find('img').length && !$n.text().trim();
      if (onlyImg) {
        flush();
        const n = normHref($n.attr('href'), ctx) || normHref(urlFromOnclick($n.attr('onclick')), ctx);
        const imgs = $n.find('img').map((i, im) => inl(im)).get().join('');
        if (n && n.kind === 'affiliate') ctx.affiliateLinks.add(n.href);
        out.push({ t: 'figure', html: n ? `<a href="${attr(n.href)}" data-kind="${n.kind}">${imgs}</a>` : imgs });
        return;
      }
      if (tag === 'button' || !hasBlock) {
        const h = inl(node);
        if (tag === 'button') { flush(); out.push({ t: 'cta', html: h }); } else inline.push(h);
        return;
      }
    }
    if (tag === 'iframe') {
      flush();
      const src = $n.attr('src') || '';
      const yt = src.match(/(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (yt) { ctx.videos.push(yt[1]); out.push({ t: 'video', id: yt[1], title: $n.attr('title') || '' }); }
      else if (src) out.push({ t: 'embed', src, height: $n.attr('height') || '600' });
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      flush();
      const items = $n.children('li').map((i, li) => li.children.map(inl).join('').trim()).get().filter(Boolean);
      if (items.length) out.push({ t: tag, items });
      return;
    }
    if (tag === 'table') {
      flush();
      const rows = $n.find('tr').map((i, tr) => [$(tr).children('td,th').map((j, td) => td.children.map(inl).join('').trim()).get()]).get();
      if (rows.length) out.push({ t: 'table', rows });
      return;
    }
    if (tag === 'hr') { flush(); return; }
    if (BLOCK.has(tag)) {
      const cls = ($n.attr('class') || '').match(/fs(\d+)/);
      const size = cls ? +cls[1] : 0;
      const hasBlockKids = node.children.some(c => c.type === 'tag' && (BLOCK.has(c.tagName.toLowerCase()) || c.tagName === 'img'));
      if (!hasBlockKids) {
        flush();
        inline.push(node.children.map(inl).join(''));
        flush(size);
        return;
      }
      flush();
      node.children.forEach(walk);
      flush();
      return;
    }
    inline.push(inl(node));
  };
  walk(root);
  flush();
  return out;
}

// Heuristic structure recovery: X5 text has no semantic subheadings, so short
// standalone lines become h3, and "Label: text" lines get a bold lead-in.
function structure(blocks) {
  const res = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t !== 'p') { res.push(b); continue; }
    const text = b.html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
    const next = blocks[i + 1];
    const nextText = next && next.t === 'p' ? next.html.replace(/<[^>]+>/g, '').trim() : '';
    const bold = /^<strong>[^]*<\/strong>$/.test(b.html.trim());
    const shortLine = text.length >= 3 && text.length <= 80 && !/[.,;:]$/.test(text) && !/<a |<img /.test(b.html)
      && !/^(https?:|www\.)/i.test(text) && text.split(' ').length <= 12;
    const nextIsProse = next && next.t === 'p' && nextText.length > 110;
    const isHeadingish = shortLine && (b.cls >= 14 || bold || /[?]$/.test(text) || (nextIsProse && (/^\d+\.\s/.test(text) || /^[A-Z]/.test(text))));
    if (isHeadingish) {
      res.push({ t: 'h3', html: b.html.replace(/<\/?strong>/g, ''), inferred: true });
      continue;
    }
    const lead = b.html.match(/^([^<:]{3,45}):\s+(.{20,})$/s);
    if (lead && !/https?$/i.test(lead[1])) { res.push({ t: 'p', html: `<strong>${lead[1]}:</strong> ${lead[2]}` }); continue; }
    res.push({ t: 'p', html: b.html });
  }
  // de-duplicate consecutive identical blocks & trailing junk
  return res.filter((b, i) => !(i && JSON.stringify(b) === JSON.stringify(res[i - 1])));
}

function seo($) {
  const m = n => $(`meta[name="${n}"]`).attr('content') || '';
  const p = n => $(`meta[property="${n}"]`).attr('content') || '';
  const ld = $('script[type="application/ld+json"]').map((i, e) => { try { return JSON.parse($(e).html()); } catch { return null; } }).get().filter(Boolean);
  return {
    title: $('head > title').first().text().trim(),
    description: m('description'), keywords: m('keywords'), robots: m('robots'),
    canonical: $('link[rel="canonical"]').attr('href') || '',
    og: { title: p('og:title'), description: p('og:description'), image: p('og:image'), type: p('og:type'), url: p('og:url') },
    twitter: { card: m('twitter:card'), title: m('twitter:title'), description: m('twitter:description'), image: m('twitter:image') },
    jsonld: ld,
    verification: { google: m('google-site-verification'), bing: m('msvalidate.01'), norton: m('norton-safeweb-site-verification') },
  };
}

// ---------------- PAGES ----------------
const pageIndex = [];
for (const f of fs.readdirSync(PREVIEW).filter(f => /\.html$/.test(f))) {
  const base = f.replace(/\.html$/, '');
  if (!liveUrlFor[base]) continue; // only pages listed in the live sitemap
  const $ = cheerio.load(fs.readFileSync(path.join(PREVIEW, f), 'utf8'));
  const slug = base === 'index' ? 'index' : base;
  const ctx = { slug, isPost: false, images: [], videos: [], adSlots: [], affiliateLinks: new Set() };
  const s = seo($);
  const h1 = $('#imPgTitle').text().trim();
  const blocks = [];
  // Walk X5 cells in document order
  $('#imContent [data-object-type]').each((i, cell) => {
    const $c = $(cell); const type = $c.attr('data-object-type');
    if ($c.parents('[data-object-type]').length) return;
    if (type === 'videosound') {
      const sc = $c.nextAll('script').first().html() || $c.find('script').html() || '';
      const id = $c.attr('data-object-id');
      const script = $('script').filter((j, e) => ($(e).html() || '').includes(`load${id}()`)).first().html() || sc;
      const url = (script.match(/'url':\s*'([^']+)'/) || [])[1] || '';
      const yt = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
      const title = $c.find('[aria-label]').attr('aria-label') || $c.find('[title]').attr('title') || '';
      if (yt) { ctx.videos.push(yt[1]); blocks.push({ t: 'video', id: yt[1], title }); }
      else if (url) blocks.push({ t: 'media', url, title });
      return;
    }
    if (type === 'menu' || type === 'guestbook' || type === 'emailform' || type === 'productlist' || /^pluginapp/.test(type)) {
      if (type === 'emailform') blocks.push({ t: 'contactform' });
      return;
    }
    if (type === 'htmlcode') {
      const ins = $c.find('ins.adsbygoogle');
      if (ins.length) { ins.each((j, e) => { const sl = $(e).attr('data-ad-slot'); if (sl) { ctx.adSlots.push(sl); blocks.push({ t: 'ad', slot: sl }); } }); return; }
      blocks.push(...clean($, $c.find('.imHTMLObject').get(0) || cell, ctx).map(b => ({ ...b, from: 'html' })));
      return;
    }
    const inner = $c.find('.text-inner').get(0) || cell;
    blocks.push(...clean($, inner, ctx));
  });
  const content = structure(blocks);
  const rec = { type: 'page', slug, liveUrl: liveUrlFor[base], h1, seo: s, blocks: content, images: [...new Set(ctx.images)], videos: [...new Set(ctx.videos)], adSlots: [...new Set(ctx.adSlots)], affiliateLinks: [...ctx.affiliateLinks] };
  fs.writeFileSync(path.join(OUT, 'pages', slug + '.json'), JSON.stringify(rec, null, 1));
  pageIndex.push({ slug, liveUrl: rec.liveUrl, title: s.title, h1, blocks: content.length, images: rec.images.length, videos: rec.videos.length, ads: rec.adSlots, affiliate: rec.affiliateLinks.length });
}

// ---------------- POSTS ----------------
const postIndex = [];
for (const f of fs.readdirSync(LIVEBLOG)) {
  const slug = f.replace(/\.html$/, '');
  const $ = cheerio.load(fs.readFileSync(path.join(LIVEBLOG, f), 'utf8'));
  const ctx = { slug, isPost: true, images: [], videos: [], adSlots: [], affiliateLinks: new Set() };
  const s = seo($);
  const post = (s.jsonld.flat().find(x => x['@type'] === 'BlogPosting')) || {};
  const art = $('#imBlogContent');
  const title = art.find('.imPgTitle').first().text().trim() || post.headline || '';
  const crumb = art.find('.imBreadcrumb').first();
  const catA = crumb.find('a[href*="category="]').first();
  const category = catA.text().trim();
  const readTime = (crumb.text().match(/(\d+)\s*minutes?/) || [])[1];
  const body = art.find('[id^=imBlogPost_]').first();
  // post media (video) lives in .imBlogMedia script
  const mediaScript = art.find('.imBlogMedia').html() || '';
  const mediaUrl = (mediaScript.match(/'url':\s*'([^']+)'/) || mediaScript.match(/url:\s*'([^']+)'/) || [])[1] || '';
  const blocks = [];
  const myt = mediaUrl.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (myt) { ctx.videos.push(myt[1]); }
  blocks.push(...clean($, body.get(0), ctx));
  const tags = art.find('a[href*="tag="]').map((i, a) => $(a).text().trim()).get();
  const cover = s.og.image ? registerImg(s.og.image.replace(/_og(\.\w+)$/, '$1'), ctx, title) : null;
  const rec = {
    type: 'post', slug, liveUrl: `${ORIGIN}/blog/?${slug}`, title, seo: s,
    datePublished: post.datePublished || '', dateModified: post.dateModified || '', author: (post.author || {}).name || 'Paul Cee',
    category, categorySlug: (catA.attr('href') || '').replace(/.*category=/, ''), tags, readTime: readTime ? +readTime : null,
    summary: post.description || s.description, cover: cover && cover.rel ? cover.rel : null, heroVideo: myt ? myt[1] : null,
    blocks: structure(blocks), images: [...new Set(ctx.images)], videos: [...new Set(ctx.videos)], adSlots: [...new Set(ctx.adSlots)], affiliateLinks: [...ctx.affiliateLinks],
  };
  fs.writeFileSync(path.join(OUT, 'posts', slug + '.json'), JSON.stringify(rec, null, 1));
  postIndex.push({ slug, title, date: rec.datePublished, category, blocks: rec.blocks.length, images: rec.images.length, video: !!rec.heroVideo, affiliate: rec.affiliateLinks.length });
}

// Blog sidebar ad slot (shared across posts) — record from the blog page
fs.writeFileSync(path.join(OUT, 'assets-manifest.json'), JSON.stringify([...assets.values()].map(a => ({ rel: a.rel, alt: [...a.alts][0] || '', usedBy: [...a.usedBy] })), null, 1));
fs.writeFileSync(path.join(OUT, 'index-pages.json'), JSON.stringify(pageIndex, null, 1));
fs.writeFileSync(path.join(OUT, 'index-posts.json'), JSON.stringify(postIndex.sort((a, b) => b.date.localeCompare(a.date)), null, 1));
console.log('pages', pageIndex.length, 'posts', postIndex.length, 'assets', assets.size);
