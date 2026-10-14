// Site routes as the build knows them: pages, published posts, generated listings (blog, videos, topics),
// reserved folders, unpublished posts, and the redirects editors may leave behind when they delete things.
// Pure functions so the deploy-guarding behaviour (what becomes a link, what is unlinked, what redirects)
// is unit-tested; build.mjs only supplies the data and the URL helpers.

export const GENERATED = ['blog', 'videos'];
export const RESERVED = ['admin', 'assets', 'img', '404'];

/**
 * @param {object} o
 * @param {Record<string, {h1?: string}>} o.pages            page slug -> page
 * @param {Map<string, string>} o.posts                      published post slug -> title
 * @param {Set<string>} o.allPosts                           every post slug on disk, drafts and scheduled included
 * @param {string[]} o.topics                                topic keys that get /blog/topic/<key>/
 * @param {Record<string, string>} [o.redirects]            old path -> new path (from content/redirects.json)
 * @param {(p: string) => string} o.url                      site-relative path -> href under BASE
 * @param {(slug: string) => string} o.pageUrl               page slug -> href
 * @param {(msg: string) => void} [o.warn]
 */
export function createRoutes({ pages, posts, allPosts, topics, redirects = {}, url, pageUrl, warn = m => console.warn(m) }) {
  const norm = p => String(p || '').split(/[#?]/)[0].replace(/^\/+|\/+$/g, '');

  // What a site-relative path is: 'page' | 'post' | 'generated' | 'reserved' | 'unpublished' | null (nothing we know)
  const kind = raw => {
    const p = norm(raw);
    if (p === '' || p === 'index') return 'page';
    if (GENERATED.includes(p)) return 'generated';
    if (RESERVED.includes(p.split('/')[0])) return 'reserved';
    if (Object.hasOwn(pages, p)) return 'page';
    const t = p.match(/^blog\/topic\/([^/]+)$/); if (t) return topics.includes(t[1]) ? 'generated' : null;
    const m = p.match(/^blog\/([^/]+)$/); if (m) return posts.has(m[1]) ? 'post' : allPosts.has(m[1]) ? 'unpublished' : null;
    return null;
  };
  const exists = p => ['page', 'post', 'generated'].includes(kind(p));
  const href = raw => { const p = norm(raw); return p === '' || p === 'index' ? url('') : Object.hasOwn(pages, p) ? pageUrl(p) : url(`${p}/`); };
  const title = raw => {
    const p = norm(raw);
    if (p === 'blog') return 'the blog';
    if (p === 'videos') return 'the video library';
    if (Object.hasOwn(pages, p)) return pages[p].h1 || p;
    const m = p.match(/^blog\/([^/]+)$/); if (m && posts.has(m[1])) return posts.get(m[1]);
    return p;
  };

  // Redirects: only entries whose old path is gone and whose target is reachable are active. Anything else is
  // a warning, never a build failure, so an editor deleting or recreating a page cannot block the deploy.
  const active = {};
  for (const [fromRaw, toRaw] of Object.entries(redirects)) {
    const from = norm(fromRaw), to = norm(toRaw), k = kind(from);
    if (k === 'unpublished') { warn(`WARN redirects.json: "${from}" is a draft or scheduled post; redirect ignored until it is deleted`); continue; }
    if (k) { warn(`WARN redirects.json: "${from}" still exists (${k}); redirect ignored`); continue; }
    if (!exists(to)) { warn(`WARN redirects.json: "${from}" points at "${to}", which is not a page, post, topic, "blog" or "videos"; redirect ignored`); continue; }
    active[from] = to;
  }
  const redirectHref = raw => active[norm(raw)] ? href(active[norm(raw)]) : null;

  // Something an editor would type as an internal link: up to three slug-like segments and no file extension.
  const looksLikeRoute = p => /^[\w-]+(?:\/[\w-]+){0,2}$/.test(p);

  /**
   * Resolve a site-relative path found in content.
   * @returns {{href: string} | {missing: 'deleted' | 'unpublished'} | null}  null = not ours to judge, leave as is
   */
  const resolve = raw => {
    const p = norm(raw), k = kind(p);
    if (k === 'page' || k === 'post' || k === 'generated') return { href: href(p) };
    if (active[p]) return { href: href(active[p]) };
    if (k === 'unpublished') return { missing: 'unpublished' };
    if (k === 'reserved' || !looksLikeRoute(p)) return null;
    return { missing: 'deleted' };
  };

  const warned = new Set();
  const warnMissing = (p, why) => {
    const key = `${why}:${p}`; if (warned.has(key)) return; warned.add(key);
    warn(why === 'unpublished'
      ? `WARN link: "/${p}" is a draft or scheduled post; link text kept, link removed until it is published`
      : `WARN link: "/${p}" no longer exists (deleted in the CMS?); link text kept, link removed`);
  };

  return { kind, exists, href, title, active, redirectHref, resolve, warnMissing, norm };
}
