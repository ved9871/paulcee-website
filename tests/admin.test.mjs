import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import YAML from 'yaml';

test('build writes a valid admin with site_url and product options', () => {
  execFileSync(process.execPath, ['src/build.mjs'], { env: { ...process.env, BASE: '/paulcee-website/', MSYS_NO_PATHCONV: '1' } });
  const cfg = YAML.parse(fs.readFileSync('dist/admin/config.yml', 'utf8'));
  assert.equal(cfg.backend.repo, 'ved9871/paulcee-website');
  assert.equal(cfg.site_url, 'https://ved9871.github.io/paulcee-website');
  const names = cfg.collections.map(c => c.name);
  for (const n of ['posts', 'pages', 'events', 'products', 'topics', 'settings']) assert.ok(names.includes(n), n);
  assert.deepEqual(cfg.collections.find(c => c.name === 'settings').files.map(f => f.name), ['site', 'videos']);
  for (const c of cfg.collections.filter(c => c.folder)) assert.ok(fs.existsSync(c.folder), c.folder);
  // Bodies open in raw Markdown until the rich-text save round trip is verified (Sveltia `modes`, first = default).
  for (const n of ['posts', 'pages']) assert.deepEqual(cfg.collections.find(c => c.name === n).fields.find(f => f.name === 'body').modes, ['raw', 'rich_text'], n);
  const summary = cfg.collections.find(c => c.name === 'posts').fields.find(f => f.name === 'summary');
  assert.notEqual(summary.required, false); assert.match(summary.hint, /Google/);
  const compare = cfg.collections.find(c => c.name === 'products').fields.find(f => f.name === 'compare');
  assert.equal(compare.fields.find(f => f.name === 'path').pattern[0], '^/');
  const js = fs.readFileSync('dist/admin/components.js', 'utf8');
  assert.match(js, /"value":"manticore"/); assert.doesNotMatch(js, /__PRODUCT_OPTIONS__/);
  assert.match(fs.readFileSync('dist/admin/index.html', 'utf8'), /@sveltia\/cms@0\.223\.0/);
});

test('the current content builds with no content errors', () => {
  const r = spawnSync(process.execPath, ['src/build.mjs'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout + r.stderr, /CONTENT-ERROR/);
});
