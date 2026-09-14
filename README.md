# Oak Clinic

Static marketing site for [Oak Clinic](https://oakclinic.ca), a naturopathic
family clinic in Dawson Creek, BC.

Astro 7 · Tailwind CSS 4 · no client-side framework · deployed to Cloudflare
Workers (static assets).

It is a faithful clone of the clinic's Webflow site, rebuilt from the Webflow
CMS exports in `cms/` and a crawl of the live pages in `crawl/`. Every live URL
is preserved. Booking goes to Jane App; there is no contact form and no
backend.

## Getting started

Node comes from `.nvmrc` (22.19.0). Install through the
[Socket CLI](https://socket.dev), never bare npm, so every dependency gets a
supply-chain scan.

```bash
socket npm install
npm run dev
```

No env vars are needed for local dev. `SITE_URL` sets the canonical origin per
deploy and gates indexing.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server on http://localhost:4321 |
| `npm run check` | Typecheck `.astro` and `.ts` |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Serve `dist/` locally |

Content import, only when the CMS exports change:
`npm run fetch:images` then `npm run import:cms`. They rewrite
`src/data/{services,disciplines,people,static-images}.ts` and
`src/content/articles/`, so never hand-edit those.

## Deploying

Cloudflare Workers static assets, GitHub-connected through Workers Builds.
`wrangler.jsonc` serves `dist`; build command `npm run build`, deploy command
`npx wrangler deploy`.

Set `SITE_URL` on every deploy. A build is production (indexable, sitemap
advertised) only when `SITE_URL` is exactly `https://oakclinic.ca`; any other
value or an unset variable produces a noindex staging build with a
`Disallow: /` robots.txt (see `src/lib/deploy.ts`).

`workers.dev` and preview URLs are still enabled while there is no custom
domain. Turn them off in `wrangler.jsonc` once `oakclinic.ca` is attached.

See [AGENTS.md](AGENTS.md) for architecture, conventions, content quirks and
deployment detail, and [OAK-BRIEF.md](OAK-BRIEF.md) for the brief the site was
built from.
