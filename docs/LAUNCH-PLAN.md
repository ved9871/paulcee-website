# paulcee.co.uk: going live without losing AdSense or Crawfords income

Prepared for the call with Paul, Friday 6 November 2026. Written by Ved with the site build notes, today's Scott/Ved catch-up, Scott's voice note, and checks run on the live site this morning.

## 1. Where things stand

**The new site is content-complete and stable.** Paul and Scott have been editing it for three weeks through the CMS (about 60 saves, 11 old posts removed, 2 rally events added, one new post with an interactive map). Every save has deployed. Backups run weekly. Paul's words via Scott: "pretty much happy with the website, other than that we're ready to go".

**What it is not yet:** a production deployment. It still runs on the preview address, hidden from Google, with no ads loaded, no sitemap, a contact form that goes nowhere, and no way to redirect the old web addresses. Those are the launch jobs, and they are the part that protects Paul's income.

**The current live site** is WebSite X5 on IONOS hosting (IIS/PHP), domain DNS at the registrar, email via IONOS. Scott reports 1 to 2 Crawfords orders a day still come through it. It runs AdSense Auto ads with publisher ID `ca-pub-4569712894771793` and has no ads.txt file (AdSense flags that as a warning today).

## 2. What happens to AdSense if we switch

Short version: **AdSense does not need to be re-applied for or re-approved.** Approval is per domain. The domain is not changing, the publisher ID is not changing, and the new site already carries the same AdSense code (switched on only in the production build). Google will not know or care that the host and design changed.

The note from this morning's catch-up that "Google Ads will need resubmission" conflates two things. Google Ads (paid advertising) is not involved here. AdSense (the money Paul earns from ads) carries over automatically.

What *does* move, and where revenue can dip:

| Area | What changes at switch-over | Effect on money | How we limit it |
|---|---|---|---|
| Ad serving | Same code, same account. Auto ads re-learn placements on the new layout. | Days of slightly lower fill, then normal. The new site has one hand-placed blog slot (the same one as today) plus Auto ads, exactly as now. | Nothing to do. We also add ads.txt, which the current site lacks. |
| Google search traffic | Every URL changes shape (`/minelab-manticore.php` becomes `/minelab-manticore/`, `/blog/?slug` becomes `/blog/slug/`). Google has to re-crawl 260 pages. | **This is the real risk.** Without redirects, old addresses 404, rankings drop, and both ad views and Crawfords clicks drop with them. With proper 301 redirects and the same page titles, a typical redesign sees a dip of 0 to 20% for 2 to 6 weeks, then recovery and usually a gain from the faster site. | Permanent redirects for all 300+ old addresses (list already built: `docs/redirects.csv`), page titles and descriptions kept identical (31 of 32 matched when we migrated), sitemap submitted on day one, Search Console watched daily for the first fortnight. |
| Crawfords affiliate orders | All 128 Crawfords links keep Paul's tracking code (the build refuses to publish one without it). Product boxes add more buy links than the old site had. | Orders follow traffic. A search dip means fewer orders for a few weeks; the extra buy boxes pull the other way. | Same as above, plus launching away from Black Friday week so a dip does not land on the busiest fortnight. |
| DNS switch | Visitors move to the new host as DNS updates, typically within an hour, up to 24 h for stragglers. | None if the old site stays up during the overlap. | Leave IONOS running for a week after launch. |
| Email | Nothing, unless Paul chooses to move it. | None. | Email records are copied across before the DNS move. |

**Instant switch today versus 1 to 2 weeks:**

- Switching today would mean going live without redirects, sitemap or working contact form. The 404s would start immediately and the search dip would be deep and avoidable. Not recommended.
- One week (launch **Friday 13 November, 1pm**, Scott's suggested slot) gives time to do the launch jobs properly and leaves a week of monitoring before Black Friday week (Crawfords' Black Friday starts 23 November).
- Two weeks (20 November) lands the switch three days before Black Friday. If 13 November slips, the better choice is to wait until **4 December**, after the peak.

Recommendation: **Friday 13 November at 1pm.**

## 3. Hosting recommendation: Cloudflare, as Paul asked

Paul said he wants everything with Cloudflare and is happy to pay. The good news is the website part costs nothing, and it is also the technically better choice:

