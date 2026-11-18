// IndexNow: after each production build, tell Bing (and the other IndexNow engines: Yandex, Naver, Seznam, Yep)
// which pages changed, so nobody has to ask for re-indexing by hand. Google doesn't take IndexNow; it follows
// sitemap.xml on its own schedule, and the only manual shortcut there is Search Console's "Request indexing".
//
// How it works: the build hashes every indexable page it wrote and publishes the map as /indexnow-state.json.
// The next build fetches the live copy, diffs it against the pages it just built, and submits the URLs whose
// content changed (or disappeared, so the engines re-check and drop them). The key is public by design and is
// published at /<key>.txt, which is how IndexNow checks that the submission really comes from this site.
import crypto from 'node:crypto';

export const hashHtml = html => crypto.createHash('sha1').update(html).digest('hex');

/** URLs whose hash differs between the live state and the freshly built one, plus URLs that no longer exist. */
export const changedUrls = (prev, next) => {
  const out = [];
  for (const [u, h] of Object.entries(next)) if (prev[u] !== h) out.push(u);
  for (const u of Object.keys(prev)) if (!(u in next)) out.push(u);
  return out;
};

export async function submitIndexNow({ host, key, urls, fetchImpl = fetch }) {
  const body = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls.slice(0, 10000) };
  const res = await fetchImpl('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000),
  });
  return { sent: body.urlList.length, status: res.status };
}

/** Compare the pages just built with the live site and submit the differences. Never throws: a failed ping must not fail a deploy. */
export async function notifyIndexNow({ origin, key, state, branch, enabled = true, fetchImpl = fetch, log = console.log }) {
  if (!enabled) return log('IndexNow: off (not a Cloudflare production build, or INDEXNOW=0)');
  if (branch && branch !== 'main') return log(`IndexNow: skipped, this is a preview build of branch "${branch}"`);
  let prev;
  try {
    const r = await fetchImpl(`${origin}/indexnow-state.json`, { signal: AbortSignal.timeout(15000), headers: { 'cache-control': 'no-cache' } });
    if (r.status === 404) prev = {}; else if (!r.ok) throw new Error(`HTTP ${r.status}`); else prev = await r.json();
  } catch (e) { return log(`IndexNow: could not read the live page list (${e.message}), nothing submitted this time`); }
  if (!Object.keys(prev).length) return log(`IndexNow: first run, recorded ${Object.keys(state).length} pages; changes are submitted from the next build on`);
  const urls = changedUrls(prev, state);
  if (!urls.length) return log('IndexNow: no page content changed');
  try {
    const { sent, status } = await submitIndexNow({ host: new URL(origin).hostname, key, urls, fetchImpl });
    log(`IndexNow: submitted ${sent} changed page(s) to Bing & co (HTTP ${status})${sent <= 10 ? ': ' + urls.join(' ') : ''}`);
  } catch (e) { log(`IndexNow: submission failed (${e.message})`); }
}
