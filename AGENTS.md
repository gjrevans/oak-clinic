# AGENTS.md

Guidance for AI assistants and human contributors working on this repository.

## What this is

Marketing site for **Oak Clinic**, a naturopathic family clinic at 829 103 Ave,
Dawson Creek, BC. Static Astro site deployed to Cloudflare Workers static
assets, cloned from the clinic's Webflow site at https://oakclinic.ca.

It is a **faithful clone, polished** (Gordon, Sep 14, 2026): same pages, same
URLs, same copy, same section order, with better typography, spacing, imagery
treatment, hover states, mobile nav and a real dark mode. Do not rewrite copy,
do not drop or merge pages, do not invent sections.

Webflow's code export is behind a paid plan, so nothing was exported. The site
was rebuilt from two inputs that are committed here:

| Path | What |
|---|---|
| `cms/*.csv` | Webflow CMS exports: Articles, Disciplines, People, Services. Rich text fields are HTML. The single source of truth for collection content. |
| `crawl/pages/*.html` | Every sitemap URL rendered, for static-page copy and for checking what each template produced. |
| `crawl/site.css` | The Webflow stylesheet, for the original colours and breakpoints. |
| `crawl/logo.png`, `crawl/favicon.png` | 240x100 RGBA wordmark and 32x32 favicon, the only raster brand assets that exist. |
| `crawl/urls.txt` | The 64 live URLs at clone time. |

Neither folder is read at build time. Both are inputs to the import scripts
(see Content pipeline) and stay in the repo so the import can be rerun.

## Routes

62 of the 64 crawled URLs are preserved exactly. `/test` and `/style-guide`
were Webflow leftovers and were dropped; no redirects file is needed because
nothing else moved.

| Route | Count | Source |
|---|---|---|
| `/` | 1 | `src/pages/index.astro` |
| `/services` | 1 | `src/pages/services/index.astro` |
| `/services/<slug>` | 12 | `src/pages/services/[slug].astro` + `src/layouts/ServiceLanding.astro` + `src/data/services.ts` |
| `/disciplines/<slug>` | 8 | `src/pages/disciplines/[slug].astro` + `src/layouts/DisciplineLanding.astro` + `src/data/disciplines.ts` |
| `/team` | 1 | `src/pages/team.astro` + `src/data/people.ts` |
| `/people/<slug>` | 8 | `src/pages/people/[slug].astro` + `src/layouts/PersonProfile.astro` |
| `/articles` | 1 | `src/pages/articles/index.astro` |
| `/articles/<slug>` | 28 | `src/pages/articles/[slug].astro` + `src/layouts/ArticlePost.astro` + `src/content/articles/*.md` |
| `/articles/search.json` | 1 | `src/pages/articles/search.json.ts` (endpoint, the search index for `/articles`) |
| `/contact` | 1 | `src/pages/contact.astro` |
| `/iv-therapy` | 1 | `src/pages/iv-therapy.astro`. Not in the nav, but the URL is live and stays. |
| `/robots.txt` | 1 | `src/pages/robots.txt.ts` (endpoint, varies per environment) |
| `/404` | 1 | `src/pages/404.astro` |

`@astrojs/sitemap` emits `sitemap-index.xml` and `sitemap-0.xml`.

## Stack

- **Astro 7** (`output: 'static'`): every route prerenders to HTML
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **No UI framework.** No React, no client-side router.
  `src/components/ui/button.ts` is a plain `cva` class recipe, not a component;
  everything else is `.astro`. The interactive pieces (theme toggle, mobile
  nav, article search, reveal-on-scroll) are vanilla scripts.
- **Nunito** self-hosted through `@fontsource/nunito`. One family for
  everything; no Google Fonts request at runtime.
- **astro-seo** for head tags, **@astrojs/sitemap** for the sitemap
- **csv-parse**, **turndown** and **sharp** are dev-only, used by the import
  scripts and never bundled
- **Cloudflare Workers static assets** for hosting