- The preview runs on GitHub Pages, which **cannot do real 301 redirects**. Cloudflare Pages can, from a plain `_redirects` file, for all 300+ old URLs. That is the single most important protection for rankings and income.
- Cloudflare Pages is free, builds from the same GitHub repository, so the CMS, backups and everything Paul and Scott have learned stay exactly the same.
- Cloudflare DNS (free) replaces the registrar's DNS. Moving the nameservers is the one step that needs Paul's registrar login.
- Email: Paul can keep the IONOS mailbox (we copy the mail records to Cloudflare DNS and nothing changes), or move to Cloudflare Email Routing (free, forwards to Gmail) or a paid mailbox such as Google Workspace. His call; it does not affect the website launch date.

## 4. What we need from Paul

| # | Item | Why | When |
|---|---|---|---|
| 1 | **Where the domain paulcee.co.uk is registered**, and either the login or Ved added as a contact | To change nameservers to Cloudflare. DNS currently answers from a reseller (domain.name / Parktons), not IONOS directly, so this may be a separate account from the hosting. | Before 13 Nov |
| 2 | **IONOS login** (or a screenshot of the current DNS and email settings) | To copy the email records exactly so mail keeps working after the DNS move | Before 13 Nov |
| 3 | **Email decision**: keep the IONOS mailbox, forward to Gmail for free, or a paid mailbox | Determines which mail records we set up | On the call |
| 4 | **Google Search Console**: add ved.prakash@crawfordsmd.com as an owner (or confirm Paul will submit the sitemap himself) | Submit the sitemap at launch, watch indexing and errors | Before 13 Nov |
| 5 | **AdSense**: confirm paulcee.co.uk is in the Sites list and Auto ads are on (a screenshot is enough). No access needed. | Sanity check only | On the call |
| 6 | **Contact form**: which email address messages should go to, and whether Facebook or YouTube should be the preferred contact route (Scott's question) | The form is wired up at launch | On the call |
| 7 | **Sign-off on the preview** as it stands, including the removed posts and the new copy | Content freeze from 12 Nov | On the call |
| 8 | **Keep IONOS hosting paid for one more month** after launch | Overlap during DNS propagation, and a fallback | Now |

Paul's thumbnail question (via Scott): **any JPG or PNG he uploads is converted to WebP automatically** by the editor, resized to a maximum of 1600px. He does not need to prepare files in any particular format. Files over 15 MB are refused.

## 5. Ved's launch work

| Day | Task |
|---|---|
| Mon 9 Nov | Create the Cloudflare account and project, connect it to the GitHub repository, production build settings (real AdSense and GA4 tags, indexable, `www.paulcee.co.uk` addresses). Generate `_redirects` from the redirect list, including the blog's old `?slug` addresses. Add the sitemap. |
| Tue 10 Nov | Wire the contact form (free form service) to Paul's chosen address. Point the CMS at the live address and allow it in the sign-in helper. Run the full checks: every old URL redirects, every Crawfords link tracked, titles and descriptions unchanged, AdSense tag present on every page, ads.txt served. |
| Wed 11 Nov | Dress rehearsal on a temporary Cloudflare address: Paul and Scott click through, Ved fixes anything found. Export IONOS DNS and email records; stage them in Cloudflare. |
| Thu 12 Nov | Content freeze on the old site. Final content sync. Search Console ready. |
| **Fri 13 Nov, 1pm** | Change nameservers at the registrar. Within the hour: confirm the site, email and admin work on the real domain, submit sitemap, confirm AdSense serving. Old site left running. |
| 14 to 27 Nov | Daily check of Search Console coverage and the AdSense Sites page. Redirect fixes as crawl errors appear. Cancel IONOS hosting after a clean fortnight. |

Total: about three working days of build work plus the launch afternoon.

## 6. What could still go wrong, and the fallback

- **Registrar access takes longer than expected.** Launch moves a week; nothing else changes.
- **A ranking dip bigger than expected.** We will see it in Search Console within days. Redirect errors are fixable the same day. A genuine dip recovers over weeks; nothing about it is permanent as long as redirects and titles are right.
- **Something breaks on launch day.** Nameservers can be pointed back to the old settings and the old site is back within the hour. That is why IONOS stays paid for.

## 7. Decisions needed on today's call

1. Launch date: 13 November, 1pm (recommended), or 4 December.
2. Hosting on Cloudflare Pages: yes.
3. Email: keep IONOS mailbox, free forwarding, or paid mailbox.
4. Contact route: email address for the form, and whether to push Facebook or YouTube.
5. Domain registrar access by Tuesday.
