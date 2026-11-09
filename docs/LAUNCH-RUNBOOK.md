# Launch runbook: paulcee.co.uk on Cloudflare Pages

Step-by-step for launch day. Ved drives; Claude prepares and verifies. Tick each step before the next.

## 0. Already done in the repository

- Production build mode: `MODE=production BASE=/ SITE_URL=https://www.paulcee.co.uk node src/build.mjs` writes real AdSense and GA4 tags, indexable robots, canonicals on the new addresses, `sitemap.xml`, `ads.txt`, `_redirects`, and `_worker.js` (301s for every old WebSite X5 address, `/blog/?slug` included, plus apex to www).
- Contact form: set `FORM_KEY` (a Web3Forms access key) in the Pages build environment and the form emails Paul. Without it the form stays preview-only.
- Checks: `node src/check.mjs` (links, titles, descriptions, canonicals, tracking) runs after every build.

## 1. Cloudflare account and Pages project (Ved, about 15 minutes)

1. Log in at https://dash.cloudflare.com (same account as the `sveltia-cms-auth` Worker).
2. **Workers & Pages → Create → Pages → Connect to Git.** Authorise GitHub for the `ved9871/paulcee-website` repository only.
3. Project settings:
   - Project name: `paulcee-website` (gives `paulcee-website.pages.dev`)
   - Production branch: `main`
   - Build command: `npm ci && npm test && MODE=production BASE=/ SITE_URL=https://www.paulcee.co.uk node src/build.mjs && node src/check.mjs`
   - Build output directory: `dist`
   - Environment variables (Production): `NODE_VERSION` = `22`, `MODE` = `production`, `BASE` = `/`, `SITE_URL` = `https://www.paulcee.co.uk`, and `FORM_KEY` once Paul's address is confirmed (see step 2).
4. Save and Deploy. First build takes 2 to 3 minutes. Open `https://paulcee-website.pages.dev/` and spot-check: homepage, a guide, a blog post, `/admin/`, `/sitemap.xml`, `/ads.txt`, and an old address such as `/minelab-manticore.html` (must 301 to `/minelab-manticore/`).
5. **Rehearsal.** Paul and Scott click through the pages.dev address for 20 minutes. Anything found gets fixed and redeployed before DNS moves.

## 2. Contact form key (Ved, 2 minutes)

1. https://web3forms.com → enter the address Paul chose → the access key arrives by email.
2. Add it as `FORM_KEY` in the Pages project environment variables and retry the deployment.
3. Send a test message from `/contact/` on pages.dev; confirm it arrives.

## 3. Sign-in helper (Ved, 1 minute)

Workers & Pages → `sveltia-cms-auth` → Settings → Variables → `ALLOWED_DOMAINS` = `ved9871.github.io,paulcee-website.pages.dev,www.paulcee.co.uk,paulcee.co.uk`. Deploy.

## 4. Add the domain to Cloudflare (Ved, 10 minutes)

1. Cloudflare dashboard → **Add a domain** → `paulcee.co.uk` → Free plan.
2. Cloudflare scans and imports the existing DNS records from IONOS. **Check the mail records are present**: the `MX` record(s), the `TXT` SPF record (`v=spf1 include:_spf-eu.ionos.com ~all`), and any `autodiscover`/`mail`/`imap`/`smtp` entries. Add any that are missing by copying them from IONOS (Domains & SSL → paulcee.co.uk → DNS). Keep them unproxied (grey cloud).
3. Delete the old `A` records for `@` and `www` that point at the IONOS web server (185.38.109.x). The Pages custom-domain step below replaces them.
4. Cloudflare shows two nameservers (`xxx.ns.cloudflare.com`). Keep that page open.

## 5. Attach the domain to Pages (Ved, 2 minutes)

Workers & Pages → `paulcee-website` → **Custom domains** → add `www.paulcee.co.uk`, then add `paulcee.co.uk`. Cloudflare creates the DNS records itself. The worker redirects apex to www.

## 6. Switch nameservers at IONOS (Ved, 5 minutes; propagation up to 24 h, usually under 1 h)

1. https://login.ionos.co.uk → Domains & SSL → `paulcee.co.uk` → Nameserver → **Use custom nameservers** → paste the two Cloudflare nameservers → save.
2. Back in Cloudflare, click **Check nameservers**. Status turns Active when propagation reaches Cloudflare.
3. **Do not cancel IONOS hosting or email.** The old site stays reachable on its IP during the overlap, and email keeps flowing through the records copied in step 4.

## 7. Immediately after the switch (Claude verifies, Ved watches)

- `https://www.paulcee.co.uk/` serves the new site with a valid certificate; `https://paulcee.co.uk/` 301s to www.
- 20 old addresses sampled from `docs/redirects.csv` all 301 to the right page.
- `/sitemap.xml`, `/ads.txt`, `/robots.txt` served; no `noindex` in the homepage head; AdSense script present.
- Send and receive a test email on Paul's address.
- Admin at `https://www.paulcee.co.uk/admin/` signs in and a trivial save deploys.

## 8. Google (Ved, with the Search Console access Paul granted, 10 minutes)

1. Search Console → property `paulcee.co.uk` (domain property) or `https://www.paulcee.co.uk/` → **Sitemaps** → submit `https://www.paulcee.co.uk/sitemap.xml`.
2. **URL Inspection** on the homepage and two guides → Request indexing.
3. Settings → check the verification still holds (the `google-site-verification` meta tag from the old site is carried in the build).
4. AdSense → Sites → `paulcee.co.uk` should show Ready; the ads.txt warning clears within a few days.
5. Analytics: GA4 property `G-0VWVMTCBM4` starts receiving data from the new pages within minutes (Realtime report).

## 9. Days 1 to 14

- Search Console → Pages (indexing) and Crawl stats daily: 404s that appear get a redirect added to `content/redirects.json` or the worker map.
- AdSense Sites and earnings daily for the first week.
- After 14 clean days: cancel the IONOS **web hosting** package only (keep the domain and the mailbox there unless Paul has moved email).

## Rollback

At IONOS, set the nameservers back to IONOS defaults. The old site and email come back as propagation reverses. Nothing on the new side needs undoing.
