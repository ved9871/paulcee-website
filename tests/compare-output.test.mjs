import test from 'node:test';
import assert from 'node:assert/strict';
import { extract, diffPage } from '../tools/compare-output.mjs';

const page = (body, title = 'T') => `<!doctype html><html><head><title>${title}</title><meta name="description" content="D &amp; more"><link rel="canonical" href="https://x/"><script type="application/ld+json">{"a":1}</script></head><body><main id="main">${body}</main></body></html>`;

test('extract reads head signals and decodes entities', () => {
  const e = extract(page('<article class="prose"><h2 id="a">Hello &amp; bye</h2><p>Text</p></article>'));
  assert.equal(e.title, 'T');
  assert.equal(e.meta.description, 'D & more');
  assert.equal(e.canonical, 'https://x/');
  assert.equal(e.jsonld, '{"a":1}');
  assert.deepEqual(e.headings, ['h2:Hello & bye']);
  assert.equal(e.prose, 'Hello & bye Text');
});

test('ads are excluded from prose but counted', () => {
  const e = extract(page('<article class="prose"><p>A</p><aside class="ad ad--preview"><span>AdSense</span></aside><p>B</p></article>'));
  assert.equal(e.prose, 'A B');
  assert.equal(e.ads, 1);
});

test('diffPage names differing signals', () => {
  const a = extract(page('<article class="prose"><p>A</p><a href="/x/">x</a></article>'));
  const b = extract(page('<article class="prose"><p>B</p><a href="/y/">y</a></article>', 'T2'));
  assert.deepEqual(diffPage(a, b).sort(), ['links', 'prose', 'title']);
});
