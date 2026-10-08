# SEO and AdSense preservation

The redesign must not cost Paul any rankings or any AdSense or affiliate income. This is what the preview preserves and what happens at launch.

## Preserved in the content package (verified)

| Asset | Status |
|---|---|
| `<title>` on all 32 pages and 223 posts | Carried over verbatim. 31/32 pages were checked against the live site and match exactly. `shop.php` is live as "Reserved Access". |
| Meta descriptions and keywords | Carried over verbatim |
| Canonical URLs | Point to the current live URLs |
| Open Graph and Twitter cards | Carried over (title, description, image, type) |
| JSON-LD | Carried over per page/post: `WebSite`, `LocalBusiness`, `VideoObject`, `BlogPosting`, `BreadcrumbList`. Local-IP URLs from the X5 export are corrected. |
| Search-engine verification | Google, Bing and Norton tokens are output in production builds only |
| Image alt text | Carried over from X5 for all 755 images |
| YouTube videos | Every embed kept, loaded on click (faster pages) |
| Affiliate links | Every Crawfords/Minelab link kept with its tracking ID intact (e.g. `?tracking=fa202437c9`), marked `rel="sponsored"` |

## AdSense

- Publisher: `ca-pub-4569712894771793`
- The site currently uses **Auto ads** on pages and **manual slot `5406186549`** in the blog sidebar.
- In production mode the build outputs the same `adsbygoogle.js` loader (Auto ads decide their own positions, as on the live site) and slot `5406186549` on every post (bottom of the sidebar, below the recent-posts list) and at the foot of the blog index and topic pages. No other hand-placed units: an ad call without a slot ID renders nothing, and the build never inserts ads into article text, so ads can't land next to buy buttons.
- The preview shows the blog slot as a labelled placeholder and loads **no** ad code. Serving ads on an unapproved GitHub domain would break AdSense policy.
- `public/ads.txt` declares the publisher ID (the live site has no ads.txt, which AdSense flags as a warning). It only counts once the site is on the real domain.
- Placement was compared against eight live pages on 2026-10-08 (see the session notes): live uses Auto ads only, plus the blog slot in the post sidebar.
- At launch: check the account's **Sites** list, ads.txt status and ad serving within 24 hours.

## Analytics

GA4 `G-0VWVMTCBM4` is output in production builds only.

## URL changes and 301s

The new site uses clean URLs (`/minelab-manticore/`, `/blog/minelab-manticore-settings/`). Every old URL is listed in `docs/redirects.csv` and gets a **301** at launch:

- `/minelab-manticore.html` → `/minelab-manticore/`
- `/contact.php` → `/contact/`
- `/blog/?minelab-manticore-settings` → `/blog/minelab-manticore-settings/` (query-string rule)
- `/blog/?category=…`, `?tag=…`, `?month=…` → the matching topic hub or `/blog/`

If Paul prefers zero URL change, WordPress can keep the `.html` paths instead. Either way, no URL is ever left without a destination.

## Launch checklist (summary)

1. Freeze content on X5; take a final crawl and snapshot of Search Console.
2. Deploy WordPress with the production build settings and apply all 301s.
3. Crawl the new site: 0 × 404s from the old URL list, and titles, descriptions and canonicals matching the inventory.
4. Resubmit the sitemap in Search Console. Check AdSense serving and affiliate click-through.
5. Monitor coverage, rankings and revenue daily for 2 weeks, then weekly for 6 weeks.
