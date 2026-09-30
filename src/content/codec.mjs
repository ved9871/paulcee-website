// Converts between the site's content blocks (token HTML, rendered by build.mjs)
// and Markdown with plain site paths (/slug/, /blog/x/, /img/x.webp) that the CMS edits.
import { marked } from 'marked';

export const ORIGIN = 'https://www.paulcee.co.uk';
export const AFFILIATE_HOSTS = /(crawfordsmd\.com|minelab\.com|bit\.ly|amzn\.|amazon\.|ebay\.|awin|tidd\.ly|swagier|coiltek|emite|anderson)/i;
const MD = { gfm: false, breaks: false, async: false };
const attrMap = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const decodeAttr = s => String(s).replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const encodeAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const PUNCT = /[\p{P}\p{S}]/u;

// ---------- hrefs ----------
export function hrefToPlain(h, { fileForKey }) {
  if (h.startsWith('@asset:')) { const k = h.slice(7); return fileForKey(k) || `${ORIGIN}/${k}`; }
  if (h.startsWith('@blog/')) return '/blog/' + h.slice(6);
  if (h.startsWith('@')) { const s = h.slice(1); return '/' + (s === '/' ? '' : s); }
  return decodeAttr(h);
}

export function hrefToToken(h, { keyForFile }) {
  let m;
  if (h === '/') return ['@', 'internal'];
  if (/^\/blog\/?$/.test(h)) return ['@blog/', 'internal'];
  if ((m = h.match(/^\/blog\/([^/#?]+)\/?$/))) return [`@blog/${m[1]}/`, 'internal'];
  if (h.startsWith('/img/')) { const k = keyForFile(h); return [k ? `@asset:${k}` : h, 'asset']; }
  if ((m = h.match(/^\/([a-z0-9-]+)\/?(#.*)?$/i))) return [`@${m[1]}/${m[2] || ''}`, 'internal'];
  if (/^(mailto:|tel:)/i.test(h)) return [h, 'contact'];
  if (/^https?:\/\//i.test(h)) return [h, AFFILIATE_HOSTS.test(h) ? 'affiliate' : 'external'];
  if (h.startsWith('#')) return [h, 'internal'];
  return [h, 'external'];
}

// ---------- token HTML -> Markdown ----------
const mdUrl = u => /[\s()<>]/.test(u) ? `<${u}>` : u;
const escapeText = s => s.replace(/([\\`*_[\]])/g, '\\$1');

function escapeLineStarts(md) {
  return md.split('\n').map(line => {
    const l = line.replace(/^\s+/, '');
    if (/^=+\s*$/.test(l) || /^(-\s*){3,}$/.test(l)) return '\\' + l;
    return l.replace(/^(#{1,6}|>|[-+])(?=\s|$)/, '\\$1').replace(/^(\d+)([.)])(?=\s|$)/, '$1\\$2');
  }).join('\n');
}

function imgToMd(a, { fileForKey }) {
  const src = a.src || '';
  const alt = escapeText(decodeAttr(a.alt || '')).replace(/\n/g, ' ');
  if (src.startsWith('@img:')) {
    const file = fileForKey(src.slice(5)); if (!file) return '';
    return `![${alt}](${mdUrl(file)}${+a.width && +a.width <= 180 ? ' "small"' : ''})`;
  }
  return `![${alt}](${mdUrl(decodeAttr(src))})`;
}

const BREAK = '\u0000'; // placeholder for <br> until emphasis edges are settled; becomes "\\\n"

export function inlineToMd(html, ctx) {
  const out = [], stack = [];
  const close = type => {
    let i = stack.length - 1; while (i >= 0 && stack[i].type !== type) i--;
    if (i < 0) return;
    const { start, href, btn } = stack.splice(i)[0];
    const inner = out.splice(start).join('');
    if (type === 'a') { out.push(btn ? `<a href="${encodeAttr(href)}" class="btn">${inner}</a>` : `[${inner}](${mdUrl(href)})`); return; }
    // Whitespace and hard breaks at the edges stay outside the emphasis markers.
    const lead = inner.match(/^(?:\s|\u0000)*/)[0];
    const rest = inner.slice(lead.length);
    const trail = rest.match(/(?:\s|\u0000)*$/)[0];
    const core = rest.slice(0, rest.length - trail.length);
    if (!core) { out.push(inner); return; }
    const ambiguous = PUNCT.test(core[0]) || PUNCT.test(core[core.length - 1]);
    const [o, c] = ambiguous ? [`<${type}>`, `</${type}>`] : type === 'strong' ? ['**', '**'] : ['*', '*'];
    out.push(lead + o + core + c + trail);
  };
  for (const part of String(html).split(/(<[^>]+>)/).filter(Boolean)) {
    if (part[0] !== '<') { out.push(escapeText(part)); continue; }
    const tag = part.toLowerCase();
    if (tag === '<strong>' || tag === '<em>') stack.push({ type: tag.slice(1, -1), start: out.length });
    else if (tag === '</strong>' || tag === '</em>') close(tag.slice(2, -1));
    else if (/^<br\s*\/?>$/.test(tag)) out.push(BREAK);
    else if (tag.startsWith('<a ')) { const a = attrMap(part); stack.push({ type: 'a', start: out.length, href: hrefToPlain(a.href || '', ctx), btn: /\bbtn\b/.test(a.class || '') }); }
    else if (tag === '</a>') close('a');
    else if (tag.startsWith('<img ')) out.push(imgToMd(attrMap(part), ctx));
    else out.push(part);
  }
  return out.join('').replace(/\u0000/g, '\\\n');
}

export function tokenHtmlToPlain(html, ctx) {
  return String(html)
    .replace(/<img\s[^>]*>/g, tag => { const a = attrMap(tag); if (!(a.src || '').startsWith('@img:')) return tag; const f = ctx.fileForKey(a.src.slice(5)); return f ? `<img src="${f}" alt="${a.alt || ''}"${+a.width && +a.width <= 180 ? ' title="small"' : ''}>` : ''; })
    .replace(/<a\s[^>]*>/g, tag => { const a = attrMap(tag); return `<a href="${encodeAttr(hrefToPlain(a.href || '', ctx))}"${a.class ? ` class="${a.class}"` : ''}>`; });
}

export function blocksToMarkdown(blocks, ctx) {
  const out = [];
  const para = html => escapeLineStarts(inlineToMd(html, ctx)).trim();
  for (const b of blocks) {
    switch (b.t) {
      case 'h2': case 'h3': case 'h4': { const h = inlineToMd(b.html, ctx).replace(/\\\n/g, ' ').trim().replace(/#+\s*$/, m => '\\' + m); if (h) out.push(`${'#'.repeat(+b.t[1])} ${h}`); break; }
      case 'p': case 'figure': { const md = para(b.html); if (md) out.push(md); break; }
      case 'ul': case 'ol': out.push(b.items.map((it, i) => `${b.t === 'ol' ? `${i + 1}.` : '-'} ${para(it).replace(/\n/g, '\n   ')}`).join('\n')); break;
      case 'table': out.push(`<div class="table-wrap"><table>${b.rows.map((r, i) => `<tr>${r.map(c => i === 0 ? `<th>${tokenHtmlToPlain(c, ctx)}</th>` : `<td>${tokenHtmlToPlain(c, ctx)}</td>`).join('')}</tr>`).join('')}</table></div>`); break;
      case 'cta': out.push(`<p class="cta-row">${tokenHtmlToPlain(b.html, ctx)}</p>`); break;
      case 'raw': out.push(tokenHtmlToPlain(b.html, ctx)); break;
      case 'video': out.push(`{{youtube id="${b.id}"${b.title ? ` title="${encodeAttr(b.title)}"` : ''}}}`); break;
      case 'embed': out.push(`{{embed src="${encodeAttr(b.src)}" height="${b.height || 600}"}}`); break;
      case 'ad': out.push(`{{ad slot="${b.slot || ''}"}}`); break;
      case 'product': out.push(`{{product key="${b.key}"}}`); break;
      case 'contactform': out.push('{{contactform}}'); break;
    }
  }
  return out.join('\n\n') + '\n';
}

// ---------- Markdown -> token HTML blocks ----------
export const youtubeId = s => (String(s).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/) || [, String(s).trim()])[1];
const COMP = /^\{\{(youtube|product|ad|embed|contactform)((?:\s+\w+="[^"]*")*)\s*\}\}$/;

export function parseComponent(text) {
  const m = String(text).match(COMP); if (!m) return null;
  const a = Object.fromEntries([...m[2].matchAll(/(\w+)="([^"]*)"/g)].map(x => [x[1], decodeAttr(x[2])]));
  switch (m[1]) {
    case 'youtube': return a.id ? { t: 'video', id: youtubeId(a.id), title: a.title || '' } : null;
    case 'product': return a.key ? { t: 'product', key: a.key } : null;
    case 'ad': return { t: 'ad', slot: a.slot || '' };
    case 'embed': return a.src ? { t: 'embed', src: a.src, height: a.height || '600' } : null;
    case 'contactform': return { t: 'contactform' };
  }
  return null;
}

function imgToken(a, { resolve, keyForFile }) {
  const src = decodeAttr(a.src || ''), alt = a.alt || '';
  if (/^https?:/i.test(src)) return `<img src="${encodeAttr(src)}" alt="${alt}">`;
  const key = src.startsWith('@img:') ? src.slice(5) : (keyForFile(src) || src);
  const m = resolve(key); if (!m) return '';
  const small = a.title === 'small' && m.w > 180;
  return `<img src="@img:${key}" alt="${alt}" width="${small ? 180 : m.w}" height="${small ? Math.round(m.h * 180 / m.w) : m.h}">`;
}

export function plainHtmlToToken(html, ctx) {
  return String(html)
    .replace(/<img\s[^>]*>/g, tag => imgToken(attrMap(tag), ctx))
    .replace(/<a\s[^>]*>/g, tag => {
      const a = attrMap(tag); if (a['data-kind']) return tag;
      const [href, kind] = hrefToToken(decodeAttr(a.href || ''), ctx);
      return `<a href="${encodeAttr(href)}" data-kind="${kind}"${/\bbtn\b/.test(a.class || '') ? ' class="btn"' : ''}>`;
    });
}

const inline = s => marked.parseInline(s, MD);
const isImageOnly = html => /<img /.test(html) && !html.replace(/<a [^>]*>|<\/a>|<img [^>]*>|<br>|\s|&nbsp;/g, '');

export function markdownToBlocks(md, ctx) {
  const blocks = [];
  for (const t of marked.lexer(String(md || ''), MD)) {
    switch (t.type) {
      case 'heading': blocks.push({ t: t.depth <= 2 ? 'h2' : t.depth === 3 ? 'h3' : 'h4', html: plainHtmlToToken(inline(t.text), ctx).trim() }); break;
      case 'paragraph': {
        const comp = parseComponent(t.text.trim()); if (comp) { blocks.push(comp); break; }
        const html = plainHtmlToToken(inline(t.text), ctx).trim(); if (!html) break;
        blocks.push({ t: isImageOnly(html) ? 'figure' : 'p', html });
        break;
      }
      case 'list': blocks.push({ t: t.ordered ? 'ol' : 'ul', items: t.items.map(i => plainHtmlToToken(inline(i.text), ctx).trim()) }); break;
      case 'html': { const h = t.text.trim(); if (h) blocks.push({ t: 'raw', html: plainHtmlToToken(h, ctx) }); break; }
      case 'blockquote': blocks.push({ t: 'p', html: plainHtmlToToken(inline(t.text), ctx).trim() }); break;
      case 'code': blocks.push({ t: 'raw', html: `<pre><code>${escapeHtml(t.text)}</code></pre>` }); break;
      case 'hr': blocks.push({ t: 'raw', html: '<hr>' }); break;
    }
  }
  return blocks;
}
