# CMS for paulcee.co.uk: design

**Status:** approved section by section with Ved on 29 Sept 2026. Paul chose a free, Git-based CMS.
**Research:** 4 Git-based tools evaluated and fact-checked. Scores out of 70: Sveltia 57, Decap 51, Pages CMS 38, Keystatic 37.

## Goal

Paul (and Ved) can edit every page, create pages, topics, blog posts, products, and rally/event entries in a WordPress-style web admin. The site stays free and static on GitHub Pages, with no server or database. SEO, AdSense and the Crawfords affiliate rules must stay enforced.

## Decisions

| Area | Decision |
|---|---|
| Tool | **Sveltia CMS**, pinned to an exact version (currently `@sveltia/cms@0.223.0`). `config.yml` is kept Decap-compatible as the exit route. |
| Admin | `public/admin/index.html` + `public/admin/config.yml`, copied into `dist/admin/` by the build. |
| Backend | GitHub, repo `ved9871/paulcee-website`, branch `main`, simple publish (Save = commit = deploy). |
| Login | "Sign in with GitHub" via `sveltia-cms-auth` on the Cloudflare Workers free plan. A GitHub OAuth App is registered by ved9871. `ALLOWED_DOMAINS` is set to the github.io host now and the paulcee.co.uk subdomain later. Editors: Paul and Ved, each a free GitHub account with 2FA and Write collaborator access. Emergency fallback: token sign-in. |
| Cost | £0 a month. |

## Content model

Posts and pages become **Markdown with YAML front matter**. The visual editor stores Markdown; our JSON blocks would force raw-HTML editing. Structured items stay as JSON files. **Amendment (29 Sept, planning):** legacy SEO blobs move to developer-managed sidecar files rather than the front matter, because Sveltia's handling of undeclared keys on save is unverified and a lost JSON-LD block would be a silent SEO regression.

| Collection | Location | Fields |
|---|---|---|
| Posts | `content/posts/<slug>.md` | Front matter (what Paul edits): title, datePublished, draft, topic (relation → topics), tags, cover (image), heroVideo, summary, seo {title, description, keywords}. Body = Markdown. |
| Pages | `content/pages/<slug>.md` | Front matter: title (the H1), seo {title, description, keywords}. Body = Markdown. |
| Legacy meta (developer-managed, not in the CMS) | `content/meta/posts/<slug>.json`, `content/meta/pages/<slug>.json` | liveUrl, seo {canonical, robots, og, twitter, jsonld, verification}, author, category, categorySlug, readTime, dateModified, adSlots. The loader merges them under the front matter. New entries without a meta file get defaults: canonical and liveUrl = ORIGIN + path, generated BlogPosting JSON-LD, author Paul Cee, computed read time. |
| Topics | `content/topics/<key>.json` | key, label, description, match pattern (developer field) |
| Products | `content/products/<key>.json` | key, name, path (Crawfords path only; the build adds tracking), cat (select), img, compare (list of {path, label}), match pattern (developer field) |
| Events | `content/events/<slug>.json` | name, start, end, venue, link, image, description |
| Videos | `content/videos.json` | a file with `playlists` and `videos` lists |
| Settings | `content/settings.json` | discount code and terms, disclosure, homepage headline and subhead, YouTube stats |

**Body components** (editor buttons and Markdown tokens):
- `{{youtube id="…" title="…"}}`
- `{{product key="…"}}`
- `{{ad slot="…"}}`

Tables, the contact form and the one embed stay as protected raw HTML (`<div class="raw">…</div>`), and the contact form becomes `{{contactform}}`.

**Rules:**
- URLs are fixed once published (slug from the file name).
- Drafts are skipped by the build.
- Future-dated posts are skipped until their date; a daily 06:00 UK cron rebuild publishes them.

## Images

- `media_folder: public/img`, `public_folder: /img`.
- In-browser conversion to WebP at quality 80, max 1600px wide, with slugified filenames and a 15 MB cap.
- Alt text is required.
- Legacy `@img:` keys still resolve through `content/images.json`, which is not exposed in the CMS. New uploads use direct `/img/*.webp` paths, and the build reads WebP dimensions from the file header (no dependency).
- Brand logos stay outside the upload workflow.

## Build and safety

- `build.mjs` reads Markdown and JSON, renders Markdown with two small dependencies (`marked`, `yaml`), expands the components, and keeps every current output identical.
- `check.mjs` (run in CI before deploy) blocks the deploy on any of:
  - a missing title, description or canonical
  - H1 count ≠ 1
  - broken internal links or images
  - any crawfordsmd.com link without `tracking=fa202437c9`

  It warns on missing alt text and on title or description length.
- A failed build leaves the live site on the last good version.

## Testing

1. **Conversion comparison:** build before and after the migration and compare, for all 255 entries, title, meta description, canonical, robots, OG, JSON-LD, the H1–H4 text sequence, image src and alt set, the link href set and the YouTube id set. Zero unexplained differences.
2. **Save round-trip** in the admin on real posts: no front-matter keys dropped.
3. Phone photo (HEIC/JPG) upload.
4. Login with both accounts.
5. Admin on a phone.

## Launch

1. Build the CMS on branch `cms` (the live preview is unaffected).
2. Convert the content and pass the comparison.
3. Set up login and invites.
4. Trial edits by Paul and Ved.
5. Merge, then hand Paul a one-page guide and a 30-minute walkthrough.
6. When the subdomain is ready: CNAME, `BASE=/`, and update `ALLOWED_DOMAINS` and `site_url`.

## Out of scope

- Editor roles.
- Editorial (PR-based) workflow.
- Editing menus and layout (developer-managed).
- Uploading video files (YouTube links only).
