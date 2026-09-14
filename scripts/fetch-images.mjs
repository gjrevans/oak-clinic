import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { IMAGE_FIELDS, RICH_TEXT_FIELDS, readCms, text } from './lib/cms.mjs';
import { CRAWL_PAGES, SKIPPED_STATIC_URLS, STATIC_IMAGES } from './lib/static-page-images.mjs';
import {
  ROOT,
  assetIdOf,
  descriptiveName,
  extensionOf,
  isImageUrl,
  isSvgUrl,
  normalizeImageUrl,
} from './lib/webflow.mjs';

const RAW_DIR = path.join(ROOT, 'raw-images');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MANIFEST = path.join(ROOT, 'scripts', 'image-manifest.json');
const CRAWL_DIR = path.join(ROOT, 'crawl', 'pages');

const WIDTHS = { hero: 1920, photo: 1200, portrait: 800, avatar: 160, icon: 512 };
const QUALITY = 80;
const CONCURRENCY = 4;
const RETRIES = 2;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const plan = new Map();
const iconNames = new Map();
const skipped = new Set(SKIPPED_STATIC_URLS.map((url) => assetIdOf(normalizeImageUrl(url))));

function known(url) {
  return plan.has(assetIdOf(url));
}

function add(rawUrl, entry) {
  const url = normalizeImageUrl(rawUrl);
  if (!url || !isImageUrl(url)) return null;
  const id = assetIdOf(url);
  if (skipped.has(id)) return null;
  const existing = plan.get(id);
  if (existing) {
    existing.urls.add(url);
    if (entry.variants) existing.variants = { ...existing.variants, ...entry.variants };
    return existing;
  }
  const created = { id, url, urls: new Set([url]), ...entry };
  plan.set(id, created);
  return created;
}

function iconOut(url) {
  const base = descriptiveName(url);
  const id = assetIdOf(url);
  const taken = iconNames.get(base);
  if (taken && taken !== id) return `images/icons/${base}-${id.slice(0, 8)}.svg`;
  iconNames.set(base, id);
  return `images/icons/${base}.svg`;
}

function addIcon(rawUrl) {
  const url = normalizeImageUrl(rawUrl);
  if (!url || !isImageUrl(url)) return;
  if (isSvgUrl(url)) add(url, { role: 'icon', out: iconOut(url), copy: true });
  else add(url, { role: 'icon', out: `images/icons/${descriptiveName(url)}.webp`, width: WIDTHS.icon });
}

function htmlImageUrls(html) {
  const found = [];
  for (const tag of String(html ?? '').matchAll(/<img\b[^>]*>/gi)) {
    const src = /\ssrc\s*=\s*"([^"]*)"/i.exec(tag[0]);
    if (src) found.push(src[1]);
    const srcset = /\ssrcset\s*=\s*"([^"]*)"/i.exec(tag[0]);
    if (srcset) {
      for (const candidate of srcset[1].split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        if (value) found.push(value);
      }
    }
  }
  return found;
}

function buildPlan(cms) {
  for (const row of cms.services.live) addIcon(row.Image);
  for (const row of cms.disciplines.live) addIcon(row.Icon);

  for (const row of cms.people.live) {
    const slug = text(row.Slug);
    add(row['Main Image'], { role: 'portrait', out: `images/people/${slug}.webp`, width: WIDTHS.portrait });
    add(row['Thumbnail Image'], {
      role: 'portrait',
      out: `images/people/${slug}-thumb.webp`,
      width: WIDTHS.portrait,
      variants: { avatar: { out: `images/people/${slug}-avatar.webp`, width: WIDTHS.avatar } },
    });
  }

  for (const image of STATIC_IMAGES) {
    add(image.url, { role: image.role, out: image.out, width: WIDTHS[image.role] });
  }

  for (const row of cms.services.live) {
    const slug = text(row.Slug);
    add(row['Hero Image'], { role: 'hero', out: `images/heroes/${slug}.webp`, width: WIDTHS.hero });
  }
  for (const row of cms.disciplines.live) {
    const slug = text(row.Slug);
    add(row['Hero Image'], { role: 'hero', out: `images/heroes/${slug}.webp`, width: WIDTHS.hero });
  }

  for (const row of cms.services.live) {
    const slug = text(row.Slug);
    for (const index of [1, 2, 3]) {
      add(row[`Section ${index} Image`], {
        role: 'photo',
        out: `images/services/${slug}-${index}.webp`,
        width: WIDTHS.photo,
      });
    }
  }

  for (const row of cms.articles.live) {
    const slug = text(row.Slug);
    add(row['Main Image'], { role: 'photo', out: `images/articles/${slug}/main.webp`, width: WIDTHS.photo });
    add(row['Thumbnail image'], { role: 'photo', out: `images/articles/${slug}/thumb.webp`, width: WIDTHS.photo });
  }

  for (const [collection, fields] of Object.entries(RICH_TEXT_FIELDS)) {
    for (const row of cms[collection].live) {
      const slug = text(row.Slug);
      const directory = collection === 'articles' ? `images/articles/${slug}` : `images/${collection}`;
      const prefix = collection === 'articles' ? 'body' : `${slug}-body`;
      let index = 0;
      for (const field of fields) {
        for (const raw of htmlImageUrls(row[field])) {
          const url = normalizeImageUrl(raw);
          if (!url || !isImageUrl(url)) continue;
          if (isSvgUrl(url)) {
            addIcon(url);
            continue;
          }
          if (known(url)) {
            add(url, {});
            continue;
          }
          index += 1;
          add(url, { role: 'photo', out: `${directory}/${prefix}-${index}.webp`, width: WIDTHS.photo });
        }
      }
    }
  }
}