There is **no form and no form backend** anywhere on the site. The Webflow
original had none either: booking goes to Jane App, everything else goes to the
phone or `hello@oakclinic.ca`. Do not add one.

## Conventions

### Dependencies

- **Pin exact versions, no carets.** `"astro": "7.2.8"`, not `"^7.2.8"`.
- **Install through Socket**, never bare npm: `socket npm install <pkg>`. Every
  dependency added to this repo goes through the supply-chain scan.
- Framework JS is a cost. Don't add a client-side router or a UI framework.

### Pages and components

- Pages live in `src/pages/`, one route per file. Collection routes render
  through a layout in `src/layouts/`; reusable pieces live in
  `src/components/`.
- `src/layouts/Base.astro` wraps every page: fonts, SEO tags, canonical, JSON-LD,
  the inline theme script, nav, footer and the reveal observer.
- Imports use the `@/` alias for `src/`. There are no exceptions in this repo.
- Site-wide business facts live in `src/data/site.ts` (`SITE`, `NAV`,
  `FOOTER_LINKS`, `addressLine()`, `formatHours()`). Never hardcode a phone
  number, address, booking URL or partner link in a component.
- `SITE.announcement` is an object or `null`, so the announcement bar comes
  down by editing data rather than a component.
- **`buttonVariants` concatenates, it does not tailwind-merge.** Passing a
  `className` that fights a variant's own colour leaves both classes on the
  element and the variant usually wins. Add a variant instead. Variants:
  `primary`, `secondary`, `ghost`, `inverse` (sizes `sm`, `md`, `lg`).
  `inverse` is for grounds that are dark in both themes (the footer, the
  announcement bar): it uses the footer token pair, so it stays light-on-dark
  whichever theme is active.

### Generated files: never hand-edit

`src/data/services.ts`, `src/data/disciplines.ts`, `src/data/people.ts`,
`src/data/static-images.ts` and every file in `src/content/articles/` are
written by `scripts/import-cms.mjs`. Each data module carries the banner:

```
// Generated by scripts/import-cms.mjs from the Webflow CSV exports in cms/.
// Do not hand-edit: run `npm run import:cms` instead.
```

A hand edit survives until the next import and then vanishes silently. To
change content, either change the CSV in `cms/` or change the importer, then
regenerate:

```bash
npm run fetch:images   # downloads and optimizes, rewrites scripts/image-manifest.json
npm run import:cms     # writes the data modules and the article markdown
```

Run them in that order. `import-cms.mjs` reads `scripts/image-manifest.json`
and warns for every image URL that is not in it, so an import against a stale
manifest quietly drops images.

Both scripts are idempotent. `fetch:images` caches originals in `raw-images/`
(gitignored) and skips any output file that already exists; `import:cms` writes
only when the content actually changed, and deletes article markdown whose CMS
row has gone.

**The one permitted hand edit** is in
`src/content/articles/naturopathic-care-from-anywhere-how-virtual-visits-work-at-oak-clinic.md`:
its Webflow `Post Body` opens with the article title repeated as a bold
paragraph, which renders as a duplicate line under the page's own `h1`. That
paragraph was deleted by hand. It is the only live article whose body starts
with its own title, which is why it was not worth a rule at the time. If the
import is rerun the line comes back, so **the fix is a rule in
`scripts/import-cms.mjs`**: before the turndown pass, drop a leading
`<p><strong>...</strong></p>` whose text matches the row's `Name`. Adding that
rule makes the hand edit unnecessary and makes the article safe to regenerate.

### Copy rules

- **No em dashes in copy we write** (house rule, matching DC). Use commas,
  colons or parentheses. Copy that came out of the Webflow CMS is the client's
  and is reproduced as-is.
- **Canadian spelling** in anything we write.
- Do not rewrite CMS copy in a component. If a sentence is wrong, it is wrong
  in the CSV.

### Visual language

Oak is a daytime clinic: calm, warm, green on white. **No neon, no pink, no
uppercase condensed headings, no monospace labels.** Those are DC Custom Wraps'
identity and both repos descend from the same starter, so they are easy to
reintroduce by accident.

