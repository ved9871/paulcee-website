import test from 'node:test';
import assert from 'node:assert/strict';
import { cmdUrl, TRACKING } from '../src/commerce.config.mjs';

test('cmdUrl normalises paths and pasted Crawfords addresses to one tracked www link', () => {
  const want = 'https://www.crawfordsmd.com/minelab-vanquish-560?tracking=' + TRACKING;
  assert.equal(cmdUrl('/minelab-vanquish-560'), want);
  assert.equal(cmdUrl('minelab-vanquish-560'), want);
  assert.equal(cmdUrl('https://crawfordsmd.com/minelab-vanquish-560'), want);
  assert.equal(cmdUrl('https://www.crawfordsmd.com/minelab-vanquish-560?tracking=' + TRACKING), want);
  assert.equal(cmdUrl('vanquish-360-bundle?tracking=' + TRACKING), 'https://www.crawfordsmd.com/vanquish-360-bundle?tracking=' + TRACKING);
  assert.equal(cmdUrl('/search?q=coil&tracking=old'), 'https://www.crawfordsmd.com/search?q=coil&tracking=' + TRACKING);
});
