// Commerce, brand and video configuration.
// Rule from Paul/Crawfords: every product link goes to Crawfords Metal Detectors
// with Paul's affiliate tracking ID intact. Crawfords blue is reserved for those actions.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProducts, loadSettings } from './content/load.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const CMD = 'https://www.crawfordsmd.com';
export const TRACKING = 'fa202437c9';
export const cmdUrl = p => `${CMD}${p.startsWith('/') ? p : '/' + p}${p.includes('?') ? '&' : '?'}tracking=${TRACKING}`;

// Old-site links that now point at Crawfords (short links, Amazon, bare Crawfords URLs).
export const LINK_MAP = {
  'http://bit.ly/CMDMDUK': '/', 'https://bit.ly/CMDMDUK': '/',
  'http://bit.ly/CMDvanquish': '/minelab-vanquish',
  'https://bit.ly/CoiltekCoils': '/metal-detecting-accessories/accessories-coiltek',
  'https://bit.ly/coil_repair': '/metal-detecting-accessories/accessories-minelab/tough-lugs',
  'https://bit.ly/NOX18': '/coiltek-nox18',
  'https://bit.ly/buywashers': '/minelab-teardrop-washers',
  'https://bit.ly/cmdbackpack': '/metal-detecting-accessories/accessories-bags-pouches-bungees-clothing/cmd-backpack',
  'https://bit.ly/VanquishShaft': '/metal-detecting-accessories/accessories-minelab/vanquish-accessories/vanquish-straight-shaft',
  'https://amzn.to/3Px9lhW': '/rnb-power-x', // RNB Power X: Crawfords stocks it
};

// Product catalogue: Crawfords path, image from Paul's own library, title match.
// Drives the "Buy at Crawfords" boxes and the Gear hub. `compare` = Crawfords comparison articles.
export const PRODUCTS = loadProducts(ROOT);

// Shop-by-category tiles → Crawfords category pages, each paired with Paul's guide.
export const SHOP_CATS = [
  { name: 'Minelab detectors', blurb: 'The full Minelab range, UK stock.', path: '/metal-detectors/minelab', guide: 'top-5-beginners-metal-detectors' },
  { name: 'Beginner detectors', blurb: 'Vanquish, X-Terra and Go-Find starter bundles.', path: '/metal-detectors/beginners-childrens-detectors', guide: 'beginners-guide-to-metal-detecting' },
  { name: 'Pinpointers & probes', blurb: 'Pro-Find 20, 35 and 40.', path: '/metal-detecting-accessories/pinpoint-probe/minelab-pro-find-20', guide: 'minelab-pro-find' },
  { name: 'Digging tools & scoops', blurb: 'Spades, sand scoops and multi-tools.', path: '/digging-tools', guide: 'sand-scoops-for-metal-detecting' },
  { name: 'Search coils', blurb: 'Minelab and Coiltek coils.', path: '/metal-detecting-accessories/accessories-coiltek', guide: 'minelab-manticore-big-coils' },
  { name: 'Headphones & power', blurb: 'ML 85, ML 105, WM 09 and RNB Power X.', path: '/metal-detecting-accessories/power-accessories', guide: 'detecting-accessories' },
];

// Brand assets from Paul's own image library.
export const BRAND = {
  crawfordsWhite: 'images/CRAWFORDS-2024-White_b0y4qkqf.png',
  crawfordsBlue: 'brand/crawfords-blue.png', // official blue logo on transparent (Paul's preference, Sept 2026)
  minelab: 'images/minelab-logo.jpg',
  detexpertWord: 'images/Detexpert-Header1.png',
  detexpertShield: 'images/detexpert-logosml.png',
  coiltek: 'images/CoiltekLogo.png',
  paulBadge: 'images/YT-thumb_2020.png',
  paulPhoto: 'images/2026-thumb.jpg',
};

// YouTube: channel facts (from the channel page, Sept 2026) and playlist groups for the Videos page.
export const YT = {
  channelId: 'UCAJhc7UhOgQaupZhJt42G7w',
  channelUrl: 'https://www.youtube.com/channel/UCAJhc7UhOgQaupZhJt42G7w',
  subscribeUrl: 'https://www.youtube.com/channel/UCAJhc7UhOgQaupZhJt42G7w?sub_confirmation=1',
  stats: loadSettings(ROOT).youtube,
  groups: [
    { key: 'manticore', title: 'Minelab Manticore', re: /manticore/i, hub: 'minelab-manticore' },
    { key: 'equinox', title: 'Minelab Equinox', re: /equinox/i, hub: 'minelab-equinox' },
    { key: 'vanquish', title: 'Minelab Vanquish', re: /vanquish/i, hub: 'minelab-vanquish-60-series' },
    { key: 'x-terra', title: 'Minelab X-Terra', re: /x[- ]?terra/i, hub: 'minelab-x-terra' },
    { key: 'beach', title: 'Beach detecting', re: /beach/i, hub: null },
    { key: 'more', title: 'Fields, finds & accessories', re: /./, hub: null },
  ],
};
