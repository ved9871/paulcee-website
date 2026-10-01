// YAML front matter for Markdown content files (Sveltia `format: yaml-frontmatter`).
import YAML from 'yaml';

export function parseFrontMatter(text) {
  const m = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: String(text) };
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
}

export function stringifyFrontMatter(data, body) {
  return `---\n${YAML.stringify(data, { lineWidth: 0 })}---\n\n${String(body).trim()}\n`;
}
