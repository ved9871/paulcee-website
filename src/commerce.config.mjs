// Commerce, brand and video configuration.
// Rule from Paul/Crawfords: every product link goes to Crawfords Metal Detectors
// with Paul's affiliate tracking ID intact. Crawfords blue is reserved for those actions.

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
export const PRODUCTS = [
  { key: 'manticore', name: 'Minelab Manticore', path: '/minelab-manticore', cat: 'detector', img: 'images/MANTICORE-VIDEO_as2ycfdz.jpg', re: /manticore/i, compare: [['/blog/minelab-equinox-900-vs-minelab-manticore', 'Equinox 900 vs Manticore'], ['/blog/minelab-manticore-vs-xp-deus-2', 'Manticore vs XP Deus 2'], ['/blog/minelab-manticore-top-accessories', 'Top Manticore accessories']] },
  { key: 'equinox-900', name: 'Minelab Equinox 900', path: '/minelab-equinox-900', cat: 'detector', img: 'images/eqx-900-beach_ybg5c3oj.jpg', re: /equinox|eqx|\bnox\b/i, compare: [['/blog/minelab-equinox-900-vs-800', 'Equinox 900 vs 800'], ['/blog/minelab-equinox-900-vs-minelab-manticore', 'Equinox 900 vs Manticore']] },
  { key: 'vanquish-560', name: 'Minelab Vanquish 560 Pro', path: '/minelab-vanquish-560-pro', cat: 'detector', img: 'images/VANQUISH-560PROPACK-RED_5inmo2cy.png', img: 'images/560-web1_cr16wx23.jpg', re: /vanquish.?(560|60|460|360)|60 series/i, compare: [['/blog/first-look-at-the-new-minelab-vanquish-560', 'First look: Vanquish 560']] },
  { key: 'vanquish-540', name: 'Minelab Vanquish 540 Pro', path: '/metal-detectors/minelab/minelab-vanquish/minelab-vanquish540-pro', cat: 'detector', img: 'images/vanquish-settings1.jpg', re: /vanquish.?(540|440|340|40)|40 series|\bvanquish\b/i, compare: [['/blog/first-look-at-the-new-minelab-vanquish-560', '540 vs 560: what changed']] },
  { key: 'x-terra-elite', name: 'Minelab X-Terra Elite', path: '/minelab-x-terra-elite', cat: 'detector', img: 'images/XTE_web.jpg', img: 'images/XTE-intro_WEB.jpg', re: /x-?\s?terra elite|\bxte\b|elite/i, compare: [['/blog/xterra-elite-vs-nokta-triple-score', 'X-Terra Elite vs Nokta Triple Score']] },
  { key: 'x-terra-pro', name: 'Minelab X-Terra Pro', path: '/minelab-x-terra-pro', cat: 'detector', img: 'images/XTP_WEB.jpg', img: 'images/xterra-pro-features.jpg', re: /x-?\s?terra pro|\bxtp\b|x-?\s?terra(?! elite)/i },
  { key: 'ctx3030', name: 'Minelab CTX 3030', path: '/minelab-ctx3030', cat: 'detector', img: 'images/ctx-3030_WEB.jpg', re: /ctx/i },
  { key: 'gold-monster', name: 'Minelab Gold Monster 1000', path: '/minelab-gold-monster-2000', cat: 'detector', re: /gold monster|gold panning|prospect/i },
  { key: 'pro-find-40', name: 'Minelab Pro-Find 40 pinpointer', path: '/minelab-pro-find-40', cat: 'pinpointer', img: 'images/pro-find-40-image-web_49bjvii4.jpg', re: /pro-?\s?find|pinpoint/i },
  { key: 'm9-coil', name: 'Minelab M9 coil', path: '/minelab-m9', cat: 'coil', img: 'images/m9-web.jpg', re: /\bm9\b/i },
  { key: 'm8-coil', name: 'Minelab M8 coil', path: '/minelab-m8', cat: 'coil', img: 'images/m8.jpg', re: /\bm8\b/i },
  { key: 'm15-coil', name: 'Minelab M15 coil', path: '/minelab-m15', cat: 'coil', img: 'images/m15-beach.jpg', re: /\bm15\b|big coil/i },
  { key: 'nox18', name: 'Coiltek NOX 18" coil', path: '/coiltek-nox18', cat: 'coil', img: 'images/coiltek-nox-18-web.jpg', img: 'images/DSC02279.jpg', re: /nox ?18|18[- ]inch|18"/i },
  { key: 'mythtek18', name: 'Coiltek MythTek 18" coil', path: '/coiltek-mythtek18', cat: 'coil', img: 'images/mythtek-1.jpg', re: /mythtek/i },
  { key: 'eqx-15', name: 'Minelab Equinox 15" coil', path: '/minelab-equinox-15inch-coil', cat: 'coil', img: 'blog/files/15inch-coil-review.jpg', re: /15[- ]?inch|15"/i },
  { key: 'wm09', name: 'Minelab WM 09 wireless module', path: '/minelab-wm09', cat: 'accessory', img: 'images/wm09.jpg', img: 'images/20251207_082004.jpg', re: /wm ?09|wireless/i },
  { key: 'ml85', name: 'Minelab ML 85 headphones', path: '/metal-detecting-accessories/headphones/minelab-ml85-headphones', cat: 'accessory', img: 'images/headphones1_xdmsr7n5.jpg', re: /ml ?85|headphone/i },
  { key: 'power-x', name: 'RNB Power X battery', path: '/rnb-power-x', cat: 'accessory', img: 'images/rnb-Power-x1.jpg', img: 'images/pwr_x_n529ai0y.jpg', re: /power ?x|power bank/i },
  { key: 'pro-spade', name: 'Minelab Pro Spade', path: '/minelab-pro-spade', cat: 'digging', img: 'images/cmd-spades.jpg', re: /pro spade|\bspade/i },
  { key: 'evo-spade', name: 'Evolution Pro Cut spade', path: '/metal-detecting-accessories/digging-tools/evolution-spades/Evolution-pro-cut-spade', cat: 'digging', re: /evolution/i },
  { key: 'scoop-s150', name: 'Emite-R S150 sand scoop', path: '/sandscoop-s150', cat: 'digging', img: 'images/emiter-scoop.jpg', re: /scoop|emite/i },
  { key: 'pro-pouch', name: 'CMD Pro finds pouch', path: '/cmd-pro-pouch', cat: 'accessory', img: 'images/cmd-pouch.jpg', re: /pouch/i },
  { key: 'finds-box', name: 'CMD finds box', path: '/cmd-finds-box-medium', cat: 'accessory', img: 'images/finds-box.jpg', re: /finds box|large case/i },
  { key: 'gift-voucher', name: 'Crawfords gift voucher', path: '/cmd-gift-voucher', cat: 'accessory', img: 'images/cmd-gift-card-1.jpg', re: /gift|voucher/i },
];

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
  stats: { subscribers: '12.9k', views: '3.8M+', videos: '1,000+' },
  groups: [
    { key: 'manticore', title: 'Minelab Manticore', re: /manticore/i, hub: 'minelab-manticore' },
    { key: 'equinox', title: 'Minelab Equinox', re: /equinox/i, hub: 'minelab-equinox' },
    { key: 'vanquish', title: 'Minelab Vanquish', re: /vanquish/i, hub: 'minelab-vanquish-60-series' },
    { key: 'x-terra', title: 'Minelab X-Terra', re: /x[- ]?terra/i, hub: 'minelab-x-terra' },
    { key: 'beach', title: 'Beach detecting', re: /beach/i, hub: null },
    { key: 'more', title: 'Fields, finds & accessories', re: /./, hub: null },
  ],
};