Three things are load-bearing and have already been corrected once. Do not
regress them:

| | |
|---|---|
| **Type weights** | All headings are **Nunito 400**, with `h4` to `h6` at 500. Buttons are 500, tag pills 600. `@fontsource/nunito` imports 300/400/500/600/700. The site does not ship 800, and the old 700/800 heading weights are gone: Oak's headings are light and airy, not bold. |
| **`oak-frame`** | The `oak-frame` utility (`border-radius: 0.5rem 5rem`) and its `oak-frame-sm` variant reproduce the live site's `.content-image-wrapper` 8px/80px asymmetric corners on content images, portraits and thumbnails. This asymmetric corner is part of Oak's visual identity. Do not flatten it to a plain `rounded-lg` (0.5rem). |
| **Hero treatment** | `PageHero.astro` fades the photo into the page ground with a bottom-up `from-background` gradient and `text-foreground` type, matching the live `.hero-image-overlay`: a white fade in light mode, a dark ground in dark mode. It is **not** a dark-green wash with white type. |

The rest of the polish, for reference: sections `py-16 md:py-24`, `max-w-7xl`,
`px-6`; cards `rounded-lg` (0.5rem) with a hairline border and a soft hover lift;
buttons `rounded-full`; discipline icons on a soft-green circular plate; tag
pills `rounded-full`; every image carries real `alt`, `width`, `height` and
`loading="lazy"` except the hero, which is `fetchpriority="high"`.
`prefers-reduced-motion` is respected everywhere.

Sections fade in on scroll via `.reveal` plus `.reveal-delay-N` (opacity only,
no translate, disabled under reduced motion).

The mobile nav is a full-screen overlay that is a **sibling** of the sticky
header, never a child, so it can sit above the header's `z-50`. It scrolls its
own content and locks the page behind it.

### Styling and theming

- Tailwind utilities inline. Custom CSS lives in `src/styles/global.css`.
- **Never write a literal colour in a component.** Every colour is a semantic
  token declared twice in `global.css`, once on `:root` (light) and once on
  `.dark`, then exposed to Tailwind through `@theme inline`. Use
  `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`,
  `bg-surface`, `bg-surface-strong`, `bg-footer`, `bg-announcement` and so on.
  A hardcoded `bg-white` breaks dark mode silently.
- `.prose-oak` wraps every block of CMS HTML and article markdown, neither of
  which carries classes of its own. Article bodies include raw Webflow tables
  up to six columns wide, so `.prose-oak table` is `display: block` with
  `overflow-x: auto`: the table is its own scroll container and pans on a phone
  without a wrapper element or a script.

#### Palette

Light is the default ground. The Webflow palette maps to tokens, but two
values were **changed for contrast**, and the reasons are in the comments in
`global.css`:

| Token | Light | Dark | Why |
|---|---|---|---|
| `--primary` | `#2f7d49` | `#5cbf80` | Webflow's oak green is **5.06:1 on white**, so it carries small text and takes a white label on a filled button. On the dark ground it would fail, so dark lifts it to `#5cbf80` (**7.8:1**), which is also light enough that the filled button flips its *label* to dark rather than flipping its role. |
| `--muted-foreground` | `#5f6b63` | `#9fb0a6` | Webflow's `#868e96` only reaches **3.0:1** on white. This is the same grey pulled toward the green and down to **5.57:1**. |

Everything else maps straight across: `--footer` `#184126` (dark-sea-green),
`--announcement` `#2f637d` (dark-slate-grey), `--accent` `#d5e5db`
(soft-green), `--surface` `#f8f9fa`, `--border` `#e9ecef`. Dark mode is a deep
green-charcoal ground (`#0f1a14`) with the same structure, not a different
design.

#### Light is the default, and the OS gets a vote

An `is:inline` script at the top of `Base.astro`'s `<head>` runs before first
paint, so there is no flash. It applies `html.dark` only if `localStorage.theme`
says `dark`, or, **when nothing is stored**, if the OS prefers dark. Keep it
inline and keep it first.

