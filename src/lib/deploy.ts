import { SITE } from '@/data/site';

export const PRODUCTION_HOST = new URL(SITE.url).host;

/**
 * Indexing is opt-in, and deliberately so.
 *
 * A deploy counts as production only when SITE_URL is explicitly set to the
 * production origin. Anything else, unset, a workers.dev URL, a dev subdomain,
 * a local build, is staging and gets noindex plus a Disallow-all robots.txt.
 *
 * The check is `process.env`, not `Astro.site`, because `site` falls back to
 * the production URL so that local builds still emit sensible canonicals.
 * Keying off that fallback would make a forgotten variable publish an
 * indexable staging site; keying off the explicit value means a forgotten
 * variable only costs us indexing on a site we can rebuild.
 */
export const isProduction = () => process.env.SITE_URL === SITE.url;
