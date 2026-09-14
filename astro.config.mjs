// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Overridden per environment (SITE_URL) so a staging deploy builds canonicals
  // and a sitemap for its own host instead of pointing at production.
  site: process.env.SITE_URL || 'https://oakclinic.ca',
  output: 'static',
  // Emit /contact.html rather than /contact/index.html so the canonical URL,
  // the sitemap entry and every internal link are the same string.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
