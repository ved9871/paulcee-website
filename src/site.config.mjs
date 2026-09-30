// Site-wide configuration: navigation, homepage copy, detector hubs, topics.
// Copy drafted for Paul's review — see docs/HOMEPAGE-COPY.md.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTopics, loadSettings } from './content/load.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SETTINGS = loadSettings(ROOT);

export const ORIGIN = 'https://www.paulcee.co.uk';

export const LINKS = {
  youtube: 'http://bit.ly/2VcUX0q', // YouTube subscribe (flash1968)
  crawfords: 'https://crawfordsmd.com/metal-detectors/minelab',
  newsletter: 'https://bit.ly/CMD_Maling',
  detexpert: 'https://bit.ly/detexpert',
};

export const DISCOUNT = SETTINGS.discount;

export const NAV = [
  {
    label: 'Detectors', groups: [
      { title: 'Minelab Manticore', items: [['minelab-manticore', 'Manticore user guide'], ['manticore-settings', 'Manticore settings'], ['minelab-manticore-big-coils', 'Manticore big coils'], ['manticore-m8-vs-m9-coil', 'M8 vs M9 coil']] },
      { title: 'Minelab Vanquish', items: [['minelab-vanquish-60-series', 'Vanquish 60 series'], ['minelab-vanquish-60-settings', 'Vanquish 60 settings'], ['minelab-vanquish-40-series', 'Vanquish 40 series']] },
      { title: 'More Minelab', items: [['minelab-equinox', 'Equinox 700 / 900'], ['minelab-x-terra', 'X-Terra Pro & Elite'], ['ctx3030', 'CTX 3030'], ['minelab-pro-find', 'Pro-Find pinpointers']] },
    ],
  },
  {
    label: 'Guides', groups: [
      { title: 'Getting started', items: [['beginners-guide-to-metal-detecting', "Beginner's guide"], ['top-5-beginners-metal-detectors', 'Top 5 beginner detectors'], ['old-maps-for-metal-detecting', 'Researching with old maps'], ['links', 'Permissions & useful links']] },
      { title: 'Gear I use', items: [['detecting-accessories', 'Detecting accessories'], ['sand-scoops-for-metal-detecting', 'Sand scoops'], ['swagier-scoop', 'Swagier scoop'], ['emite-r-sand-scoops', 'Emite-R scoops'], ['evolution-spade', 'Evolution spade'], ['anderson-carbon-fibre-shafts', 'Anderson carbon shafts'], ['coiltek-nox-18-inch-coil', 'Coiltek NOX 18" coil']] },
    ],
  },
  {
    label: 'Rallies', groups: [
      { title: 'Events', items: [['detecting-rallies-2026', 'Detecting rallies 2026'], ['minelab-500-rally', 'Minelab 500 Rally'], ['detectival', 'Detectival']] },
    ],
  },
  { label: 'Blog', href: 'blog/' },
  {
    label: 'About', groups: [
      { title: 'Paul Cee', items: [['about-us', 'About Paul'], ['crawfords-metal-detectors', 'Crawfords Metal Detectors'], ['social-sites', 'Newsletter & socials'], ['shop', 'Clothing & stickers'], ['contact', 'Contact']] },
    ],
  },
];

// Detector hubs shown on the homepage ("Find your detector")
export const HUBS = [
  { slug: 'minelab-manticore', img: 'images/MANTICORE-VIDEO_as2ycfdz.jpg', name: 'Manticore', tag: 'Multi-IQ+ · Flagship', blurb: 'Unleash the Beast — set up for beach and fields.' },
  { slug: 'minelab-equinox', img: 'images/eqx-900-beach_ybg5c3oj.jpg', name: 'Equinox 700 / 900', tag: 'Multi-IQ · All-rounder', blurb: 'Beginner guides and proven settings for the Equinox.' },
  { slug: 'minelab-vanquish-60-series', img: 'images/560-web1_cr16wx23.jpg', name: 'Vanquish 60 series', tag: '360 · 460 · 560', blurb: 'What’s new in the 60 series and how it performs.' },
  { slug: 'minelab-x-terra', img: 'images/XTE-intro_WEB.jpg', name: 'X-Terra Pro & Elite', tag: 'Waterproof · Value', blurb: 'User guides and settings for beach and fields.' },
  { slug: 'minelab-vanquish-40-series', img: 'images/vanquish-settings1.jpg', name: 'Vanquish 40 series', tag: '340 · 440 · 540', blurb: 'Settings for the 340, 440 and 540.' },
  { slug: 'ctx3030', img: 'images/ctx-3030_WEB.jpg', name: 'CTX 3030', tag: 'FBS 2 · Deep beach', blurb: 'Deep gold and old coins on UK beaches.' },
];

export const HOME = {
  eyebrow: 'Minelab Detexpert · Crawfords MD Ambassador',
  h1: SETTINGS.home.h1,
  sub: SETTINGS.home.sub,
  primary: ['#detectors', 'Find settings for my detector'],
  secondary: ['youtube', 'Watch on YouTube'],
  proof: [['3.5M+', 'YouTube views'], ['220+', 'articles & field reports'], ['Weekly', 'new videos']],
  pillars: [
    { k: '01', title: 'Settings that actually work', body: 'Every setting here is tested in real UK ground — wet sand, iron-riddled pasture, mineralised clay — not copied off a forum.' },
    { k: '02', title: 'Straight from the Minelab team', body: 'As a Detexpert and field tester, Paul works alongside Minelab’s own engineers, so you get the why behind a setting, not just the numbers.' },
    { k: '03', title: 'Honest gear advice', body: 'Coils, scoops, spades and headphones — what earns its place in Paul’s bag, and what doesn’t.' },
  ],
  paths: [
    { label: 'New to detecting', body: 'Where to start, what to buy first, and how to get permission.', href: 'beginners-guide-to-metal-detecting', cta: 'Read the beginner’s guide' },
    { label: 'Choosing a detector', body: 'Paul’s top five Minelab machines for beginners, compared.', href: 'top-5-beginners-metal-detectors', cta: 'Compare the top 5' },
    { label: 'Hitting the beach', body: 'Reading cuts and washouts, sand scoops, and wet-sand settings.', href: 'blog/topic/beach-detecting/', cta: 'Beach detecting articles' },
    { label: 'Finding a rally', body: 'Digs, weekends and day events across the UK — updated weekly.', href: 'detecting-rallies-2026', cta: 'See the 2026 rally list' },
  ],
  video: { id: 'nrMw2oEBDyQ', title: 'Minelab Vanquish 560 — what’s new and how it performs', heading: 'A new video most weeks', body: 'Settings walk-throughs, coil tests and beach sessions, filmed in the field. Subscribe so you don’t miss the next one.' },
  newsletter: { heading: 'First to hear about new detectors', body: 'Join the Crawfords Metal Detectors mailing list for new releases, exclusive offers and monthly free competitions.' },
};

export const DISCLOSURE = SETTINGS.disclosure;
export const TAGLINE = SETTINGS.tagline;

// Blog topic hubs — assigned by matching category/title, first match wins
export const TOPICS = loadTopics(ROOT);
