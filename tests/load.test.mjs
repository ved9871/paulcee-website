import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadPosts, loadPages, loadTopics, loadProducts, derive } from '../src/content/load.mjs';
import { createImageResolver } from '../src/content/images.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-'));
  const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), s); };
  w('content/posts/live.md', '---\ntitle: Live\ndatePublished: "2026-01-01T09:00:00"\ntopic: minelab-x-terra\nseo:\n  title: Live - Blog\n  description: Desc\n---\n\nHello [shop](https://crawfordsmd.com/a?tracking=fa202437c9)\n\n{{youtube id="bSgPk84mtcE"}}\n');
  w('content/posts/draft.md', '---\ntitle: Draft\ndatePublished: "2026-01-02T09:00:00"\ndraft: true\n---\n\nX\n');
  w('content/posts/future.md', '---\ntitle: Future\ndatePublished: "2099-01-01T09:00:00"\n---\n\nX\n');
  w('content/meta/posts/live.json', JSON.stringify({ liveUrl: 'https://www.paulcee.co.uk/blog/?live', adSlots: ['5406186549'], readTime: null, seo: { canonical: 'https://www.paulcee.co.uk/blog/?live', jsonld: [{ '@type': 'BlogPosting' }] } }));
  w('content/pages/about.md', '---\ntitle: About\nseo:\n  title: About Us\n  description: A\n---\n\nText\n');
  w('content/topics/b.json', JSON.stringify({ key: 'b', label: 'B', match: 'bee', order: 2 }));
  w('content/topics/a.json', JSON.stringify({ key: 'a', label: 'A', match: 'ant', order: 1 }));
  w('content/products/p.json', JSON.stringify({ key: 'p', name: 'P', path: '/p', cat: 'detector', img: '', compare: [], match: 'pee', order: 1 }));
  return root;
}

test('posts: drafts and future posts are skipped; meta merges under front matter', () => {
  const root = fixture(); const resolver = createImageResolver(root, {});
  const posts = loadPosts(root, { resolver, now: new Date('2026-09-29') });
  assert.deepEqual(posts.map(p => p.slug), ['live']);
  const p = posts[0];
  assert.equal(p.seo.title, 'Live - Blog'); assert.equal(p.seo.canonical, 'https://www.paulcee.co.uk/blog/?live');
  assert.equal(p.liveUrl, 'https://www.paulcee.co.uk/blog/?live'); assert.equal(p.readTime, null); assert.equal(p.topicKey, 'minelab-x-terra');
  assert.deepEqual(p.videos, ['bSgPk84mtcE']); assert.deepEqual(p.affiliateLinks, ['https://crawfordsmd.com/a?tracking=fa202437c9']);
});

test('new posts without meta get defaults', () => {
  const root = fixture(); fs.rmSync(path.join(root, 'content/meta'), { recursive: true });
  const [p] = loadPosts(root, { resolver: createImageResolver(root, {}), now: new Date('2026-09-29') });
  assert.equal(p.liveUrl, 'https://www.paulcee.co.uk/blog/live/'); assert.equal(p.seo.canonical, p.liveUrl);
  assert.equal(p.seo.jsonld[0]['@type'], 'BlogPosting'); assert.equal(p.author, 'Paul Cee'); assert.equal(p.readTime, 1);
});

test('pages, topics (ordered) and products load', () => {
  const root = fixture();
  const pages = loadPages(root, { resolver: createImageResolver(root, {}) });
  assert.equal(pages.about.h1, 'About'); assert.equal(pages.about.liveUrl, 'https://www.paulcee.co.uk/about/');
  const topics = loadTopics(root); assert.deepEqual(topics.map(t => t[0]), ['a', 'b']); assert.ok(topics[0][2].test('ANT'));
  const [pr] = loadProducts(root); assert.equal(pr.compare, undefined); assert.ok(pr.re.test('PEE'));
});

test('derive collects images, videos and affiliate links', () => {
  const d = derive([{ t: 'p', html: '<a href="https://x.com/?a=1&amp;b=2" data-kind="affiliate">x</a> <img src="@img:images/a.jpg" alt="" width="1" height="1">' }, { t: 'video', id: 'abc' }]);
  assert.deepEqual(d, { images: ['images/a.jpg'], videos: ['abc'], affiliateLinks: ['https://x.com/?a=1&b=2'] });
});