`ThemeToggle.astro` flips the class and writes `localStorage.theme`. It also
listens to `prefers-color-scheme` changes and follows them **until** a
preference is stored, at which point the visitor's choice wins for good. This
is deliberately the opposite of DC, where the OS never gets a vote.

Toggling swaps every colour token at once, which would otherwise mean a
full-page repaint every frame for 200ms and a locked-up phone browser. The
toggle adds `html.theme-switching` for one frame (two `requestAnimationFrame`s
plus a 250ms safety timeout, because rAF stalls in background tabs) to suppress
every colour transition so the palette swaps in a single paint.

The wordmark ships twice, `logo.png` and `logo-white.png`, and CSS swaps which
one is painted rather than filtering at runtime.

### Astro whitespace

Astro trims whitespace at line boundaries, so `text\n<a>link</a>` renders as
`textlink`. Keep the space on the same line as the text (`text <a`), or use an
explicit `{' '}` expression.

### Structured data

`src/lib/schema.ts` is the only place JSON-LD is authored. `Base.astro` emits
`MedicalClinic` and `WebSite` on every page; individual pages pass extra nodes
through the `schema` prop. Every other node points back at the clinic with
`{ '@id': ORG_ID }` rather than repeating the business details, so a crawler
resolves one entity for the whole site.

| Builder | Emits | Notes |
|---|---|---|
| `organizationSchema()` | `MedicalClinic` | One physical location, so `MedicalClinic` rather than `Organization`. Carries address, geo, telephone, email, `medicalSpecialty`, `openingHoursSpecification` from `SITE.hours`, `hasMap` and `sameAs`. |
| `websiteSchema()` | `WebSite` | |
| `personSchema(person)` | `Physician` or `Person` | `Physician` only when the title matches "naturopathic doctor". Massage therapists, acupuncturists and clinic staff are plain `Person`, because `Physician` implies a licence they do not hold. `worksFor` the clinic. |
| `serviceSchema(service)` | `Service` | Not `MedicalProcedure`: these are bookable appointment types, several of which (lab testing, prescription renewals) are not procedures at all. Adds a CAD `Offer` when the row has a price range. |
| `disciplineSchema(discipline)` | `MedicalWebPage` | |
| `articleSchema(...)` | `BlogPosting` | Author node mirrors `personSchema`'s Physician/Person split. |
| `breadcrumbSchema(crumbs)` | `BreadcrumbList` | |
| `collectionPageSchema(...)` | `CollectionPage` | `/services`, `/team`, `/articles` |
| `contactPageSchema()` | `ContactPage` | |

Rich text fields arrive as HTML and schema values must be plain text, so the
module strips tags and entities before emitting a description.

`schema.ts` imports types only. The generated data modules import nothing from
it and it reads none of them, so `npm run import:cms` can rewrite them without
touching the schema layer.

Page titles come from the CSV `Meta Title` when present, else `<Name> | Oak
Clinic`. Descriptions come from `Meta Description` or the summary.

### Comments

No narrating comments. Use them only for non-obvious intent or constraints.

## Data model

Types live in `src/data/types.ts` (`ImageAsset`, `ContentSection`, `Service`,
`Discipline`, `Person`). Rich text fields hold sanitized HTML from the Webflow
export and are rendered with `set:html` inside a `.prose-oak` wrapper. Every
image is an `ImageAsset` with `src`, `width`, `height` and `alt`, so components
can always set dimensions and never cause layout shift.

Rows are skipped when `Archived` or `Draft` is `true`. Relations are
semicolon-separated slug lists.

Helper exports:

