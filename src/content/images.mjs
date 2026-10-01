// Resolves image references used in content: legacy keys from content/images.json
// ("images/foo.jpg") or direct /img/*.webp paths inserted by the CMS.
import fs from 'node:fs';
import path from 'node:path';

export function webpSize(file) {
  let b; try { b = fs.readFileSync(file); } catch { return null; }
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') return { w: 1 + (((b[22] & 0x3f) << 8) | b[21]), h: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
  if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  return null;
}

// Create one resolver per build: results (including misses) are cached for the
// resolver's lifetime, so a long-lived process must create a new one after files change.
export function createImageResolver(root, images) {
  const byFile = new Map(Object.entries(images).map(([k, v]) => ['/' + v.file, k]));
  const cache = new Map();
  return {
    keyForFile: f => byFile.get(f) || null,
    fileForKey: k => (Object.hasOwn(images, k) ? '/' + images[k].file : null),
    resolve(ref) {
      if (!ref) return null;
      if (Object.hasOwn(images, ref)) return images[ref];
      if (!String(ref).startsWith('/img/')) return null;
      const k = byFile.get(ref); if (k) return images[k];
      if (!cache.has(ref)) { const d = webpSize(path.join(root, 'public', ref)); cache.set(ref, d ? { file: ref.slice(1), w: d.w, h: d.h, alt: '' } : null); }
      return cache.get(ref);
    },
  };
}
