// Static site generator for the paulcee.co.uk redesign preview.
//   node src/build.mjs                 -> preview build (noindex, ad placeholders)
//   BASE=/repo/ node src/build.mjs     -> GitHub Pages project path
//   MODE=production node src/build.mjs -> real AdSense/GA4 tags, indexable, sitemap
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ORIGIN, LINKS, DISCOUNT, NAV, HUBS, HOME, DISCLOSURE, TAGLINE, TOPICS } from './site.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.BASE || '/').replace(/\/?$/, '/');
const PROD = process.env.MODE === 'production';
const ADSENSE = 'ca-pub-4569712894771793';
const GA4 = 'G-0VWVMTCBM4';
const BLOG_SLOT = '5406186549';

const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const IMAGES = read('content/images.json');
const pages = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'content/pages')).map(f => { const r = read('content/pages/' + f); return [r.slug, r]; }));
const posts = fs.readdirSync(path.join(ROOT, 'content/posts')).map(f => read('content/posts/' + f))
  .sort((a, b) => (b.datePublished || '').localeCompare(a.datePublished || ''));
const postBySlug = Object.fromEntries(posts.map(p => [p.slug, p]));

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const slugify = s => strip(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const url = p => BASE + String(p).replace(/^\//, '');
const pageUrl = slug => slug === 'index' ? url('') : url(slug + '/');
const img = (rel, alt = '', { cls = '', sizes = '', eager = false, maxw } = {}) => {
  const m = IMAGES[rel]; if (!m) return '';
  const style = maxw ? ` style="max-width:min(100%,${maxw}px)"` : '';
  return `<img src="${url(m.file)}" alt="${esc(alt || m.alt || '')}" width="${m.w}" height="${m.h}"${cls ? ` class="${cls}"` : ''}${sizes ? ` sizes="${sizes}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${style}>`;
};
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const topicOf = p => { const hay = `${p.category} ${p.title} ${p.slug}`; for (const [k, label, re] of TOPICS) if (re.test(hay)) return { key: k, label }; return { key: 'detecting', label: 'Detecting' }; };
posts.forEach(p => { p.topic = topicOf(p); });
const TOPIC_LIST = [...TOPICS.map(([k, l]) => ({ key: k, label: l })), { key: 'detecting', label: 'Detecting' }].filter(t => posts.some(p => p.topic.key === t.key));
const fixOrigin = s => String(s).replace(/https?:\/\/192\.168\.\d+\.\d+(:\d+)?\//g, ORIGIN + '/').replace(/"(thumbnailUrl|url)":"(images\/[^"]+)"/g, `"$1":"${ORIGIN}/$2"`);
const firstImage = r => (r.blocks.find(b => b.t === 'figure' && /@img:/.test(b.html) && !/WEB_AD/.test(b.html))?.html.match(/@img:([^"]+)/) || [])[1];

// Rewrite placeholders produced by the extractor (@slug/, @blog/x/, @img:, @asset:)
function links(html) {
  return html
    .replace(/<img src="@img:([^"]+)" alt="([^"]*)"(?: title="[^"]*")? width="(\d*)" height="(\d*)">/g, (m, rel, alt, w) => img(rel, alt.replace(/&quot;/g, '"').replace(/&amp;/g, '&'), { maxw: +w || undefined }))
    .replace(/<img src="(https?:[^"]+)"[^>]*>/g, (m, src) => `<img src="${src}" alt="" loading="lazy">`)
    .replace(/<a href="([^"]+)" data-kind="(\w+)"( class="btn")?>/g, (m, href, kind, btn) => {
      let h = href, rel = '', tgt = '';
      if (href.startsWith('@asset:')) { const a = href.slice(7); h = IMAGES[a] ? url(IMAGES[a].file) : `${ORIGIN}/${a}`; }
      else if (href.startsWith('@blog/')) { const s = href.slice(6).replace(/\/$/, ''); h = !s ? url('blog/') : postBySlug[s] ? url(`blog/${s}/`) : `${ORIGIN}/blog/?${s}`; }
      else if (href.startsWith('@')) { const [s, hash = ''] = href.slice(1).split('#'); const sl = s.replace(/\/$/, '') || 'index'; h = pages[sl] ? pageUrl(sl) + (hash ? '#' + hash : '') : `${ORIGIN}/${sl}.html`; }
      if (kind === 'affiliate') { rel = ' rel="sponsored noopener"'; tgt = ' target="_blank"'; }
      else if (kind === 'external') { rel = ' rel="noopener"'; tgt = ' target="_blank"'; }
      const cls = kind === 'affiliate' ? (btn ? ' class="btn btn--buy"' : ' class="aff"') : (btn ? ' class="btn"' : '');
      return `<a href="${esc(h)}"${cls}${rel}${tgt}>`;
    });
}

const ytThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const video = (id, title = '') => `<div class="yt" data-yt="${id}"><img src="${ytThumb(id)}" alt="" loading="lazy" width="480" height="360"><button type="button" class="yt__play" aria-label="Play video${title ? ': ' + esc(title) : ''}"><svg viewBox="0 0 68 48" aria-hidden="true"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="currentColor"/><path d="M45 24 27 14v20z" fill="#fff"/></svg></button>${title ? `<span class="yt__title">${esc(title)}</span>` : ''}</div>`;

const ad = (slot, label = 'In-content') => PROD
  ? `<div class="ad"><ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE}"${slot ? ` data-ad-slot="${slot}"` : ''} data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`
  : `<aside class="ad ad--preview" aria-label="Advertisement placeholder"><span class="mono">AdSense · ${esc(label)}</span><span>${slot ? `Slot ${slot} — preserved from current site` : 'Auto-ads position'}</span></aside>`;

// Render content blocks -> HTML, collecting headings for a table of contents
function renderBlocks(blocks, { toc = [], adEvery = 0 } = {}) {
  let out = '', paras = 0, adsPlaced = 0; const used = new Set();
  const hid = t => { let id = slugify(t) || 'section'; while (used.has(id)) id += '-2'; used.add(id); return id; };
  for (const b of blocks) {
    switch (b.t) {
      case 'h2': case 'h3': case 'h4': {
        const tag = b.t; const text = strip(b.html); const id = hid(text);
        if (tag !== 'h4') toc.push({ id, text, level: tag });
        out += `<${tag} id="${id}">${links(b.html)}</${tag}>`; break;
      }
      case 'p': out += `<p>${links(b.html)}</p>`; paras++;
        if (adEvery && paras % adEvery === 0 && adsPlaced < 2) { out += ad('', 'in-article auto ad'); adsPlaced++; }
        break;
      case 'figure': { const h = links(b.html); const ws = [...h.matchAll(/max-width:min\(100%,(\d+)px\)/g)].map(m => +m[1]); out += `<figure${ws.length && Math.max(...ws) <= 180 ? ' class="fig--small"' : ''}>${h}</figure>`; break; }
      case 'cta': out += `<p class="cta-row">${links(b.html).replace(/class="aff"/, 'class="btn btn--buy"')}</p>`; break;
      case 'ul': case 'ol': out += `<${b.t}>${b.items.map(i => `<li>${links(i)}</li>`).join('')}</${b.t}>`; break;
      case 'table': out += `<div class="table-wrap"><table>${b.rows.map((r, i) => `<tr>${r.map(c => i === 0 ? `<th>${links(c)}</th>` : `<td>${links(c)}</td>`).join('')}</tr>`).join('')}</table></div>`; break;
      case 'video': out += video(b.id, b.title); break;
      case 'embed': out += `<div class="embed"><iframe src="${esc(b.src)}" loading="lazy" title="Embedded form" height="${Math.min(+b.height || 600, 1200)}"></iframe></div>`; break;
      case 'ad': out += ad(b.slot); break;
      case 'contactform': out += contactForm(); break;
    }
  }
  return out;
}

const contactForm = () => `<form class="form" onsubmit="event.preventDefault();this.querySelector('.form__note').hidden=false">
  <div class="field"><label for="cf-name">Your name</label><input id="cf-name" name="name" autocomplete="name" required></div>
  <div class="field"><label for="cf-email">Email address</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
  <div class="field"><label for="cf-msg">How can Paul help?</label><textarea id="cf-msg" name="message" rows="5" required></textarea><p class="hint">Detector set-up questions, rally enquiries or collaborations.</p></div>
  <button class="btn" type="submit">Send message</button>
  <p class="form__note" role="status" hidden>Preview only — on launch this form will deliver to Paul’s inbox via WordPress.</p>
</form>`;

// ---------- layout ----------
const icon = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  yt: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
};

function header(active) {
  const nav = NAV.map((n, i) => {
    if (n.href) return `<li><a class="nav__link${active === n.href ? ' is-active' : ''}" href="${url(n.href)}">${n.label}</a></li>`;
    const panel = n.groups.map(g => `<div class="mega__group"><p class="mega__title mono">${g.title}</p><ul>${g.items.map(([s, l]) => `<li><a href="${pageUrl(s)}"${active === s ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul></div>`).join('');
    const on = n.groups.some(g => g.items.some(([s]) => s === active));
    return `<li class="has-mega"><button class="nav__link${on ? ' is-active' : ''}" aria-expanded="false" aria-controls="mega-${i}">${n.label}${icon.chev}</button><div class="mega" id="mega-${i}"><div class="mega__inner">${panel}</div></div></li>`;
  }).join('');
  return `<a class="skip" href="#main">Skip to content</a>
${PROD ? '' : `<div class="preview-bar" role="note"><span class="mono">Design preview</span> Not the live site · ads shown as placeholders · hidden from Google</div>`}
<header class="site-header"><div class="wrap site-header__row">
  <a class="brand" href="${url('')}" aria-label="Paul Cee Metal Detecting — home"><span class="brand__mark" aria-hidden="true">PC</span><span class="brand__text"><span class="brand__name">Paul Cee</span><span class="brand__sub mono">Metal Detecting</span></span></a>
  <nav class="nav" aria-label="Main"><ul class="nav__list">${nav}</ul></nav>
  <div class="site-header__tools">
    <button class="icon-btn" type="button" data-open-search aria-label="Search the site">${icon.search}</button>
    <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch colour theme"><span class="i-sun">${icon.sun}</span><span class="i-moon">${icon.moon}</span></button>
    <a class="btn btn--buy btn--sm hide-sm" href="${LINKS.crawfords}" rel="sponsored noopener" target="_blank">Shop Crawfords MD</a>
    <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu"><span class="i-open">${icon.menu}</span><span class="i-close">${icon.close}</span></button>
  </div>
</div>
<div class="mobile-nav" id="mobile-nav" hidden><div class="wrap">
  ${NAV.map(n => n.href ? `<a class="mobile-nav__top" href="${url(n.href)}">${n.label}</a>` : `<details><summary class="mobile-nav__top">${n.label}${icon.chev}</summary>${n.groups.map(g => `<p class="mega__title mono">${g.title}</p><ul>${g.items.map(([s, l]) => `<li><a href="${pageUrl(s)}">${l}</a></li>`).join('')}</ul>`).join('')}</details>`).join('')}
  <a class="btn btn--buy" href="${LINKS.crawfords}" rel="sponsored noopener" target="_blank">Shop Crawfords MD</a>
</div></div>
</header>
<dialog class="search" aria-label="Search">
  <form method="dialog" class="search__box" role="search"><label for="q" class="visually-hidden">Search articles and guides</label>${icon.search}<input id="q" type="search" placeholder="Search settings, detectors, finds…" autocomplete="off"><button class="icon-btn" value="close" aria-label="Close search">${icon.close}</button></form>
  <ul class="search__results" aria-live="polite"></ul>
</dialog>`;
}

function footer() {
  const cols = NAV.filter(n => n.groups).slice(0, 3).map(n => `<div><p class="footer__h mono">${n.label}</p><ul>${n.groups.flatMap(g => g.items).slice(0, 7).map(([s, l]) => `<li><a href="${pageUrl(s)}">${l}</a></li>`).join('')}</ul></div>`).join('');
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="discount"><div><p class="mono discount__k">Reader discount</p><p class="discount__h">Save on accessories at ${DISCOUNT.where} with code <button type="button" class="code" data-copy="${DISCOUNT.code}" aria-label="Copy code ${DISCOUNT.code}">${DISCOUNT.code}</button></p><p class="discount__t">${DISCOUNT.terms}</p></div><a class="btn btn--buy" href="https://crawfordsmd.com/" rel="sponsored noopener" target="_blank">Visit Crawfords MD ${icon.ext}</a></div>
    <div class="footer__grid">
      <div class="footer__brand"><a class="brand brand--footer" href="${url('')}"><span class="brand__mark" aria-hidden="true">PC</span><span class="brand__text"><span class="brand__name">Paul Cee</span><span class="brand__sub mono">Metal Detecting</span></span></a><p class="footer__tag">${TAGLINE}</p><p>Minelab Detexpert and Crawfords Metal Detectors ambassador, sharing settings, reviews and finds from UK beaches and fields.</p>
      <p class="footer__social"><a href="${LINKS.youtube}" rel="noopener" target="_blank">${icon.yt} YouTube</a> <a href="${pageUrl('social-sites')}">Newsletter</a> <a href="${pageUrl('contact')}">Contact</a></p></div>
      ${cols}
    </div>
    <p class="footer__disclosure"><strong>Affiliate disclosure.</strong> ${DISCLOSURE}</p>
    <div class="footer__legal"><span>© ${new Date().getFullYear()} Paul Cee Metal Detecting · Loxley Media</span><span><a href="${pageUrl('privacy')}">Privacy &amp; cookies</a> · <a href="${pageUrl('links')}">Useful links</a> · <a href="${url('blog/')}">Blog</a></span></div>
  </div>
</footer>`;
}

function head({ seo = {}, title, description, canonical, ogImage, jsonld = [], extra = '' }) {
  const t = seo.title || title; const d = seo.description || description || '';
  const og = seo.og || {}; const tw = seo.twitter || {};
  const ogImg = og.image || ogImage || `${ORIGIN}/images/2026-thumb.jpg`;
  const ld = jsonld.length ? `<script type="application/ld+json">${fixOrigin(JSON.stringify(jsonld.length === 1 ? jsonld[0] : jsonld))}</script>` : '';
  const v = seo.verification || {};
  return `<!doctype html><html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(d)}">${seo.keywords ? `\n<meta name="keywords" content="${esc(seo.keywords)}">` : ''}
${PROD ? `<meta name="robots" content="${esc(seo.robots || 'index, follow')}">` : '<meta name="robots" content="noindex, nofollow">'}
<link rel="canonical" href="${esc(fixOrigin(canonical))}">
<meta property="og:type" content="${esc(og.type || 'website')}"><meta property="og:title" content="${esc(og.title || t)}"><meta property="og:description" content="${esc(og.description || d)}"><meta property="og:image" content="${esc(fixOrigin(ogImg))}"><meta property="og:url" content="${esc(fixOrigin(canonical))}"><meta property="og:site_name" content="Paul Cee Metal Detecting"><meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="${esc(tw.card || 'summary_large_image')}"><meta name="twitter:title" content="${esc(tw.title || og.title || t)}"><meta name="twitter:description" content="${esc(tw.description || d)}"><meta name="twitter:image" content="${esc(fixOrigin(tw.image || ogImg))}">
${PROD && v.google ? `<meta name="google-site-verification" content="${esc(v.google)}">` : ''}${PROD && v.bing ? `<meta name="msvalidate.01" content="${esc(v.bing)}">` : ''}${PROD && v.norton ? `<meta name="norton-safeweb-site-verification" content="${esc(v.norton)}">` : ''}
<meta name="theme-color" content="#1c1915">
<link rel="icon" href="${url('img/favImage_t3jspbgt.webp')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Zilla+Slab:wght@600;700&display=swap">
<link rel="stylesheet" href="${url('assets/site.css')}">
<script>try{var t=localStorage.getItem('pc-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
${PROD ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4}');</script>` : ''}
${ld}${extra}
</head>`;
}

function doc(opts, body, active) {
  return `${head(opts)}<body>${header(active)}<main id="main">${body}</main>${footer()}<script>window.PC_BASE=${JSON.stringify(BASE)}</script><script src="${url('assets/site.js')}" defer></script></body></html>`;
}

const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${url('')}">Home</a></li>${items.map(([h, l], i) => i === items.length - 1 ? `<li aria-current="page">${esc(l)}</li>` : `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ol></nav>`;

const postCard = (p, { size = '' } = {}) => {
  const cover = p.cover && IMAGES[p.cover] ? img(p.cover, p.title, { cls: 'card__img' }) : p.heroVideo ? `<img class="card__img" src="${ytThumb(p.heroVideo)}" alt="" loading="lazy" width="480" height="360">` : `<div class="card__img card__img--blank" aria-hidden="true"><span class="mono">${esc(p.topic.label)}</span></div>`;
  return `<article class="card ${size}" data-topic="${p.topic.key}"><a class="card__link" href="${url(`blog/${p.slug}/`)}"><div class="card__media">${cover}${p.heroVideo ? '<span class="badge badge--video">Video</span>' : ''}</div><div class="card__body"><p class="card__meta mono">${esc(p.topic.label)} · ${fmtDate(p.datePublished)}</p><h3 class="card__title">${esc(p.title)}</h3>${size === 'card--lg' ? `<p class="card__excerpt">${esc(strip(p.summary).slice(0, 160))}</p>` : ''}</div></a></article>`;
};

const affiliateAside = (r) => {
  const first = r.affiliateLinks.find(l => /crawfordsmd\.com/.test(l)) || r.affiliateLinks[0];
  return `<div class="side-card side-card--buy"><p class="mono side-card__k">Where Paul buys</p><p class="side-card__h">Crawfords Metal Detectors</p><p>Authorised Minelab dealer · UK stock · free delivery over £50.</p>${first ? `<a class="btn btn--buy btn--block" href="${esc(first)}" rel="sponsored noopener" target="_blank">Check current price ${icon.ext}</a>` : ''}<p class="side-card__code">Accessories code <button type="button" class="code" data-copy="${DISCOUNT.code}">${DISCOUNT.code}</button></p></div>`;
};

// ---------- pages ----------
function writeFile(rel, html) { const f = path.join(DIST, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); }

function renderHome() {
  const r = pages.index;
  const hubCards = HUBS.map(h => { const p = pages[h.slug]; const im = h.img || (p && firstImage(p)); return `<a class="hub" href="${pageUrl(h.slug)}"><div class="hub__media">${im ? img(im, `Minelab ${h.name} settings and user guide`) : ''}</div><div class="hub__body"><p class="mono hub__tag">${h.tag}</p><h3 class="hub__name">${h.name}</h3><p>${h.blurb}</p><span class="hub__go">Guide &amp; settings ${icon.arrow}</span></div></a>`; }).join('');
  const latest = posts.slice(0, 7);
  const body = `
<section class="hero"><div class="hero__bg" aria-hidden="true"></div><div class="wrap hero__grid">
  <div class="hero__copy">
    <p class="eyebrow mono">${HOME.eyebrow}</p>
    <h1 class="hero__h1">${HOME.h1}</h1>
    <p class="hero__sub">${HOME.sub}</p>
    <div class="hero__ctas"><a class="btn btn--lg" href="${HOME.primary[0]}">${HOME.primary[1]} ${icon.arrow}</a><a class="btn btn--ghost btn--lg" href="${LINKS.youtube}" rel="noopener" target="_blank">${icon.yt} ${HOME.secondary[1]}</a></div>
    <dl class="proof">${HOME.proof.map(([n, l]) => `<div><dt>${n}</dt><dd>${l}</dd></div>`).join('')}</dl>
  </div>
  <figure class="hero__photo">${img('images/DSC07547-copy.jpg', 'Paul Cee metal detecting at dawn with a Minelab detector', { eager: true, sizes: '(min-width: 900px) 40vw, 100vw' })}<figcaption class="mono">Minelab Detexpert · Field tester</figcaption></figure>
</div></section>

<section class="section" id="detectors" aria-labelledby="det-h"><div class="wrap">
  <div class="section__head"><p class="eyebrow mono">Find your detector</p><h2 id="det-h">Settings &amp; user guides for every Minelab</h2><p class="section__lede">Pick your machine for Paul’s set-up guides, beach and field settings, and the coils and accessories worth adding.</p></div>
  <div class="hubs">${hubCards}</div>
  <p class="more-links mono">Also: <a href="${pageUrl('minelab-pro-find')}">Pro-Find pinpointers</a> · <a href="${pageUrl('manticore-settings')}">Manticore settings</a> · <a href="${pageUrl('minelab-vanquish-60-settings')}">Vanquish 60 settings</a> · <a href="${pageUrl('manticore-m8-vs-m9-coil')}">M8 vs M9 coil</a></p>
</div></section>

<section class="section section--band" aria-labelledby="why-h"><div class="wrap">
  <div class="section__head"><p class="eyebrow mono">Why detectorists trust Paul</p><h2 id="why-h">Advice from the field, not the forum</h2></div>
  <div class="pillars">${HOME.pillars.map(p => `<div class="pillar"><span class="pillar__k mono">${p.k}</span><h3>${p.title}</h3><p>${p.body}</p></div>`).join('')}</div>
</div></section>

<section class="section" aria-labelledby="start-h"><div class="wrap">
  <div class="section__head"><p class="eyebrow mono">Start here</p><h2 id="start-h">Where are you on your detecting journey?</h2></div>
  <div class="paths">${HOME.paths.map((p, i) => `<a class="path" href="${/\/$/.test(p.href) ? url(p.href) : pageUrl(p.href)}"><span class="path__n mono">0${i + 1}</span><h3>${p.label}</h3><p>${p.body}</p><span class="path__go">${p.cta} ${icon.arrow}</span></a>`).join('')}</div>
</div></section>

<section class="section section--tint" aria-labelledby="latest-h"><div class="wrap">
  <div class="section__head section__head--row"><div><p class="eyebrow mono">From the blog</p><h2 id="latest-h">Latest settings, reviews &amp; finds</h2></div><a class="btn btn--ghost" href="${url('blog/')}">All ${posts.length} articles ${icon.arrow}</a></div>
  <div class="latest">${postCard(latest[0], { size: 'card--lg' })}${latest.slice(1).map(p => postCard(p)).join('')}</div>
</div></section>

<div class="wrap">${ad('', 'homepage auto ad')}</div>

<section class="section" aria-labelledby="vid-h"><div class="wrap split">
  <div>${video(HOME.video.id, HOME.video.title)}</div>
  <div><p class="eyebrow mono">On YouTube</p><h2 id="vid-h">${HOME.video.heading}</h2><p>${HOME.video.body}</p><p><a class="btn" href="${LINKS.youtube}" rel="noopener" target="_blank">${icon.yt} Subscribe on YouTube</a></p>
  <div class="newsletter"><h3>${HOME.newsletter.heading}</h3><p>${HOME.newsletter.body}</p><a class="btn btn--ghost" href="${LINKS.newsletter}" rel="sponsored noopener" target="_blank">Join the mailing list ${icon.ext}</a></div></div>
</div></section>

<section class="section section--dark" aria-labelledby="rally-h"><div class="wrap split split--rev">
  <figure class="rally-photo">${img('images/DSC00062-copy.jpg', 'Paul Cee helping a detectorist with settings at a metal detecting rally')}</figure>
  <div><p class="eyebrow mono">Rallies &amp; events</p><h2 id="rally-h">Come and find Paul at a rally</h2><p>Through the rally season Paul sets up test lanes at digs across the UK and Europe — bring your detector, try the latest Minelab machines, and get your settings checked in person.</p>
  <ul class="ticks"><li><a href="${pageUrl('detecting-rallies-2026')}">Detecting rallies 2026 — updated weekly</a></li><li><a href="${pageUrl('minelab-500-rally')}">The Minelab 500 Rally</a></li><li><a href="${pageUrl('detectival')}">Detectival</a></li></ul></div>
</div></section>`;
  writeFile('index.html', doc({ seo: r.seo, canonical: r.liveUrl, jsonld: r.seo.jsonld }, body, ''));
}

function renderPage(r) {
  if (r.slug === 'index') return;
  const toc = [];
  const blocks = r.blocks.slice();
  // Use X5 page title as H1; drop a leading h2 that repeats it
  const h1 = r.h1 || strip(r.seo.title);
  const content = renderBlocks(blocks, { toc, adEvery: 6 });
  const group = NAV.find(n => n.groups && n.groups.some(g => g.items.some(([s]) => s === r.slug)));
  const related = group ? group.groups.flatMap(g => g.items).filter(([s]) => s !== r.slug).slice(0, 6) : [];
  const relPosts = posts.filter(p => r.slug.includes(p.topic.key.replace('minelab-', '')) || (p.topic.key.startsWith('minelab-') && r.slug.includes(p.topic.key.split('-').pop()))).slice(0, 4);
  const hero = firstImage(r);
  const body = `
<div class="page-head"><div class="wrap">${crumbs([...(group?.label === 'Detectors' ? [[url('') + '#detectors', 'Detectors']] : []), ['', h1]])}
  <h1 class="page-title">${esc(h1)}</h1>${r.seo.description ? `<p class="page-lede">${esc(r.seo.description)}</p>` : ''}
  ${r.affiliateLinks.length ? `<p class="disclosure-inline"><span class="mono">Affiliate links</span> Paul may earn a commission from purchases — <a href="#disclosure">learn more</a>.</p>` : ''}
</div></div>
<div class="wrap layout">
  <article class="prose" data-hero="${hero ? 1 : 0}">${content}</article>
  <aside class="sidebar">
    ${toc.length > 3 ? `<nav class="side-card toc" aria-label="On this page"><p class="mono side-card__k">On this page</p><ol>${toc.filter(t => t.level === 'h2' || toc.filter(x => x.level === 'h2').length < 3).slice(0, 12).map(t => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol></nav>` : ''}
    ${r.affiliateLinks.length ? affiliateAside(r) : ''}
    ${ad('', 'sidebar auto ad')}
    ${related.length ? `<nav class="side-card" aria-label="Related guides"><p class="mono side-card__k">More in ${group.label}</p><ul class="side-list">${related.map(([s, l]) => `<li><a href="${pageUrl(s)}">${l}</a></li>`).join('')}</ul></nav>` : ''}
  </aside>
</div>
${relPosts.length ? `<section class="section section--tint"><div class="wrap"><div class="section__head"><p class="eyebrow mono">From the blog</p><h2>Related articles</h2></div><div class="grid-4">${relPosts.map(p => postCard(p)).join('')}</div></div></section>` : ''}
<div id="disclosure"></div>`;
  writeFile(`${r.slug}/index.html`, doc({ seo: r.seo, canonical: r.liveUrl, jsonld: r.seo.jsonld }, body, r.slug));
}

function renderPost(p, i) {
  const toc = [];
  const content = renderBlocks(p.blocks, { toc, adEvery: 5 });
  const related = posts.filter(x => x !== p && x.topic.key === p.topic.key).slice(0, 3);
  const recent = posts.filter(x => x !== p).slice(0, 5);
  const prev = posts[i + 1], next = posts[i - 1];
  const hero = p.heroVideo ? video(p.heroVideo, p.title) : '';
  const body = `
<div class="page-head page-head--post"><div class="wrap wrap--narrow">${crumbs([[url('blog/'), 'Blog'], [url(`blog/topic/${p.topic.key}/`), p.topic.label], ['', p.title]])}
  <p class="eyebrow mono"><a href="${url(`blog/topic/${p.topic.key}/`)}">${esc(p.topic.label)}</a></p>
  <h1 class="page-title">${esc(p.title)}</h1>
  <div class="byline">${img('images/GOPR0979a.jpg', '', { cls: 'byline__avatar' })}<div><p class="byline__name">By <a href="${pageUrl('about-us')}">${esc(p.author)}</a> · Minelab Detexpert</p><p class="byline__meta mono"><time datetime="${esc(p.datePublished)}">${fmtDate(p.datePublished)}</time>${p.readTime ? ` · ${p.readTime} min read` : ''}${p.category ? ` · ${esc(p.category)}` : ''}</p></div></div>
</div></div>
<div class="wrap layout layout--post">
  <article class="prose">
    ${p.affiliateLinks.length ? `<p class="disclosure-inline"><span class="mono">Affiliate links</span> This article contains affiliate links — Paul may earn a small commission at no extra cost to you.</p>` : ''}
    ${hero}${content}
    <div class="author-box">${img('images/GOPR0979a.jpg', 'Paul Cee', { cls: 'author-box__img' })}<div><p class="mono side-card__k">About the author</p><p class="author-box__name">Paul Cee</p><p>Minelab Detexpert, field tester and Crawfords Metal Detectors ambassador. Paul films a new detecting video most weeks and prefers the beach — the finds are younger, but the deep old coins come out in far better condition.</p><p><a href="${pageUrl('about-us')}">More about Paul</a> · <a href="${LINKS.youtube}" rel="noopener" target="_blank">YouTube</a></p></div></div>
    <nav class="post-nav" aria-label="More posts">${prev ? `<a href="${url(`blog/${prev.slug}/`)}"><span class="mono">← Older</span>${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="post-nav__next" href="${url(`blog/${next.slug}/`)}"><span class="mono">Newer →</span>${esc(next.title)}</a>` : ''}</nav>
  </article>
  <aside class="sidebar">
    ${ad(BLOG_SLOT, 'blog sidebar')}
    ${p.affiliateLinks.length ? affiliateAside(p) : ''}
    <nav class="side-card" aria-label="Recent posts"><p class="mono side-card__k">Recent posts</p><ul class="side-list">${recent.map(x => `<li><a href="${url(`blog/${x.slug}/`)}">${esc(x.title)}</a></li>`).join('')}</ul></nav>
  </aside>
</div>
${related.length ? `<section class="section section--tint"><div class="wrap"><div class="section__head"><p class="eyebrow mono">${esc(p.topic.label)}</p><h2>Keep reading</h2></div><div class="grid-3">${related.map(x => postCard(x)).join('')}</div></div></section>` : ''}`;
  writeFile(`blog/${p.slug}/index.html`, doc({ seo: { ...p.seo, og: { ...p.seo.og, type: 'article' } }, canonical: p.liveUrl, jsonld: p.seo.jsonld.flat() }, body, 'blog/'));
}

function renderBlogIndex(list, { topic } = {}) {
  const title = topic ? `${topic.label} — Blog` : 'Blog';
  const chips = `<div class="chips" role="list">${[{ key: '', label: 'All' }, ...TOPIC_LIST].map(t => { const on = (topic?.key || '') === t.key; const n = t.key ? posts.filter(p => p.topic.key === t.key).length : posts.length; return `<a role="listitem" class="chip${on ? ' is-on' : ''}" href="${url(t.key ? `blog/topic/${t.key}/` : 'blog/')}"${on ? ' aria-current="page"' : ''}>${esc(t.label)} <span class="mono">${n}</span></a>`; }).join('')}</div>`;
  const body = `
<div class="page-head"><div class="wrap">${crumbs(topic ? [[url('blog/'), 'Blog'], ['', topic.label]] : [['', 'Blog']])}
  <h1 class="page-title">${topic ? esc(topic.label) : 'The Paul Cee blog'}</h1>
  <p class="page-lede">${topic ? `${list.length} articles on ${esc(topic.label.toLowerCase())} from Paul Cee.` : `Settings, reviews, field reports and finds — ${posts.length} articles since 2017.`}</p>
  ${chips}
</div></div>
<div class="wrap">
  <div class="grid-3 blog-grid" data-paginate="18">${list.map((p, i) => postCard(p, { size: i === 0 && !topic ? 'card--lg' : '' })).join('')}</div>
  <p class="load-more-row"><button class="btn btn--ghost" type="button" data-load-more hidden>Show more articles</button></p>
  ${ad(BLOG_SLOT, 'blog index')}
</div>`;
  const seo = topic ? { title: `${topic.label} | Paul Cee Metal Detecting Blog`, description: `${topic.label}: settings, reviews and field reports from Paul Cee, Minelab Detexpert.` } : { title: 'Blog | Paul Cee Metal Detecting', description: 'Metal detecting blog from Paul Cee — Minelab settings, detector and coil reviews, beach detecting tips and UK finds.' };
  writeFile(topic ? `blog/topic/${topic.key}/index.html` : 'blog/index.html', doc({ seo, canonical: `${ORIGIN}/blog/` }, body, 'blog/'));
}

// ---------- run ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src/site.css'), path.join(DIST, 'assets/site.css'));
fs.copyFileSync(path.join(ROOT, 'src/site.js'), path.join(DIST, 'assets/site.js'));

renderHome();
Object.values(pages).forEach(renderPage);
posts.forEach(renderPost);
renderBlogIndex(posts);
TOPIC_LIST.forEach(t => renderBlogIndex(posts.filter(p => p.topic.key === t.key), { topic: t }));

// search index
const search = [
  ...Object.values(pages).filter(r => r.slug !== 'index').map(r => ({ t: r.h1 || strip(r.seo.title), u: pageUrl(r.slug), k: 'Guide' })),
  ...posts.map(p => ({ t: p.title, u: url(`blog/${p.slug}/`), k: p.topic.label, d: (p.datePublished || '').slice(0, 10) })),
];
fs.writeFileSync(path.join(DIST, 'assets/search.json'), JSON.stringify(search));
fs.writeFileSync(path.join(DIST, 'robots.txt'), PROD ? `User-agent: *\nDisallow: /admin\n\nSitemap: ${ORIGIN}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
if (!PROD) fs.writeFileSync(path.join(DIST, '404.html'), doc({ seo: { title: 'Page not found | Paul Cee' }, canonical: ORIGIN }, `<div class="page-head"><div class="wrap"><h1 class="page-title">Nothing detected here</h1><p class="page-lede">That page has moved or never existed. Try the <a href="${url('blog/')}">blog</a> or <a href="${url('')}">home page</a>.</p></div></div>`, ''));

// redirect map: every live URL -> its new home (used for 301s at launch)
const rows = [['old_url', 'new_path', 'type']];
Object.values(pages).forEach(r => rows.push([r.liveUrl, r.slug === 'index' ? '/' : `/${r.slug}/`, 'page']));
posts.forEach(p => rows.push([p.liveUrl, `/blog/${p.slug}/`, 'post']));
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/redirects.csv'), rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'));
const inv = [['url', 'title', 'meta_description', 'canonical', 'jsonld_types', 'ad_slots', 'affiliate_links', 'videos']];
[...Object.values(pages), ...posts].forEach(r => inv.push([r.liveUrl, r.seo.title, r.seo.description, fixOrigin(r.seo.canonical), [...new Set(r.seo.jsonld.flat().map(x => x['@type']))].join(' '), r.adSlots.join(' '), r.affiliateLinks.join(' '), r.videos.join(' ')]));
fs.writeFileSync(path.join(ROOT, 'docs/seo-inventory.csv'), inv.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'));

console.log(`Built ${Object.keys(pages).length} pages, ${posts.length} posts, ${TOPIC_LIST.length} topics → dist/ (BASE=${BASE}, ${PROD ? 'production' : 'preview'})`);
