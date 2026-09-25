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
- In production mode the build outputs the same `adsbygoogle.js` loader, auto-ad positions, and slot `5406186549` in the blog sidebar and blog index.
- The preview shows these positions as labelled placeholders and loads **no** ad code. Serving ads on an unapproved GitHub domain would break AdSense policy.
- At launch: `ads.txt` stays at the domain root unchanged, and we check the account's **Sites** list and ad serving within 24 hours.

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