async function addCrawlPageImages() {
  for (const page of CRAWL_PAGES) {
    const file = path.join(CRAWL_DIR, page);
    if (!existsSync(file)) continue;
    const html = await fs.readFile(file, 'utf8');
    for (const raw of htmlImageUrls(html)) {
      const url = normalizeImageUrl(raw);
      if (!url || !isImageUrl(url)) continue;
      if (known(url) || skipped.has(assetIdOf(url))) {
        add(url, {});
        continue;
      }
      if (isSvgUrl(url)) {
        addIcon(url);
        continue;
      }
      add(url, { role: 'photo', out: `images/misc/${assetIdOf(url)}.webp`, width: WIDTHS.photo });
    }
  }
}

async function mapLimit(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (;;) {
      const item = queue.shift();
      if (item === undefined) return;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function download(entry, stats) {
  const extension = extensionOf(entry.url) || '.bin';
  entry.raw = path.join(RAW_DIR, `${assetIdOf(entry.url)}${extension}`);
  if (existsSync(entry.raw)) {
    stats.cached += 1;
    return;
  }
  let lastError;
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(entry.url, {
        headers: { 'user-agent': USER_AGENT, accept: 'image/*,*/*;q=0.8' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = Buffer.from(await response.arrayBuffer());
      if (body.length === 0) throw new Error('empty body');
      await fs.writeFile(entry.raw, body);
      stats.downloaded += 1;
      return;
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  entry.error = String(lastError?.message ?? lastError);
  stats.failed.push(`${entry.url} (${entry.error})`);
}

async function encode(entry, target, stats) {
  const destination = path.join(PUBLIC_DIR, target.out);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  if (!existsSync(destination)) {
    if (entry.copy) {
      await fs.copyFile(entry.raw, destination);
    } else {
      await sharp(entry.raw)
        .rotate()
        .resize({ width: target.width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(destination);
    }
    stats.encoded += 1;
  } else {
    stats.reused += 1;
  }
  const metadata = await sharp(destination).metadata();
  return {
    src: `/${target.out}`,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

async function main() {
  const cms = readCms();
  buildPlan(cms);
  await addCrawlPageImages();
  await fs.mkdir(RAW_DIR, { recursive: true });

  const entries = [...plan.values()];
  const stats = { downloaded: 0, cached: 0, encoded: 0, reused: 0, failed: [] };
  await mapLimit(entries, CONCURRENCY, (entry) => download(entry, stats));

  const manifest = {};
  for (const entry of entries) {
    if (entry.error) continue;
    try {
      const value = await encode(entry, entry, stats);
      for (const [name, variant] of Object.entries(entry.variants ?? {})) {
        value[name] = await encode(entry, variant, stats);
      }
      for (const url of entry.urls) manifest[url] = value;
    } catch (error) {
      stats.failed.push(`${entry.url} (encode: ${String(error?.message ?? error)})`);
    }
  }

  const ordered = {};
  for (const key of Object.keys(manifest).sort()) ordered[key] = manifest[key];
  await fs.writeFile(MANIFEST, `${JSON.stringify(ordered, null, 2)}\n`);

  console.log(
    `images: ${entries.length} sources, ${stats.downloaded} downloaded, ${stats.cached} cached, ` +
      `${stats.encoded} written, ${stats.reused} already optimized`,
  );
  if (stats.failed.length > 0) {
    console.log(`failed (${stats.failed.length}):`);
    for (const failure of stats.failed) console.log(`  ${failure}`);
  }
}

await main();
