import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { ROOT } from './webflow.mjs';

export const CMS_DIR = path.join(ROOT, 'cms');

const COLLECTIONS = {
  services: 'Services',
  disciplines: 'Disciplines',
  people: 'People',
  articles: 'Articles',
};

export const RICH_TEXT_FIELDS = {
  services: ['Description', 'Section 1', 'Section 2', 'Section 3', 'Call To Action'],
  disciplines: ['Description', 'Page Content'],
  people: ['Description'],
  articles: ['Post Body'],
};

export const IMAGE_FIELDS = {
  services: ['Image', 'Hero Image', 'Section 1 Image', 'Section 2 Image', 'Section 3 Image'],
  disciplines: ['Icon', 'Hero Image'],
  people: ['Main Image', 'Thumbnail Image'],
  articles: ['Main Image', 'Thumbnail image'],
};

function locate(label) {
  const match = fs
    .readdirSync(CMS_DIR)
    .filter((name) => name.endsWith('.csv') && name.includes(` - ${label} - `))
    .sort();
  if (match.length === 0) throw new Error(`No ${label} CSV found in ${CMS_DIR}`);
  return path.join(CMS_DIR, match[0]);
}

export function readCms() {
  const result = {};
  for (const [key, label] of Object.entries(COLLECTIONS)) {
    const rows = parse(fs.readFileSync(locate(label), 'utf8'), { columns: true, bom: true });
    result[key] = {
      all: rows,
      live: rows.filter((row) => !bool(row.Archived) && !bool(row.Draft)),
    };
  }
  return result;
}

export function bool(value) {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

export function num(value, fallback = 999) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function text(value) {
  return String(value ?? '').trim();
}

export function relations(value) {
  return text(value)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
}
