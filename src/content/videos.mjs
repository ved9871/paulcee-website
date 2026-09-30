// Attach playlist titles to each video. The CMS may omit an empty optional list, so a missing `playlists` means [].
export function withPlaylistTitles(videos, playlists) {
  const titles = Object.fromEntries(playlists.map(p => [p.id, p.title]));
  const titleOf = id => titles[id];
  return videos.map(v => ({ ...v, playlists: v.playlists || [], plTitles: (v.playlists || []).map(id => titleOf(id) || '') }));
}
