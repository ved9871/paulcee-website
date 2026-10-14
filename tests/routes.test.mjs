import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoutes } from '../src/content/routes.mjs';

const BASE = '/site/';
const url = p => BASE + String(p).replace(/^\//, '');
const pageUrl = s => (s === 'index' ? url('') : url(s + '/'));
const make = (redirects = {}, warnings = []) => createRoutes({
  pages: { index: { h1: 'Home' }, contact: { h1: 'Contact' }, 'detecting-accessories': { h1: 'Accessories' } },
  posts: new Map([['live-post', 'Live post']]),
  allPosts: new Set(['live-post', 'scheduled-post']),
  topics: ['beginners'],
  redirects, url, pageUrl, warn: m => warnings.push(m),
});

test('kind classifies pages, posts, listings, reserved folders and unpublished posts', () => {
  const r = make();
  assert.equal(r.kind('/contact/'), 'page');
  assert.equal(r.kind(''), 'page');
  assert.equal(r.kind('blog/live-post'), 'post');
  assert.equal(r.kind('blog/scheduled-post'), 'unpublished');
  assert.equal(r.kind('blog'), 'generated');
  assert.equal(r.kind('videos'), 'generated');
  assert.equal(r.kind('/blog/topic/beginners/'), 'generated');
  assert.equal(r.kind('blog/topic/nope'), null);
  assert.equal(r.kind('img/x.webp'), 'reserved');
  assert.equal(r.kind('admin'), 'reserved');
  assert.equal(r.kind('gone-page'), null);
});

test('resolve: known routes link, deleted routes unlink, unpublished posts unlink, files are left alone', () => {
  const r = make();
  assert.deepEqual(r.resolve('/contact/#top'), { href: '/site/contact/' });
  assert.deepEqual(r.resolve('/blog/live-post/'), { href: '/site/blog/live-post/' });
  assert.deepEqual(r.resolve('/blog/topic/beginners/'), { href: '/site/blog/topic/beginners/' });
  assert.deepEqual(r.resolve('/'), { href: '/site/' });
  assert.deepEqual(r.resolve('/gone-page/'), { missing: 'deleted' });
  assert.deepEqual(r.resolve('/Contact/'), { missing: 'deleted' }, 'mixed case is not a page');
  assert.deepEqual(r.resolve('/blog/Larry_Bishop/'), { missing: 'deleted' });
  assert.deepEqual(r.resolve('/blog/scheduled-post/'), { missing: 'unpublished' });
  assert.equal(r.resolve('/img/photo.webp'), null);
  assert.equal(r.resolve('/assets/site.css'), null);
  assert.equal(r.resolve('/some/deep/path/file.pdf'), null);
});

test('redirects: only entries from a gone path to a reachable target are active; the rest warn and are ignored', () => {
  const warnings = [];
  const r = make({
    'gone-page': 'detecting-accessories',
    'blog/gone-post': 'blog',
    'blog/other-gone': 'blog/topic/beginners',
    'contact': 'detecting-accessories',          // still exists
    'blog/scheduled-post': 'blog',               // unpublished, not deleted
    'blog/topic/beginners': 'blog',              // generated route, must never be overwritten
    'gone-too': 'no-such-page',                  // bad target
    'gone-three': 'blog/scheduled-post',         // target not reachable yet
  }, warnings);
  assert.deepEqual(r.active, { 'gone-page': 'detecting-accessories', 'blog/gone-post': 'blog', 'blog/other-gone': 'blog/topic/beginners' });
  assert.equal(warnings.length, 5);
  assert.match(warnings.find(w => w.includes('"contact"')), /still exists \(page\)/);
  assert.match(warnings.find(w => w.includes('"blog/scheduled-post"')), /draft or scheduled/);
  assert.match(warnings.find(w => w.includes('"blog/topic/beginners"')), /still exists \(generated\)/);
  assert.match(warnings.find(w => w.includes('"gone-too"')), /not a page, post, topic/);
  assert.match(warnings.find(w => w.includes('"gone-three"')), /not a page, post, topic/);
  assert.deepEqual(r.resolve('/gone-page/'), { href: '/site/detecting-accessories/' });
  assert.deepEqual(r.resolve('/blog/gone-post/'), { href: '/site/blog/' });
  assert.equal(r.redirectHref('blog/other-gone'), '/site/blog/topic/beginners/');
  assert.equal(r.redirectHref('contact'), null);
});

test('href and title cover pages, posts and listings without slicing guesses', () => {
  const r = make();
  assert.equal(r.href('blog'), '/site/blog/');
  assert.equal(r.href('videos'), '/site/videos/');
  assert.equal(r.href('index'), '/site/');
  assert.equal(r.href('contact'), '/site/contact/');
  assert.equal(r.title('videos'), 'the video library');
  assert.equal(r.title('blog'), 'the blog');
  assert.equal(r.title('contact'), 'Contact');
  assert.equal(r.title('blog/live-post'), 'Live post');
});

test('warnMissing reports each path once per reason', () => {
  const warnings = [];
  const r = make({}, warnings);
  r.warnMissing('gone', 'deleted'); r.warnMissing('gone', 'deleted'); r.warnMissing('blog/scheduled-post', 'unpublished');
  assert.equal(warnings.length, 2);
  assert.match(warnings[1], /draft or scheduled/);
});
