import test from 'node:test';
import assert from 'node:assert/strict';
import { withPlaylistTitles } from '../src/content/videos.mjs';

const playlists = [{ id: 'PL1', title: 'Manticore' }, { id: 'PL2', title: 'Equinox' }];

test('withPlaylistTitles resolves playlist titles, blanks unknown ids', () => {
  const [v] = withPlaylistTitles([{ id: 'a', title: 'A', playlists: ['PL2', 'PLX'] }], playlists);
  assert.deepEqual(v.plTitles, ['Equinox', '']);
  assert.deepEqual(v.playlists, ['PL2', 'PLX']);
});

test('withPlaylistTitles treats a missing playlists key as empty', () => {
  const [v] = withPlaylistTitles([{ id: 'b', title: 'B' }], playlists);
  assert.deepEqual(v.playlists, []);
  assert.deepEqual(v.plTitles, []);
  assert.equal(v.id, 'b');
});
