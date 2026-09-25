# paulcee.co.uk — redesign

A new design for [paulcee.co.uk](https://www.paulcee.co.uk): Paul Cee's metal-detecting review and affiliate site (Minelab Detexpert, Crawfords Metal Detectors ambassador).

This repository holds the **design preview**, a static build of the full site in the new design using **all current content**, which Paul can click through before we build the WordPress version. It also holds the migrated content and the SEO/AdSense inventory we'll use for launch.

> **The preview is not the live site.** Every page is `noindex, nofollow`, `robots.txt` blocks all crawlers, AdSense and GA4 are **not** loaded (ad positions are shown as labelled placeholders), and canonical tags point at the current live URLs. Nothing here can affect Paul's rankings or AdSense account.

## What's inside

| | |
|---|---|
| `content/pages/*.json` | 32 core pages extracted from Paul's WebSite X5 project (the pages in the live sitemap) |
| `content/posts/*.json` | All **223** blog posts fetched from the live blog, with dates, categories, read time and schema |
| `content/videos.json` | 270 videos from Paul's YouTube channel (26 playlists + latest uploads), grouped by detector |
| `content/images.json` + `public/img/` | 757 images, converted to WebP (max 1400px), with intrinsic sizes for zero layout shift |
| `src/build.mjs` | Static site generator (no dependencies) |
| `src/site.css`, `src/site.js` | Design system and progressive-enhancement JS |
| `src/site.config.mjs` | Navigation, homepage copy, detector hubs, blog topics |
| `src/commerce.config.mjs` | Crawfords link policy + tracking ID, product catalogue, shop categories, brand assets, YouTube groups |
| `docs/crawfords-product-links.csv` | Every product box link, with tracking, for Crawfords to verify |
| `docs/seo-inventory.csv` | Every URL with its title, meta description, canonical, JSON-LD types, ad slots, affiliate links and videos |
| `docs/redirects.csv` | Old URL → new URL map (becomes the 301 list at launch) |
| `docs/SEO-AND-ADSENSE.md` | What we preserve and how |
| `docs/DESIGN-SYSTEM.md` | Colours, type, components |
| `docs/HOMEPAGE-COPY.md` | New homepage copy for Paul to approve |
| `tools/` | The extraction scripts used to pull content from the X5 export and the live blog |

## Run it locally

Requires Node 20 or newer. There's nothing to install.

```bash
npm run dev          # build + serve on http://localhost:4173
npm run check        # verify internal links, images, titles, descriptions, canonicals, one H1 per page
```

Build modes:

```bash
node src/build.mjs                          # preview: noindex, ad placeholders
BASE=/paulcee-website/ node src/build.mjs   # GitHub Pages project path
MODE=production node src/build.mjs          # real AdSense + GA4 tags, indexable, verification meta
CNAME=new.paulcee.co.uk node src/build.mjs   # custom subdomain (writes dist/CNAME; use BASE=/)
```

## Deploy

Every push to `main` runs `.github/workflows/pages.yml`, which builds, runs the link/SEO check and publishes to GitHub Pages.

## Commerce rules (agreed with Paul / Crawfords)

- **Every product link goes to crawfordsmd.com with Paul's affiliate tracking** (`?tracking=fa202437c9`). The build normalises all Crawfords URLs to `https://www.crawfordsmd.com/...?tracking=...`, rewrites old short links and the Amazon RNB Power X link to Crawfords, and marks them `rel="sponsored"`. The build log reports the count every time.
- **Crawfords blue is used only for buy/redirect actions**; Minelab red and black carry the site identity.
- Each guide and post gets a "Buy at Crawfords MD" box matched to the product in its title, with Crawfords comparison articles (e.g. Equinox 900 vs Manticore, Vanquish 560 first look) where they exist.
- Links that stay external: YouTube, Facebook group, the Crawfords mailing list, Anderson shafts, Swagier scoops, Minelab.com (Voyager), and one Amazon diamond-tester link (Paul's own Amazon tag).

## Hosting on a subdomain

The brief is to launch on a subdomain of paulcee.co.uk first (e.g. ). GitHub Pages supports this: add a CNAME record at Paul's DNS pointing the subdomain at , set the custom domain in the repo's Pages settings, and build with  and . The preview stays  until launch.

## Content notes for Paul

- **Shop page.** `shop.php` currently shows *Reserved Access* on the live site. It's included in the preview. Does it stay, or come out of the menu?
- **Vanquish 60 Settings.** The live page body contains a stray "Meta Description:" paragraph. It's kept as-is here; we suggest removing it.
- **Headings.** X5 stores most sub-headings as plain text lines. The extractor promoted likely headings (short lines followed by paragraphs, numbered steps, questions) to proper `<h3>`s. These are worth a read-through when we move to WordPress.
- **Two images** referenced by old blog posts (`blog/files/120317.jpg`, `150117.jpg`) already return 404 on the live site.
- **Local-IP schema bug.** The X5 export writes `http://192.168.0.55:8080/` into the homepage JSON-LD (`WebSite`, logo, images). The new build rewrites these to `https://www.paulcee.co.uk/`.
