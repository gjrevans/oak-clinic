const EMPTY_PARAGRAPH = /<p\b[^>]*>(?:\s|&nbsp;|&#160;|&#8205;| |​|‌|‍|﻿|<br\s*\/?>)*<\/p>/gi;
const SITE_LINK = /^https?:\/\/(?:www\.)?oakclinic\.ca(\/[^\s"]*)?$/i;

export function escapeAttribute(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function attribute(tag, name) {
  const match = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag);
  return match ? match[1] : '';
}

function stripTags(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '');
}

function imageTag(asset) {
  return (
    `<img src="${escapeAttribute(asset.src)}" alt="${escapeAttribute(asset.alt)}"` +
    ` width="${asset.width}" height="${asset.height}" loading="lazy">`
  );
}

function rewriteImage(tag, context) {
  const asset = context.resolve(attribute(tag, 'src'), stripTags(attribute(tag, 'alt')).trim() || context.alt);
  if (!asset) {
    context.warn(`unresolved image ${attribute(tag, 'src') || '(no src)'}`);
    return '';
  }
  return imageTag(asset);
}

function unwrapFigures(html) {
  return html.replace(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/gi, (match, attributes, inner) => {
    if (!/w-richtext-figure/i.test(attributes)) return match;
    const image = /<img\b[^>]*>/i.exec(inner);
    if (!image) return '';
    const rebuilt = image[0];
    const caption = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(inner);
    const captionHtml =
      caption && stripTags(caption[1]).trim() ? `<figcaption>${caption[1].trim()}</figcaption>` : '';
    return `<figure>${rebuilt}${captionHtml}</figure>`;
  });
}

function rewriteLinks(html) {
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    const href = attribute(tag, 'href');
    if (!href) return tag;
    let updated = tag;
    const site = SITE_LINK.exec(href);
    if (site) {
      const target = (site[1] || '/').replace(/\/$/, '') || '/';
      updated = updated.replace(/\shref\s*=\s*"[^"]*"/i, ` href="${escapeAttribute(target)}"`);
      updated = updated.replace(/\starget\s*=\s*"[^"]*"/gi, '').replace(/\srel\s*=\s*"[^"]*"/gi, '');
      return updated;
    }
    if (!/^https?:\/\//i.test(href)) return updated;
    updated = updated.replace(/\starget\s*=\s*"[^"]*"/gi, '').replace(/\srel\s*=\s*"[^"]*"/gi, '');
    return updated.replace(/\s*\/?>$/, ' target="_blank" rel="noopener">');
  });
}

export function cleanHtml(raw, options = {}) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  const context = {
    resolve: options.resolve ?? (() => null),
    alt: options.alt ?? '',
    warn: options.warn ?? (() => {}),
  };
  let html = value.replace(/<img\b[^>]*>/gi, (tag) => rewriteImage(tag, context));
  html = unwrapFigures(html);
  html = html.replace(/\sid\s*=\s*""/gi, '');
  html = html.replace(/\sclass\s*=\s*"[^"]*"/gi, '');
  html = rewriteLinks(html);
  html = html.replace(/&zwj;|&#8205;|&#x200d;/gi, '').replace(/[​‌‍﻿]/g, '');
  let previous;
  do {
    previous = html;
    html = html.replace(EMPTY_PARAGRAPH, '');
  } while (html !== previous);
  html = html.replace(/<div>\s*<\/div>/gi, '');
  html = html.replace(/<(table|thead|tbody|tfoot|tr|th|td)\b([^>]*)>/gi, (tag, name, attributes) =>
    `<${name}${attributes.replace(/\sstyle\s*=\s*"[^"]*"/gi, '')}>`,
  );
  html = html.replace(/(<h[1-6]\b[^>]*>)(?:\s|<br\s*\/?>)+/gi, '$1');
  html = html.replace(/(?:\s|<br\s*\/?>)+(<\/h[1-6]>)/gi, '$1');
  return html.trim();
}

export function ensureHtml(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || trimmed.includes('<')) return trimmed;
  return `<p>${trimmed}</p>`;
}
