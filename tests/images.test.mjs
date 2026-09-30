import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createImageResolver, webpSize } from '../src/content/images.mjs';

const root = path.resolve('.');
const images = JSON.parse(fs.readFileSync('content/images.json', 'utf8'));

test('webpSize matches images.json for lossy, lossless and alpha files', () => {
  for (const key of ['photos/paul-beach-minelab.jpg', 'brand/crawfords-blue.png', 'images/detexpert-logosml.png']) {
    const m = images[key];
    assert.deepEqual(webpSize(path.join(root, 'public', m.file)), { w: m.w, h: m.h }, key);
  }
});

test('resolver handles keys, known paths and unknown paths', () => {
  const r = createImageResolver(root, images);
  assert.equal(r.resolve('photos/paul-beach-minelab.jpg').file, 'img/p-paul-beach-minelab.webp');
  assert.equal(r.keyForFile('/img/p-paul-beach-minelab.webp'), 'photos/paul-beach-minelab.jpg');
  assert.equal(r.fileForKey('photos/paul-beach-minelab.jpg'), '/img/p-paul-beach-minelab.webp');
  assert.equal(r.resolve('/img/p-paul-beach-minelab.webp').w, 1600);
  assert.equal(r.resolve('/img/does-not-exist.webp'), null);
  assert.equal(r.resolve('nope'), null);
});
