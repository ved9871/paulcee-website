import test from 'node:test';
import assert from 'node:assert/strict';
import { hashHtml, changedUrls, submitIndexNow, notifyIndexNow } from '../src/indexnow.mjs';

const fake = responses => {
  const calls = [];
  const f = async (url, init) => { calls.push({ url, init }); const r = responses[url] || responses['*']; return typeof r === 'function' ? r() : r; };
  f.calls = calls; return f;
};
const json = (obj, status = 200) => ({ status, ok: status < 400, json: async () => obj });

test('hashHtml is stable and content-sensitive', () => {
  assert.equal(hashHtml('<p>a</p>'), hashHtml('<p>a</p>'));
  assert.notEqual(hashHtml('<p>a</p>'), hashHtml('<p>b</p>'));
});

test('changedUrls lists new, changed and removed pages only', () => {
  const prev = { 'https://x/a/': '1', 'https://x/b/': '2', 'https://x/gone/': '3' };
  const next = { 'https://x/a/': '1', 'https://x/b/': '9', 'https://x/new/': '4' };
  assert.deepEqual(changedUrls(prev, next), ['https://x/b/', 'https://x/new/', 'https://x/gone/']);
  assert.deepEqual(changedUrls(next, next), []);
});

test('submitIndexNow posts host, key, key location and the URL list', async () => {
  const f = fake({ '*': json({}, 202) });
  const r = await submitIndexNow({ host: 'www.example.com', key: 'k1', urls: ['https://www.example.com/a/'], fetchImpl: f });
  assert.deepEqual(r, { sent: 1, status: 202 });
  assert.equal(f.calls[0].url, 'https://api.indexnow.org/indexnow');
  assert.deepEqual(JSON.parse(f.calls[0].init.body), { host: 'www.example.com', key: 'k1', keyLocation: 'https://www.example.com/k1.txt', urlList: ['https://www.example.com/a/'] });
});

test('notifyIndexNow: first run records only, later runs submit the diff, never throws', async () => {
  const logs = []; const log = m => logs.push(m);
  const origin = 'https://www.example.com';
  const state = { [`${origin}/a/`]: '1', [`${origin}/b/`]: '2' };

  let f = fake({ [`${origin}/indexnow-state.json`]: json({}, 404) });
  await notifyIndexNow({ origin, key: 'k', state, fetchImpl: f, log });
  assert.equal(f.calls.length, 1); assert.match(logs.at(-1), /first run/);

  f = fake({ [`${origin}/indexnow-state.json`]: json({ [`${origin}/a/`]: '1', [`${origin}/b/`]: 'old' }), 'https://api.indexnow.org/indexnow': json({}, 200) });
  await notifyIndexNow({ origin, key: 'k', state, fetchImpl: f, log });
  assert.equal(f.calls.length, 2);
  assert.deepEqual(JSON.parse(f.calls[1].init.body).urlList, [`${origin}/b/`]);
  assert.match(logs.at(-1), /submitted 1/);

  f = fake({ [`${origin}/indexnow-state.json`]: json(state) });
  await notifyIndexNow({ origin, key: 'k', state, fetchImpl: f, log });
  assert.equal(f.calls.length, 1); assert.match(logs.at(-1), /no page content changed/);

  await notifyIndexNow({ origin, key: 'k', state, branch: 'feature', fetchImpl: f, log });
  assert.match(logs.at(-1), /preview build/);
  await notifyIndexNow({ origin, key: 'k', state, enabled: false, fetchImpl: f, log });
  assert.match(logs.at(-1), /off/);

  f = fake({ '*': () => { throw new Error('boom'); } });
  await notifyIndexNow({ origin, key: 'k', state, fetchImpl: f, log });
  assert.match(logs.at(-1), /could not read/);
});
