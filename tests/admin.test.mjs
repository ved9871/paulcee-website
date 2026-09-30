import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
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
  const js = fs.readFileSync('dist/admin/components.js', 'utf8');
  assert.match(js, /"value":"manticore"/); assert.doesNotMatch(js, /__PRODUCT_OPTIONS__/);
  assert.match(fs.readFileSync('dist/admin/index.html', 'utf8'), /@sveltia\/cms@0\.223\.0/);
  execFileSync(process.execPath, ['src/build.mjs']);
});
