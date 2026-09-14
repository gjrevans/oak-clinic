import type { APIRoute } from 'astro';
import { isProduction } from '@/lib/deploy';

/**
 * Production advertises the sitemap; every other deploy (workers.dev, dev
 * subdomain, local) refuses crawlers outright so staging never competes with
 * the live site.
 */
export const GET: APIRoute = ({ site }) => {
  const body = isProduction()
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
