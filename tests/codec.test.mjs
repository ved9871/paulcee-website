import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontMatter, stringifyFrontMatter } from '../src/content/frontmatter.mjs';
import { blocksToMarkdown, markdownToBlocks, parseComponent, youtubeId } from '../src/content/codec.mjs';

const images = { 'images/a.jpg': { file: 'img/a.webp', w: 800, h: 600, alt: '' }, 'images/logo.png': { file: 'img/logo.webp', w: 60, h: 89, alt: '' } };
const byFile = Object.fromEntries(Object.entries(images).map(([k, v]) => ['/' + v.file, k]));
const ctx = { fileForKey: k => images[k] ? '/' + images[k].file : null, keyForFile: f => byFile[f] || null, resolve: k => images[k] || null };
const rt = blocks => markdownToBlocks(blocksToMarkdown(blocks, ctx), ctx);

test('front matter round-trips', () => {
  const s = stringifyFrontMatter({ title: 'A: b', datePublished: '2026-01-09T09:00:00', seo: { title: 'T' } }, 'Body *x*');
  const { data, body } = parseFrontMatter(s);
  assert.equal(data.title, 'A: b'); assert.equal(data.datePublished, '2026-01-09T09:00:00'); assert.equal(data.seo.title, 'T'); assert.equal(body.trim(), 'Body *x*');
});

test('paragraphs, headings, emphasis and links round-trip to the same token HTML', () => {
  const blocks = [
    { t: 'h2', html: 'Why Choose the Manticore?' },
    { t: 'p', html: '<strong>Relic Hunters:</strong> Punch through iron &amp; find <a href="@minelab-manticore/" data-kind="internal">coins</a>.' },
    { t: 'p', html: 'Buy <a href="https://crawfordsmd.com/minelab-manticore?tracking=fa202437c9" data-kind="affiliate">here</a> or <a href="@blog/minelab-manticore-settings/" data-kind="internal">read</a>.' },
  ];
  assert.deepEqual(rt(blocks), blocks);
});

test('text that looks like Markdown is escaped', () => {
  const blocks = [{ t: 'p', html: '1. Not a list * star _under_ [brackets] # hash' }, { t: 'p', html: '- dash start' }];
  assert.deepEqual(rt(blocks).map(b => b.html), ['1. Not a list * star _under_ [brackets] # hash', '- dash start']);
});

test('figures keep the image, link and the small hint', () => {
  const out = rt([
    { t: 'figure', html: '<img src="@img:images/logo.png" alt="Logo" title="x" width="60" height="89">' },
    { t: 'figure', html: '<a href="https://crawfordsmd.com/x" data-kind="affiliate"><img src="@img:images/a.jpg" alt="A &quot;q&quot;" width="393" height="221"> </a>' },
  ]);
  assert.equal(out[0].t, 'figure'); assert.match(out[0].html, /^<img src="@img:images\/logo\.png" alt="Logo" width="60" height="89">$/);
  assert.equal(out[1].t, 'figure'); assert.match(out[1].html, /<a href="https:\/\/crawfordsmd\.com\/x" data-kind="affiliate"><img src="@img:images\/a\.jpg" alt="A &quot;q&quot;" width="800" height="600">\s*<\/a>/);
});

test('hard line breaks, lists and components round-trip', () => {
  const blocks = [
    { t: 'p', html: 'Line one<br>Line two' },
    { t: 'ul', items: ['First <strong>bold</strong>', 'Second'] },
    { t: 'video', id: 'bSgPk84mtcE', title: 'Beach "settings"' },
    { t: 'embed', src: 'https://docs.google.com/forms/x?embedded=true', height: '987' },
    { t: 'contactform' },
  ];
  assert.deepEqual(rt(blocks), blocks);
});