| Module | Export | What it is | Used by |
|---|---|---|---|
| `services.ts` | `SERVICES` | All 12, in CMS creation order | |
| | `SERVICES_BY_PRIORITY` | Sorted by `priority`, lower first | footer, `/services/<slug>` paths |
| | `NAV_SERVICES` | `visibleInNavigation` (4 of 12) | nav's secondary row |
| | `INITIAL_SERVICES` / `FOLLOW_UP_SERVICES` | Split on `initialAppointment` | `/services`, further filtered by `visibleInServicesPage` |
| | `getService(slug)` | | person pages |
| `disciplines.ts` | `DISCIPLINES` / `DISCIPLINES_BY_ORDER` | All 8, `order` ascending | home card grid, footer, `/disciplines/<slug>` paths |
| | `NAV_DISCIPLINES` | `visibleInNavigation` (7 of 8) | **no call sites**, see below |
| | `getDiscipline(slug)` | | person pages |
| `people.ts` | `PEOPLE` | All 8 live rows | |
| | `PRACTITIONERS` | `practitioner`, by order (7 of 8) | **no call sites**, see below |
| | `STAFF` | Not `practitioner` (Violet Andrus) | `/team` |
| | `FEATURED_PEOPLE` | `showInNavigation`, by order (4 of 8) | home, `/team`, footer |
| | `getPerson(slug)` | | discipline pages, article bylines |
| `static-images.ts` | `STATIC_IMAGES` | Typed tree of the photos on the hand-written pages | home, services, team, articles, contact, iv-therapy |

`NAV_DISCIPLINES` and `PRACTITIONERS` exist because the brief asked for them,
but nothing imports them: the pages that would have used them ended up wanting
`DISCIPLINES_BY_ORDER` and `FEATURED_PEOPLE` instead, to match the live site.
Leave them or delete them, but do not wire them in without checking what the
live site actually showed.

