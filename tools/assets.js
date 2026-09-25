// Copies every image referenced by extracted content into the site, converted
// to WebP (max 1400px wide), and records final dimensions for CLS-safe markup.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SCR = process.env.X5_WORKDIR || path.resolve(__dirname, '..'); // folder holding src/Preview (X5 export) and live/ (fetched blog)
const PREVIEW = path.join(SCR, 'src/Preview');
const SITE = process.argv[2];
const OUTDIR = path.join(SITE, 'public/img');
const CACHE = path.join(SCR, 'live/img-cache');
fs.mkdirSync(OUTDIR, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(SITE, 'content/assets-manifest.json'), 'utf8'));
const EXTRA = ['images/google-avatar-aug-17a_pw9ria1c.jpg', 'images/fb-header.jpg', 'images/minelab-logo.jpg', 'images/Detexpert-Header1.png', 'images/logo-portable-antiquities-scheme.png', 'images/logo-crown-estate.png', 'favImage_t3jspbgt.png', 'images/CoiltekLogo.png'];
for (const e of EXTRA) if (!manifest.find(m => m.rel === e)) manifest.push({ rel: e, alt: '', usedBy: ['brand'] });

const outName = rel => rel.replace(/^images\//, '').replace(/^blog\/files\//, 'b-').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/\.(jpe?g|png|gif|webp)$/i, '') + '.webp';

(async () => {
  const result = {}; let missing = [], done = 0;
  for (const m of manifest) {
    const dest = path.join(OUTDIR, outName(m.rel));
    let src = path.join(PREVIEW, m.rel);
    if (!fs.existsSync(src)) {
      src = path.join(CACHE, m.rel.replace(/[\/]/g, '__'));
      if (!fs.existsSync(src)) {
        try {
          const r = await fetch('https://www.paulcee.co.uk/' + m.rel.split('/').map(encodeURIComponent).join('/'), { headers: { 'user-agent': 'Mozilla/5.0 (site migration audit)' } });
          if (!r.ok) throw new Error(r.status);
          fs.writeFileSync(src, Buffer.from(await r.arrayBuffer()));
        } catch (e) { missing.push(m.rel + ' ' + e.message); continue; }
      }
    }
    try {
      if (!fs.existsSync(dest)) {
        const animated = /\.gif$/i.test(m.rel);
        await sharp(src, { animated }).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 76, effort: 4 }).toFile(dest);
      }
      const meta = await sharp(dest).metadata();
      result[m.rel] = { file: 'img/' + path.basename(dest), w: meta.width, h: meta.pageHeight || meta.height, alt: m.alt };
      done++;
    } catch (e) { missing.push(m.rel + ' convert ' + e.message); }
  }
  fs.writeFileSync(path.join(SITE, 'content/images.json'), JSON.stringify(result, null, 1));
  console.log('ok', done, 'missing', missing.length); missing.forEach(x => console.log('  ', x));
})();
