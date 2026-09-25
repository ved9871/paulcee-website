# Design system: "Field guide"

Direction came from the UI/UX Pro Max design database. The product type is Magazine/Blog, and the recommended style is **Editorial Grid / Magazine**: content-first, high-contrast type, and one strong accent. It's adapted to the world of metal detecting: turned earth, found gold, map contours, and settings read out like a detector display.

## Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F6F2EA` warm paper | `#15130F` | Page background |
| `--surface` | `#FFFFFF` | `#1E1B16` | Cards, sidebars |
| `--ink` | `#1E1B16` soil | `#EFE9DD` | Text, primary buttons |
| `--muted` | `#5E574B` | `#B0A690` | Secondary text |
| `--brass` | `#8A6420` found gold | `#D9A441` | Labels, accents, links underline (4.7:1 on paper) |
| `--red` | `#B3261E` Minelab red | `#D2453A` | **Buy / affiliate actions only** (6.5:1 with white) |
| `--soil` | `#1C1915` | `#0F0D0A` | Footer and feature bands |

Red is reserved for buying actions, so affiliate clicks always stand out and are never confused with navigation.

## Type

- **Zilla Slab 600/700** for headings: a sturdy slab, like a field guide or tool catalogue.
- **IBM Plex Sans 400–600** for body text (17px base, 1.65 line height, 70ch measure).
- **IBM Plex Mono 500** for uppercase labels, tags and settings, echoing a detector's readout.

## Components

Header with mega menus (Detectors / Guides / Rallies / Blog / About); mobile drawer; search dialog (press `/`); detector hub cards; "start here" path cards; post cards (lead + grid); a YouTube facade that loads the player on click; ad-slot placeholders; the "Where Paul buys" affiliate box with a copyable discount code; a sticky table of contents; an author box; previous/next post links; the discount band and affiliate disclosure in the footer.

## Accessibility and performance

- Contrast is AA or better in both themes. Focus rings are visible, a skip link is provided, and all touch targets are at least 44px.
- The mega menu works by click and keyboard, and Escape closes it. `prefers-reduced-motion` is respected.
- Images are WebP with width and height set (no layout shift), lazy-loaded below the fold, and the hero loads with `fetchpriority="high"`.
- There's no framework and no build dependencies. The JS is about 5 KB and only enhances the page; everything works without it.
