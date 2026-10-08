// Editor buttons for the Markdown body. The build injects PRODUCT_OPTIONS from content/products.
const PRODUCT_OPTIONS = /*__PRODUCT_OPTIONS__*/[];
const ytId = s => (String(s).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/) || [, String(s).trim()])[1];
const attr = s => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

CMS.registerPreviewStyle(new URL('../assets/site.css', location.href).href);

CMS.registerEditorComponent({
  id: 'youtube', label: 'YouTube video',
  fields: [{ name: 'id', label: 'YouTube link or video ID', widget: 'string' }, { name: 'title', label: 'Title (optional)', widget: 'string', required: false }],
  pattern: /^\{\{youtube id="([^"]*)"(?: title="([^"]*)")?\}\}$/,
  fromBlock: m => ({ id: m[1], title: (m[2] || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&') }),
  toBlock: d => `{{youtube id="${ytId(d.id)}"${d.title ? ` title="${attr(d.title)}"` : ''}}}`,
  toPreview: d => `<img src="https://i.ytimg.com/vi/${ytId(d.id)}/hqdefault.jpg" alt="YouTube video" style="max-width:100%">`,
});

CMS.registerEditorComponent({
  id: 'product', label: 'Product box (Crawfords)',
  fields: [{ name: 'key', label: 'Product', widget: 'select', options: PRODUCT_OPTIONS }],
  pattern: /^\{\{product key="([^"]*)"\}\}$/,
  fromBlock: m => ({ key: m[1] }),
  toBlock: d => `{{product key="${d.key}"}}`,
  toPreview: d => `<div style="border:1px solid #075692;border-top:4px solid #075692;padding:12px;border-radius:10px">Buy at Crawfords: <strong>${(PRODUCT_OPTIONS.find(o => o.value === d.key) || {}).label || d.key}</strong></div>`,
});

CMS.registerEditorComponent({
  id: 'ad', label: 'AdSense slot',
  fields: [{ name: 'slot', label: 'Ad slot ID from AdSense (nothing shows without one)', widget: 'string', required: true }],
  pattern: /^\{\{ad slot="([^"]*)"\}\}$/,
  fromBlock: m => ({ slot: m[1] }),
  toBlock: d => `{{ad slot="${d.slot || ''}"}}`,
  toPreview: () => '<div style="border:1.5px dashed #999;padding:16px;text-align:center">AdSense</div>',
});
