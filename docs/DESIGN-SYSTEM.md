# Design system: Minelab red & black, Crawfords blue

The palette follows the brief agreed with Paul and Crawfords: **Minelab red and black** for the site's identity, with **Crawfords blue reserved for purchase and redirect points**, so every "buy" action is visually distinct from navigation and never competes with editorial links.

The colour values are taken from the two brands' live stylesheets (minelab.com and crawfordsmd.com), not approximated.

## Colour

| Token | Light | Dark | Source / use |
|---|---|---|---|
| `--brand` | `#E1261C` | `#FF3B30` | Minelab red (minelab.com). Primary buttons, labels, accents |
| `--brand-deep` | `#B81C14` | `#E1261C` | Hover state; text-on-light at 5.6:1 |
| `--ink` / `--ink-2` | `#1A1816` / `#2E2925` | `#F2EFEB` | Minelab black / charcoal (minelab.com). Text, header mark, dark bands |
| `--buy` | `#075692` | `#2F8FD8` | **Crawfords blue** (crawfordsmd.com). Buy buttons, product boxes, affiliate links only |
| `--buy-deep` | `#064575` | `#075692` | Crawfords dark blue. Hover; shop band gradient |
| `--bg` / `--surface` | `#F7F7F7` / `#FFFFFF` | `#141312` / `#1E1C1A` | Page and cards |
| `--muted` | `#5F5B57` | `#A9A39C` | Secondary text (5.9:1) |

Rule of thumb: **red says "Paul / Minelab", blue says "buy at Crawfords".** Nothing else uses blue.

## Brand marks (from Paul's own image library)

- **Minelab Detexpert** shield and wordmark: hero badge, hero photo corner, credentials strip, footer.
- **Minelab** logo: credentials strip and footer.
- **Crawfords Metal Detectors** white lock-up: hero badge, credentials strip (on black), the shop band, the footer discount band, and the "Where Paul buys" box on every guide and post.
- **Coiltek**: credentials strip and footer.

## Type

- **Zilla Slab 600/700** for headings: sturdy slab, like a field guide.
- **IBM Plex Sans 400–600** for body (17px base, 1.65 line height, 70ch measure).
- **IBM Plex Mono 500** for uppercase labels, tags and settings, echoing a detector readout.

## Components

Header with mega menus (Detectors / Guides / Rallies / Videos / Blog / About) and a blue "Shop Crawfords MD" button; mobile drawer; search dialog covering guides, posts and videos (press `/`); hero with Detexpert and Crawfords badges; credentials strip; detector hub cards; video cards with a click-to-play YouTube facade; the Crawfords shop band (six categories, each paired with Paul's guide); "start here" paths; post cards; product boxes ("Buy at Crawfords MD" + comparison links); "Gear in this guide" strip; "Where Paul buys" sidebar box with the copyable `PaulCee10` code; sticky table of contents; author box; footer discount band with the Crawfords logo; partner logos; affiliate disclosure.

## Accessibility and performance

- AA contrast or better in both themes; visible focus rings; skip link; 44px+ touch targets.
- Mega menu works by click and keyboard; Escape closes. `prefers-reduced-motion` respected.
- WebP images with intrinsic sizes (no layout shift), lazy-loaded below the fold; YouTube loads only on click.
- No framework and no build dependencies. About 6 KB of JS, all progressive enhancement.