`src/lib/people.ts` carries `displaySummary()` and `withDisplaySummary()`: some
CMS rows repeat the title in the summary field (Violet Andrus is "OFFICE
MANAGER" twice), which renders as a duplicated line, so a summary that only
echoes the title is dropped.

### Articles

Articles are an Astro content collection, one `.md` per live CSV row, validated
by `src/content.config.ts` with the `glob` loader. Frontmatter: `title`, `slug`,
`publishedOn`, `summary`, `mainImage`, `thumbnail`, `featured`, `author` (a
people slug). `Post Body` HTML is converted with turndown; figures, images,
`target="_blank"` links and tables are kept as raw HTML rather than being
flattened to markdown.

`/articles` carries a local search box: a vanilla script filters the rendered
cards in place, matching every whitespace-separated term of at least two
characters as a substring of the card's title, summary, author or body text,
and mirrors the query into `?q=` with `history.replaceState`. Titles, summaries
and authors come from `data-` attributes already on the page, so filtering
starts on the first keystroke, while bodies come from `/articles/search.json`,
a prerendered index built at build time from the same content collection and
fetched once, lazily, on first input.

`src/lib/articles.ts` is the only reader: `getArticles()` (newest first by
`publishedOn`), `getFeaturedArticles(limit = 3)`, `getArticlesByAuthor(slug)`,
`getRecentArticles(limit, excludeSlug)` and `formatDate()` (en-CA, UTC, "June
22, 2026", which is how the live site writes a post date).

## Content pipeline

Two scripts, plus one that builds brand assets.

| Script | Command | Does |
|---|---|---|
| `scripts/fetch-images.mjs` | `npm run fetch:images` | Collects every image URL from the CSVs, the rich text bodies and the six crawled static pages; normalizes Webflow CDN URLs; downloads originals into `raw-images/` (gitignored, 4 at a time, 2 retries); encodes webp with sharp; writes `scripts/image-manifest.json` mapping source URL to `{src, width, height}`. |
| `scripts/import-cms.mjs` | `npm run import:cms` | Reads the CSVs and the manifest, writes the four data modules and the article markdown, warns about dangling relations, missing authors, unresolved images, articles with no `Published On`, and manifest entries pointing at files that are not on disk. |
| `scripts/build-brand.mjs` | `node scripts/build-brand.mjs` | Derives the favicon set, `logo-white.png` and `og-default.png` from `crawl/logo.png` and `crawl/favicon.png`. Rerun after either source changes. |

`scripts/lib/` holds the shared pieces: `cms.mjs` (CSV loading, the
live/archived split, `bool`/`num`/`text`/`relations`), `webflow.mjs` (CDN host
aliases, `-p-NNNxNNN` size-suffix stripping, asset ids, slugify),
`html.mjs` (rich text cleanup: rewrites `<img>` to local paths with real
dimensions, unwraps `w-richtext-figure` figures, strips Webflow classes and
zero-width joiners, drops empty paragraphs, turns `oakclinic.ca` absolute links
into site-relative ones, and adds `target="_blank" rel="noopener"` to genuinely
external links) and `static-page-images.mjs` (the hand-written list of photos
on the six static pages, each with a key, a role, an output path and a real
`alt`, because the crawl's own alt text was empty).

`scripts/image-manifest.json` is committed. It is the contract between the two
scripts: `fetch:images` writes it, `import:cms` reads it, and the optimized
output under `public/images/` is committed too, so a clean checkout builds
without network access.

### Image sizes

| Role | Width | Output |
|---|---|---|
| Hero | 1920 | `public/images/heroes/<slug>.webp` |
| Photo (service sections, article images, static-page photos) | 1200 | `public/images/services/<slug>-<n>.webp`, `public/images/articles/<slug>/{main,thumb,body-<n>}.webp`, `public/images/pages/<name>.webp` |
| Portrait | 800 | `public/images/people/<slug>.webp` and `<slug>-thumb.webp` |
| Avatar | 160 | `public/images/people/<slug>-avatar.webp`, hung off the thumbnail as a variant, used for bylines and author boxes |
| Icon (SVG) | as-is | copied verbatim to `public/images/icons/<name>.svg` |
| Icon (raster) | 512 | `public/images/icons/<name>.webp` |
| Crawl-only leftovers | 1200 | `public/images/misc/<assetId>.webp` |

All webp at quality 80, `withoutEnlargement`, auto-rotated. Encoding is skipped
when the output already exists, so deleting a file is how you force a re-encode.

## Third-party integrations

| | |
|---|---|
| **Jane App** | The clinic's booking system. `SITE.bookingUrl` is the clinic-wide link; per-service and per-practitioner `bookingLink` values come from the CSVs and point at specific staff members and treatment types. Every "Book Now" is an outbound link with `target="_blank" rel="noopener"`. There is nothing embedded and nothing to configure in this repo. |
| **Google Maps** | `/contact` embeds a map of the clinic address in an iframe, built from `SITE.name` plus `addressLine()` with `output=embed`, so it follows the address in `site.ts` rather than a pasted place id. This is the one addition to the Webflow original. The "Get Directions" button uses `SITE.mapUrl`, the Google Maps place URL from the Webflow footer. |
| **Framework Nutrition** | The clinic's meal-planning partner, a section on the home page. `SITE.partner.signupUrl` carries the `?ref=OAK` referral parameter; do not strip it. |
| **Fullscript** | `SITE.fullscriptUrl`, the professional supplement dispensary, linked once from the Professional Supplements section on `/services`. |
| **VRG Interactive** | "Site by VRG Interactive" credit in the footer. |

There is no analytics, no tag manager, no chat widget and no font CDN. The only
outbound hosts in the built HTML are Jane App, Google Maps, Google (the review
link and the directions link), Facebook, Instagram, Framework Nutrition,
Fullscript, VRG Interactive, and whatever the client linked inside article
copy (CCHPBC, HealthLink BC, gov.bc.ca and similar).

## Content quirks inherited from Webflow

These look like bugs. They are the live site, reproduced deliberately. Do not
"fix" them without asking Gordon.

- **`/services/cupping` is an empty page.** The CMS row has a name and a slug
  and nothing else: no description, no sections, no image, no booking link,
  `priority` 999, and every visibility flag false. So it is absent from the
  nav, absent from the services index and absent from the footer, but the URL
  was live on Webflow and is live here, because Ally Ratzke's profile links to
  it. `ServiceLanding.astro` renders it as a bare hero.
- **Three practitioners are hidden from `/team`.** Ally Ratzke (Registered
  Acupuncturist), Emma Sloane and Megan Piccinin (both Certified Massage
  Professionals) have `Show in Navigation` false in the CMS, so `/team` shows
  only `FEATURED_PEOPLE`: Dr. Ayla Andrus, Dr. Elena Moore, Dr. Anouk Chaumont
  and Mackenzie Vandergaag. Their `/people/<slug>` pages still build, are still
  indexable and are still linked from the discipline pages they are attached
  to, exactly as on Webflow. Gordon's note (below) says Ally being hidden is
  likely an oversight rather than a decision, so this may change.
- **Emma Sloane's slug is `emma-carpenter`.** She was renamed in the CMS and
  the slug was left alone, so the live URL is `/people/emma-carpenter`. Keep it:
  changing the slug breaks an indexed URL.
- **The stale "Megan is not taking on new clients" note.** It is the
  `Booking Text` on **two** services, `massage-therapy` and
  `neurostructural-integration-therapy`, and the NST description names Megan
  as the provider. Megan Piccinin is hidden from the team page. The note is
  reproduced because it is what the live site says; it is on the pending
  change list below.
- **Archived rows are dropped, and the references to them go with them.**
  The `cancer-support` discipline is archived in the CMS but Ally Ratzke and
  Dr. Anouk Chaumont still list it, and Ally still lists `cupping`. Rather than
  linking into a 404, `PersonProfile.astro` resolves each relation through
  `getService` / `getDiscipline` and **drops the pill on a miss**. The importer
  warns about each dangling reference so they stay visible. Also archived and
  therefore absent: the people `abby-spenst`, `megan-graw` and `natalia-dupuis`,
  and the article `prenatal-massages-with-megan`.
- **Articles order by `publishedOn`, not `Created On`.** The two disagree
  badly: 22 of the 28 live articles have a gap of a day or more, and one is off
  by 975 days (`pros-of-proper-posture` was created in March 2023 and published
  in November 2025). Webflow orders by publish date, so we do too.
  `import-cms.mjs` falls back to `Created On` only when `Published On` is empty,
  and warns when it has to. Note that the **collections** (services,
  disciplines, people) are read in `Created On` order instead, because that is
  their stable source order; their display order comes from `priority` /
  `order` anyway.
- **Three articles are flagged `Featured?`** in this export, which is exactly
  what the home page wants. `getFeaturedArticles` still caps at three, because
  the flag is editorial and the client can tick a fourth at any time.

## Pending content changes (do not publish)

**Gordon, Sep 14, 2026. None of this is applied, and none of it is to be
applied until Gordon says so.** The clinic changes shape at the end of
September 2026 and will need a coordinated content update at some point. This
section is a record of what is coming, not a task list.

- Mackenzie Vandergaag is the only massage therapist and leaves the clinic at
  the end of September 2026. Massage therapy, NST and the related follow-up
  services will need new copy or removal, and the stale "Megan is not taking on
  new clients" note on the massage service goes with them.
- Dr. Anouk Chaumont is remote only already. Dr. Elena Moore becomes remote
  only at the end of September 2026.
- Dr. Ayla Andrus will be the only in-person doctor.
- Open question: Ally Ratzke (acupuncturist) is hidden from the live team page;
  likely an oversight rather than a decision.

## Local development

```bash
socket npm install
npm run dev        # http://localhost:4321
npm run check      # astro check: typecheck .astro and .ts
npm run build      # produces dist/
npm run preview    # serves dist/ locally
```

No env vars are required locally. `SITE_URL` is the only variable the site
reads, and a local build without it is correctly treated as staging.

Node comes from `.nvmrc` (22.19.0).

## Deployment

Cloudflare **Workers static assets**. `wrangler.jsonc` is the deploy config:
no Worker script, it serves `dist/` with `html_handling: auto-trailing-slash`
(so `contact.html` answers at `/contact`, matching the canonicals) and
`not_found_handling: 404-page`. `public/_headers` sets a one-year immutable
cache on `/_astro/*` only, because Astro content-hashes those and everything
else (HTML, images) is replaced under the same name. Wrangler is a pinned dev
dependency; `npx wrangler deploy` after a local
`SITE_URL=https://oakclinic.ca npm run build` is the manual deploy.

Workers Builds settings, to mirror DC's:

- Build command `npm run build`, deploy command `npx wrangler deploy`, root `/`
- Node comes from `.nvmrc` (22.19.0); the build image reads it
- Build variable `SITE_URL` = `https://oakclinic.ca` (build-time, not a runtime
  binding; the top-level Variables and Secrets panel is the wrong place)
- The Worker belongs in the Cloudflare account that holds the `oakclinic.ca`
  zone: a custom domain can only be attached from that account. Attaching a
  domain fails while any other DNS record exists for the hostname, so delete
  the old record first and the Worker creates its own.

| Env var | Where | Purpose |
|---|---|---|
| `SITE_URL` | Build variable on the Worker | Deploy origin, and the production opt-in |

### Indexing is opt-in

`SITE_URL` overrides `site` in `astro.config.mjs` and is the single switch that
decides indexing, via `src/lib/deploy.ts`. A build is production **only** when
`SITE_URL` is set *exactly* to `https://oakclinic.ca`. Every other value, a
`workers.dev` URL, a preview URL, a dev subdomain, or the variable being unset,
is staging: `noindex, nofollow` on every page plus a `Disallow: /` robots.txt.

| Deploy | `SITE_URL` | Result |
|---|---|---|
| Preview or dev host | anything else | noindex, self-canonical |
| Production | `https://oakclinic.ca` | indexable, sitemap advertised |
| Unset | | noindex; canonicals fall back to the production origin |

This is deliberately the fail-safe direction. A staging deploy serves the same
copy as the live site, so an indexable one would compete with it in search.
Forgetting the variable costs indexing on a site that rebuilds in seconds; the
inverse mistake puts staging in Google.

The check is `process.env.SITE_URL`, not `Astro.site`, because `site` falls
back to the production URL so local builds still emit sensible canonicals.
Because env vars inline at build time, adding or changing `SITE_URL` later
needs a rebuild (an empty commit works), not just a save.

`robots.txt` is an endpoint (`src/pages/robots.txt.ts`), not a static file in
`public/`, so it can vary per environment. Don't move it back. Note that
`Disallow: /` stops crawling, which also stops Google reading the `noindex`:
belt and braces for a URL nobody links to, but not a hard seal. For a staging
host that must not leak, put Cloudflare Access in front of it.

`astro.config.mjs` sets `trailingSlash: 'never'` with `build.format: 'file'`,
so pages emit as `contact.html` and serve at `/contact`. `Base.astro`
normalizes the canonical to match. Verify deploys with a cache-buster
(`?cb=$RANDOM`) and curl **without** `-L`; a 307 on the clean URL itself means
the URL-shape config drifted.

### Differs from DC: workers.dev is still on

DC's `wrangler.jsonc` carries `"workers_dev": false` and `"preview_urls":
false`. **This repo's does not**, so the Worker is currently reachable at its
`workers.dev` hostname and at per-deploy preview URLs. That is intentional
while the site has no custom domain: it is how anyone reviews it. Those hosts
are noindex and `Disallow: /` because `SITE_URL` will not match, so nothing
leaks into search.

**Turn both off once `oakclinic.ca` is attached to the Worker.** Add them to
`wrangler.jsonc`, not the dashboard: flipping the dashboard toggle alone is
undone by the next deploy.

## Verified

Checked on the completed build, Sep 14, 2026:

- `npm run check` clean: no errors, warnings or hints
- `npm run build` clean, 63 HTML pages in `dist/`
- All 62 live URLs from `crawl/urls.txt` present (the 64 crawled minus `/test`
  and `/style-guide`), plus `/404`. `robots.txt`, `sitemap-index.xml` and
  `sitemap-0.xml` emitted
- Mobile layout checked at phone width: nav overlay, cards, hero, the wide
  article tables
- Light and dark mode checked on every page type, including the theme toggle,
  the OS-follow behaviour and the no-flash inline script
- Browser console clean, no 404s on assets
