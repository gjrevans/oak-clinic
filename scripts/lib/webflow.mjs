import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

export const CDN_HOST = 'cdn.prod.website-files.com';

const HOST_ALIASES = new Set([
  CDN_HOST,
  'uploads-ssl.webflow.com',
  'assets-global.website-files.com',
  'assets.website-files.com',
  'global-uploads.webflow.com',
  'daks2k3a4ib2z.cloudfront.net',
]);

const SIZE_SUFFIX = /-p-\d+(?:x\d+)?$/;
const ASSET_ID = /^([0-9a-f]{24})(?=_|$)/;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'",
  '#x27': "'",
  '#x2F': '/',
};

export function decodeEntities(value) {
  return String(value).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(ENTITIES, name)) return ENTITIES[name];
    if (name[0] === '#') {
      const code = name[1] === 'x' || name[1] === 'X'
        ? Number.parseInt(name.slice(2), 16)
        : Number.parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return match;
  });
}

export function normalizeImageUrl(raw) {
  if (raw === null || raw === undefined) return null;
  const trimmed = decodeEntities(String(raw)).trim();
  if (!trimmed || trimmed.startsWith('data:')) return null;
  let url;
  try {
    url = new URL(trimmed.startsWith('//') ? `https:${trimmed}` : trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  url.protocol = 'https:';
  url.search = '';
  url.hash = '';
  if (HOST_ALIASES.has(url.hostname)) url.hostname = CDN_HOST;
  const segments = decodeURIComponent(url.pathname).split('/');
  const file = segments.pop() ?? '';
  const dot = file.lastIndexOf('.');
  const stem = dot === -1 ? file : file.slice(0, dot);
  const extension = dot === -1 ? '' : file.slice(dot);
  segments.push(stem.replace(SIZE_SUFFIX, '') + extension);
  url.pathname = segments
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
    .join('/');
  return url.toString();
}

export function fileNameOf(url) {
  return decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
}

export function extensionOf(url) {
  const name = fileNameOf(url);
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

export function isImageUrl(url) {
  return IMAGE_EXTENSIONS.has(extensionOf(url));
}

export function isSvgUrl(url) {
  return extensionOf(url) === '.svg';
}

export function assetIdOf(url) {
  const name = fileNameOf(url);
  const dot = name.lastIndexOf('.');
  const stem = dot === -1 ? name : name.slice(0, dot);
  const match = ASSET_ID.exec(stem);
  if (match) return match[1];
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 24);
}

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function descriptiveName(url) {
  const name = fileNameOf(url);
  const dot = name.lastIndexOf('.');
  let stem = dot === -1 ? name : name.slice(0, dot);
  while (ASSET_ID.test(stem)) stem = stem.replace(/^[0-9a-f]{24}_?/, '');
  const slug = slugify(stem);
  return slug || assetIdOf(url);
}
