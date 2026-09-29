# Feedback log

## 25 Sept 2026 — voice-note review (via Ved)

| Feedback | What changed |
|---|---|
| "Needs a few more images of him every so often" | Six new photos of Paul added: homepage hero (beach, Minelab shirt), "Advice from the field" section, "Find your detector" section, video-section banner, Videos / Blog / About page headers, an About-page gallery, and a "Written by Paul Cee" photo card in every guide and post sidebar. See `PHOTOS.md`. |
| "Two buttons near the top — Official Minelab Detexpert and Ambassador — you can't read those" | The badges were dark-on-dark in dark mode. They are now white pills with dark text and a fixed colour in both light and dark mode. Buy buttons and primary buttons also use fixed brand colours in both modes; link-blue lightens in dark mode for contrast. |
| "Trusted by — loads of logos but you can't read them because the banner is dark; needs to be white" | The logo strip is now always white (both modes), with the Crawfords logo on a black chip so it reads. |
| "The video library is really good — that's how I want the blog library: press X-Terra and it brings up everything X-Terra" | The blog library now filters in place: the topic chips (Manticore, Equinox, Vanquish, X-Terra, CTX 3030, coils & gear, beach, finds, rallies, beginners) filter the grid instantly with counts, the URL updates (`/blog/#minelab-x-terra`) so filtered views can be shared, and "show more" paginates within the filter. The per-topic pages are kept for search engines and for visitors without JavaScript. |

## 29 Sept 2026 — second review (Paul, via Ved)

| Feedback | What changed |
|---|---|
| "The Crawfords logo (white on black) looks weird — use the blue Crawfords logo with no background" | Paul's supplied logo is now a transparent WebP (`public/img/crawfords-blue.webp`) and replaces the white logo everywhere: hero badge, "Trusted by" strip, "Where Paul buys" boxes, shop band (on a white card over the blue band), footer discount band and partner logos (white chips on the dark footer). |
| "The Detexpert logo on the image is cut off" | The hero photo's crop rule was also applying to the Detexpert shield. It now applies only to the photo; the shield shows in full (smaller on phones). |

Also fixed in the same pass (general UX review at phone, tablet and desktop widths, light and dark):
- The "Design preview" bar was cream-on-cream in dark mode; it now has fixed dark colours.
- Tap targets under 44px on phones (shop-tile guide links, rally links, footer links, chips, breadcrumbs) enlarged.
- "Trusted by" logos centred and larger on desktop; the video banner's height is capped on wide screens.
- The sidebar "Buy at Crawfords" box stacks its image above the text instead of squeezing into two narrow columns.
