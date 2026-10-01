import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadPosts, loadPages, loadTopics, loadProducts, derive, excerpt } from '../src/content/load.mjs';
import { createImageResolver } from '../src/content/images.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-'));
  const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), s); };
  w('content/posts/live.md', '---\ntitle: Live\ndatePublished: "2026-01-01T09:00:00"\ntopic: minelab-x-terra\nseo:\n  title: Live - Blog\n  description: Desc\n---\n\nHello [shop](https://crawfordsmd.com/a?tracking=fa202437c9)\n\n{{youtube id="bSgPk84mtcE"}}\n');
  w('content/posts/draft.md', '---\ntitle: Draft\ndatePublished: "2026-01-02T09:00:00"\ndraft: true\n---\n\nX\n');
  w('content/posts/future.md', '---\ntitle: Future\ndatePublished: "2026-09-30T09:00:00"\n---\n\nX\n');
  w('content/meta/posts/live.json', JSON.stringify({ liveUrl: 'https://www.paulcee.co.uk/blog/?live', adSlots: ['5406186549'], readTime: null, seo: { canonical: 'https://www.paulcee.co.uk/blog/?live', jsonld: [{ '@type': 'BlogPosting' }] } }));
  w('content/pages/about.md', '---\ntitle: About\nseo:\n  title: About Us\n  description: A\n---\n\nText\n');
  w('content/topics/b.json', JSON.stringify({ key: 'b', label: 'B', match: 'bee', order: 2 }));
  w('content/topics/a.json', JSON.stringify({ key: 'a', label: 'A', match: 'ant', order: 1 }));
  w('content/products/p.json', JSON.stringify({ key: 'p', name: 'P', path: '/p', cat: 'detector', img: '', compare: [], match: 'pee', order: 1 }));
  return root;
}

test('posts: drafts and posts dated after today (UK) are skipped; meta merges under front matter', () => {
  const root = fixture(); const resolver = createImageResolver(root, {});
  const posts = loadPosts(root, { resolver, now: new Date('2026-09-29T22:00:00Z') });
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

import { loadEvents } from '../src/content/load.mjs';

test('events split into upcoming (soonest first) and past', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-ev-'));
  try {
    const dir = path.join(root, 'content/events'); fs.mkdirSync(dir, { recursive: true });
    const w = (n, o) => fs.writeFileSync(path.join(dir, n + '.json'), JSON.stringify(o));
    w('a', { name: 'Old', start: '2026-05-01' });
    w('b', { name: 'Multi', start: '2026-09-28', end: '2026-10-02' });
    w('c', { name: 'Next', start: '2026-10-10' });
    const { upcoming, past } = loadEvents(root, { today: '2026-09-29' });
    assert.deepEqual(upcoming.map(e => e.name), ['Multi', 'Next']);
    assert.deepEqual(past.map(e => e.name), ['Old']);
    assert.equal(loadEvents(path.join(root, 'nope'), { today: '2026-09-29' }).upcoming.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a post dated today goes live on that morning\'s build; tomorrow\'s does not (Europe/London)', () => {
  const root = fixture();
  const w = (n, d) => fs.writeFileSync(path.join(root, 'content/posts', n + '.md'), `---\ntitle: ${n}\ndatePublished: "${d}"\nsummary: S\n---\n\nX\n`);
  w('today-evening', '2026-09-30T18:00:00'); w('tomorrow', '2026-10-01T06:00:00');
  const slugs = loadPosts(root, { resolver: createImageResolver(root, {}), now: new Date('2026-09-30T05:00:00Z') }).map(p => p.slug);
  assert.ok(slugs.includes('today-evening'), slugs.join());
  assert.ok(!slugs.includes('tomorrow'), slugs.join());
});

test('posts and pages without a description fall back to the start of the body', () => {
  const root = fixture();
  const body = 'Heavy **mineralisation** on UK beaches makes the Manticore work hard, so here is how I set it up for wet sand, dry sand and the tide line, with the recovery speed, iron bias and sensitivity I use in every session.';
  fs.writeFileSync(path.join(root, 'content/posts/nosummary.md'), `---\ntitle: No summary\ndatePublished: "2026-01-03T09:00:00"\nsummary: ""\n---\n\n${body}\n`);
  fs.writeFileSync(path.join(root, 'content/pages/noseo.md'), `---\ntitle: No SEO\n---\n\n## Intro\n\n${body}\n`);
  const resolver = createImageResolver(root, {});
  const p = loadPosts(root, { resolver, now: new Date('2026-09-29') }).find(x => x.slug === 'nosummary');
  const pg = loadPages(root, { resolver }).noseo;
  for (const d of [p.seo.description, pg.seo.description]) {
    assert.ok(d.length > 100 && d.length <= 155, `${d.length}: ${d}`);
    assert.doesNotMatch(d, /[<>*]|\s\s|[\s,;:.-]$/);
  }
  assert.match(p.seo.description, /^Heavy mineralisation on UK beaches makes the Manticore work hard/);
  assert.ok(body.startsWith(p.seo.description.replace('mineralisation', '**mineralisation**')));
  assert.match(pg.seo.description, /^Intro Heavy mineralisation/);
  assert.equal(p.seo.jsonld[0].description, p.seo.description);
});

test('reserved page slugs are reported and skipped; index is allowed', () => {
  const root = fixture();
  for (const s of ['videos', 'blog', 'admin', 'assets', 'img', '404', 'index']) fs.writeFileSync(path.join(root, 'content/pages', s + '.md'), `---\ntitle: ${s}\n---\n\nX\n`);
  const problems = [];
  const pages = loadPages(root, { resolver: createImageResolver(root, {}), onProblem: (slug, msg) => problems.push(`${slug}: ${msg}`) });
  assert.deepEqual(Object.keys(pages).sort(), ['about', 'index']);
  assert.equal(problems.length, 6);
  for (const s of ['videos', 'blog', 'admin', 'assets', 'img', '404']) assert.ok(problems.some(p => p.startsWith(`pages/${s}: `) && /reserved/.test(p)), s);
});

test('unresolved images are reported with the entry slug', () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, 'content/posts/badimg.md'), '---\ntitle: Bad\ndatePublished: "2026-01-03T09:00:00"\nsummary: S\n---\n\n![x](/img/missing.jpg)\n');
  fs.writeFileSync(path.join(root, 'content/pages/badimg.md'), '---\ntitle: Bad\n---\n\n![x](/img/gone.png)\n');
  const problems = []; const onProblem = (slug, msg) => problems.push(`${slug}: ${msg}`);
  const resolver = createImageResolver(root, {});
  loadPosts(root, { resolver, now: new Date('2026-09-29'), onProblem }); loadPages(root, { resolver, onProblem });
  assert.deepEqual(problems, ['posts/badimg: image not found: /img/missing.jpg', 'pages/badimg: image not found: /img/gone.png']);
});

test('a product box counts as affiliate content', () => {
  assert.deepEqual(derive([{ t: 'p', html: 'Hi' }, { t: 'product', key: 'manticore' }]).affiliateLinks, ['product:manticore']);
});

test('the description fallback does not leave spaces before punctuation after inline tags', () => {
  assert.equal(excerpt([{ t: 'p', html: 'See <a href="/videos/" data-kind="internal">videos</a>, then <strong>go</strong>.' }]), 'See videos, then go.');
});