test('tables and CTA buttons survive as raw HTML with token links', () => {
  const out = rt([
    { t: 'table', rows: [['Model', 'Price'], ['<a href="@minelab-equinox/" data-kind="internal">Equinox</a>', '£649']] },
    { t: 'cta', html: '<a href="https://crawfordsmd.com/y" data-kind="affiliate" class="btn">Buy</a>' },
  ]);
  assert.equal(out[0].t, 'raw'); assert.match(out[0].html, /^<div class="table-wrap"><table><tr><th>Model<\/th>/); assert.match(out[0].html, /<a href="@minelab-equinox\/" data-kind="internal">Equinox<\/a>/);
  assert.equal(out[1].html, '<p class="cta-row"><a href="https://crawfordsmd.com/y" data-kind="affiliate" class="btn">Buy</a></p>');
});

test('components parse and new uploads resolve by path', () => {
  assert.deepEqual(parseComponent('{{product key="manticore"}}'), { t: 'product', key: 'manticore' });
  assert.deepEqual(parseComponent('{{ad slot="5406186549"}}'), { t: 'ad', slot: '5406186549' });
  assert.equal(parseComponent('not {{a}} component'), null);
  assert.equal(youtubeId('https://www.youtube.com/watch?v=bSgPk84mtcE'), 'bSgPk84mtcE');
  assert.equal(youtubeId('https://youtu.be/bSgPk84mtcE'), 'bSgPk84mtcE');
  const [b] = markdownToBlocks('![Beach](/img/new-upload.webp)', { ...ctx, resolve: k => k === '/img/new-upload.webp' ? { file: 'img/new-upload.webp', w: 1600, h: 1200 } : null });
  assert.equal(b.html, '<img src="@img:/img/new-upload.webp" alt="Beach" width="1600" height="1200">');
});

test('a hard break at the edge of bold or italic moves outside the wrapper', () => {
  const cases = [
    ['a<strong><br></strong>b', 'a<br>b'],
    ['<strong>Text<br></strong>Next', '<strong>Text</strong><br>Next'],
    ['Intro<strong><br>Text</strong>', 'Intro<br><strong>Text</strong>'],
    ['<em>Two<br><br></em>End', '<em>Two</em><br><br>End'],
    ['<strong>Mid<br>dle</strong>', '<strong>Mid<br>dle</strong>'],
  ];
  for (const [html, want] of cases) {
    const [b] = rt([{ t: 'p', html }]);
    assert.equal(b.html, want);
    assert.doesNotMatch(b.html, /&lt;\/(strong|em)&gt;/);
  }
});

test('btn links inside a paragraph keep their class', () => {
  const html = 'Try it: <a href="https://crawfordsmd.com/y" data-kind="affiliate" class="btn">Buy <strong>now</strong></a> or <a href="@minelab-equinox/" data-kind="internal" class="btn">see more</a>.';
  assert.deepEqual(rt([{ t: 'p', html }]), [{ t: 'p', html }]);
});

test('the small image hint scales the height with the width', () => {
  const big = { ...ctx, resolve: k => k === '/img/big.webp' ? { file: 'img/big.webp', w: 800, h: 600 } : null };
  assert.equal(markdownToBlocks('![Big](/img/big.webp "small")', big)[0].html, '<img src="@img:/img/big.webp" alt="Big" width="180" height="135">');
  assert.equal(markdownToBlocks('![Big](/img/big.webp)', big)[0].html, '<img src="@img:/img/big.webp" alt="Big" width="800" height="600">');
  const [logo] = rt([{ t: 'figure', html: '<img src="@img:images/logo.png" alt="Logo" width="60" height="89">' }]);
  assert.equal(logo.html, '<img src="@img:images/logo.png" alt="Logo" width="60" height="89">');
});

test('an image-only paragraph comes back as a figure (accepted normalisation)', () => {
  const html = '<a href="https://example.com/" data-kind="external"><img src="@img:images/a.jpg" alt="x" width="800" height="600"></a>';
  assert.deepEqual(rt([{ t: 'p', html }]), [{ t: 'figure', html }]);
});
