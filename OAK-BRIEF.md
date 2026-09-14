# Oak Clinic: build brief

Clone of https://oakclinic.ca (Webflow) as a static Astro 7 + Tailwind 4 site,
deployed to Cloudflare Workers static assets. Modelled on `../dc-custom-wraps`
(the reference for every convention) which in turn follows
`../dc-custom-wraps/ASTRO-CLOUDFLARE-PLAYBOOK.md`.

Direction from Gordon (Sep 14, 2026): **a faithful clone, polished.** Same
pages, same URLs, same content and section order. Better typography, spacing,
imagery treatment, hover states, mobile nav and a proper dark mode. Do not
rewrite copy. Do not drop or merge pages. Do not invent sections.

## Source material (already in the repo)

| Path | What |
|---|---|
| `cms/*.csv` | Webflow CMS exports: Articles, Disciplines, People, Services. Rich text fields are HTML. The single source of truth for collection content. |
| `crawl/pages/**.html` | Every sitemap URL rendered, for static-page copy (home, services, team, articles, contact, iv-therapy) and for checking what each template renders. |
| `crawl/site.css` | The Webflow stylesheet, for exact colours and breakpoints. |
| `crawl/logo.png` | 240x100 RGBA logo (leaf mark + OAK CLINIC). Only raster available. |
| `crawl/favicon.png` | 32x32. |

Webflow serves original uploads at the CDN URL with any `-p-NNNxNNN` suffix
removed. Old items use `uploads-ssl.webflow.com`, new ones
`cdn.prod.website-files.com`; both resolve.

## Business facts (go in `src/data/site.ts`)

- Name: Oak Clinic. Footer wordmark reads "Oak Naturopathic Clinic".
- Tagline / h1: "Nurturing Health through Evidence-Based Medicine"
- Address: 829 103 Ave, Dawson Creek, BC V1G 2G2, Canada
- Phone 250-719-4900. Toll free 844-810-8862. Email hello@oakclinic.ca
- Hours: Monday to Friday, 9am to 5pm
- Booking: https://oakclinic.janeapp.com/ (per-item booking links live in the CSVs)
- Directions: the Google Maps URL in `crawl/pages/index.html` footer
- Reviews: https://g.page/r/CXxg1j9hAHIKEAI/review
- Facebook https://www.facebook.com/oakclinic, Instagram https://www.instagram.com/oakclinic
- Partner: Framework Nutrition (home page section; signup link `https://app.frameworknutrition.io/auth/signup?ref=OAK`, about link `https://frameworknutrition.io/about/`)
- Supplements: Fullscript `https://ca.fullscript.com/welcome/oakclinic` (services page)
- Site-wide announcement bar: "Important Reminder About Direct Billing and Insurance Coverage" linking to `/articles/important-reminder-about-direct-billing`. Make it a `SITE.announcement` object so it can be blanked.
- Meta description and OG copy: take from `crawl/pages/index.html` head.

## Brand and visual language

Fonts: **Nunito** (the live site uses 300 to 700 from Google Fonts). Use
`@fontsource/nunito` 300/400/500/600/700, self-hosted. One family for
everything. **Weights are light** (Gordon, Sep 14, 2026: 700/800 headings read
"childish"): every heading h1 to h3 is 400, h4 to h6 are 500, body 400,
buttons 500, tag pills 600. That matches the live CSS exactly.

Live palette (from `crawl/site.css`), to be mapped to semantic tokens:

| Webflow var | Value | Role |
|---|---|---|
| `--oak-green` | `#2f7d49` | primary: buttons, links, tag pills, active nav |
| `--dark-sea-green` | `#184126` | footer ground, dark hero gradient |
| `--dark-slate-grey` | `#2f637d` | announcement bar |
| `--soft-green` | `#d5e5db` | tint surfaces, icon plates |
| `--misty-rose` | `#f4d7cb` | rarely used warm accent |
| `--white-smoke` | `#f8f9fa` | alternate section ground |
| `--border-color` | `#e9ecef` | hairlines |
| `--text-dark` | `#333` | body |
| `--text-light` | `#868e96` | muted |

**Light is the default theme** (this is a daytime clinic, not DC's night shop).
Dark mode is a deep green-charcoal ground (`#0f1a14` style), lifted greens for
contrast, same structure. Follow the OS until the visitor chooses, persist to
`localStorage.theme`, `is:inline` head script first. Copy DC's
`ThemeToggle.astro` mechanics, not its neon layer. **No neon, no pink, no
uppercase condensed headings, no monospace labels.** Those are DC's identity.

Polish, concretely:

- Generous vertical rhythm: sections `py-16 md:py-24`, max-width `7xl`, `px-6`.
- Headings: Nunito 400, sentence case, on the live scale: h1 48px on 56px
  (32px on 40px on phones), section titles 24px, card titles 18px, body 16px
  on 26px. Do not go a step larger than the live site.
- Cards: `rounded-2xl`, hairline border, soft shadow on hover with a 2px lift,
  `bg-card`. Discipline icons on a `bg-soft-green` circular plate.
- Buttons: `rounded-full`, primary green with white text (7.0:1, fine), a
  secondary outline variant. Copy `components/ui/button.ts` from DC and swap
  the recipes.
- Heroes: keep the photo **and the white fade**. The live
  `.hero-image-overlay` is `linear-gradient(to top, white, white 75% at 50%,
  transparent)` with dark type, so the photo dissolves into the page. Ours
  fades to `--background` so dark mode dissolves into the dark ground instead.
  Content centred, `min-h-[30rem]`, image via `<img>` with `object-cover`.
  Never a dark-green wash (Gordon, Sep 14, 2026).
- Image framing: the live `.content-image-wrapper` crops content images with
  `border-radius: 8px 80px` (alternating small and large corners). This is
  part of Oak's identity (Gordon, Sep 14, 2026). Use the `oak-frame` utility
  on section photos, portraits and the article main image, `oak-frame-sm` on
  card portraits and thumbnails.
- Tag pills: `rounded-full bg-primary text-primary-foreground text-xs font-bold`.
- Reveal-on-scroll: DC's opacity-only `.reveal` is fine.
- Mobile nav: full-screen overlay, copy DC's Nav.astro pattern (overlay is a
  sibling of the sticky header).
- `prefers-reduced-motion` respected everywhere.
- Every image has real `alt`, `width`, `height`, `loading="lazy"` except hero.

## Routes (keep every URL exactly)

| Route | Type | Source |
|---|---|---|
| `/` | static | `pages/index.astro`, copy from `crawl/pages/index.html` |
| `/services` | static | `pages/services/index.astro` |
| `/services/<slug>` | 12 items | `pages/services/[slug].astro` + `layouts/ServiceLanding.astro` + `data/services.ts` |
| `/disciplines/<slug>` | 8 live | `pages/disciplines/[slug].astro` + `layouts/DisciplineLanding.astro` + `data/disciplines.ts` |
| `/team` | static | `pages/team.astro` + `data/people.ts` |
| `/people/<slug>` | 8 live | `pages/people/[slug].astro` + `layouts/PersonProfile.astro` |
| `/articles` | static | `pages/articles/index.astro` |
| `/articles/<slug>` | 28 live | `pages/articles/[slug].astro` + `layouts/ArticlePost.astro` + content collection `src/content/articles/*.md` |
| `/contact` | static | `pages/contact.astro` |
| `/iv-therapy` | static | `pages/iv-therapy.astro`, copy from `crawl/pages/iv-therapy.html`. Not in nav; keep the URL. |
| `/robots.txt` | endpoint | copy DC's `robots.txt.ts` |
| `/404` | static | |

Drop `/test` and `/style-guide` (Webflow leftovers). No redirects file is
needed; every URL is preserved.

## Data model

Read the CSVs with `csv-parse`. Skip rows where `Archived` or `Draft` is
`true`. Relations are semicolon-separated slug lists.

**Services** (`src/data/services.ts`, `interface Service`): name, slug,
metaTitle, metaDescription, description (HTML), initialAppointment (bool),
visibleInNavigation, visibleInServicesPage, bookableInServicesPage,
bookingText, bookingLink, priority (number, lower first), priceRange, image
(icon SVG), heroImage, sections: array of `{ title, html, image }` from
Section 1 to 3 (skip empty), callToAction (HTML).

**Disciplines** (`src/data/disciplines.ts`): name, slug, metaTitle,
metaDescription, description (HTML, short), icon (SVG), bookingLink, order,
visibleInNavigation, heroImage, pageContent (HTML, long), practitioners
(people slugs).

**People** (`src/data/people.ts`): name, slug, title, practitioner (bool),
showInNavigation, summary, description (HTML), quote, bookable, bookingText,
bookingLink, services (slugs), disciplines (slugs), order, mainImage,
thumbnailImage. Violet Andrus is staff (practitioner false, still live).

**Articles** (content collection, one `.md` per row, frontmatter: title, slug,
publishedOn (from `Published On`), summary, mainImage, thumbnail, featured,
author (people slug)). Convert `Post Body` HTML to markdown with `turndown`.
Images inside bodies are downloaded and rewritten to local paths. Validate with
`src/content.config.ts` (Astro 5+ content layer, `glob` loader).

Export helpers: `SERVICES_BY_PRIORITY`, `NAV_SERVICES` (visibleInNavigation),
`INITIAL_SERVICES`, `FOLLOW_UP_SERVICES`, `DISCIPLINES_BY_ORDER`,
`NAV_DISCIPLINES`, `PRACTITIONERS` (practitioner, by order), `STAFF`,
`FEATURED_PEOPLE` (showInNavigation), `getPerson(slug)`, `getService(slug)`,
`getDiscipline(slug)`.

## Image pipeline

`scripts/import-cms.mjs` writes the data files and article markdown.
`scripts/fetch-images.mjs` collects every image URL from the CSVs, the article
bodies and the static crawl pages, strips size suffixes, downloads originals
into `raw-images/` (gitignored), and writes optimized output with `sharp`:

- Heroes: 1920w webp, quality 80, `public/images/heroes/<slug>.webp`
- Section and card photos: 1200w webp, `public/images/<collection>/<slug>-<n>.webp`
- Portraits: 800w webp, `public/images/people/<slug>.webp`; avatars 160w
- Icons: SVGs copied verbatim to `public/images/icons/<name>.svg`
- Article body images: 1200w webp under `public/images/articles/<slug>/`
- Logo: `crawl/logo.png` copied to `public/images/logo.png`, displayed at
  120x50 CSS px (so the 240x100 raster is 2x). Also a white version for the
  footer and dark mode (invert the green via sharp, or tint).
- Favicon set from `crawl/favicon.png` plus an SVG if a clean leaf can be
  drawn; `og-default.png` 1200x630 built with sharp from a hero photo plus the logo.

Both scripts are re-runnable and idempotent. Record image dimensions in the
data files so components can set `width`/`height`.

## Page specs (section order is the live site's, verify against `crawl/pages`)

**Home**: announcement bar; hero (h1 only, photo); three cards: Our Mission,
Appointments (Book Now), Hours of Operation (table); Clinical Focus: intro
copy then an accordion list of `DISCIPLINES_BY_ORDER` (icon, name, description,
Book Now + Learn More); About Us copy with Book Now + Contact Us; Our
Practitioners: `FEATURED_PEOPLE` cards (portrait, name, title, summary, View
Profile, Book Now or the card-footer note for non-bookable); Framework
Nutrition partner section (logo, copy, two links, photo); Recent Articles:
the three `featured` articles.

**Services index**: hero; "Initial Appointments" grid of
`INITIAL_SERVICES` where visibleInServicesPage (icon, name, description, price
if the live page shows it, Book Now when bookableInServicesPage); "Follow Up
Appointments" grid; Professional Supplements section (photo, copy, Fullscript
link); Herbal Dispensary section (photo, copy); Ready to Book CTA band.

**Service page**: hero (heroImage, name, description, Book Now using
bookingText/bookingLink); up to three sections alternating image left/right;
callToAction; Ready to Book band. Breadcrumb schema.

**Discipline page**: hero (heroImage, name, description, Book Now);
pageContent as prose; "Practitioners Focusing In:" cards from `practitioners`.

**Team**: hero; practitioners as alternating full-width rows (portrait, name,
title, summary, View Profile, Book Now); a "Staff" section for non-practitioners.

**Person**: two-column header (mainImage, h1 name, title, pills for services
and disciplines linking to their pages, description prose, quote, Book Now);
"Recent Articles By" section listing that author's articles.

**Articles index**: hero; all live articles newest first, cards with author
avatar + name + date, thumbnail, title, summary.

**Article**: main image, h1, author avatar/name/date, body prose, "About the
Author" box (author summary + Book Now), Recent Articles (three latest others).
`BlogPosting` schema with author `Person`.

**Contact**: hero; Address (with Get Directions), Hours table, Contact
(phones, email). Add an embedded Google Map of the address under it (this is
the one addition allowed; DC has the pattern in `ContactSection.astro`).

**IV Therapy**: hero; How It Works (four steps); three photo sections; Ready
to Book band. Copy verbatim from the crawl.

**Nav**: logo; primary links Services, Team, Articles, Contact; Book Now
button; secondary row of `NAV_SERVICES`. **Footer**: Oak Naturopathic Clinic
with Home/Services/Articles/Contact; Services (all 12); Disciplines (all
live); Team Members (`FEATURED_PEOPLE`); Clinic Location + Get Directions;
Contact Us; Reviews (Add a Review); Social; Book Now.

## SEO and schema

`src/lib/schema.ts`: `organizationSchema` is a `MedicalClinic` (with
`medicalSpecialty`, address, geo, telephone, openingHoursSpecification,
sameAs). `personSchema` (`Physician` for NDs, `Person` otherwise, `worksFor`
the clinic). `serviceSchema` (`MedicalProcedure` or `Service`),
`articleSchema` (`BlogPosting`), `breadcrumbSchema`, `collectionPageSchema`,
`contactPageSchema`. Page titles come from the CSV `Meta Title` when present,
else `<Name> | Oak Clinic`. Descriptions from `Meta Description` or the summary.

## Deployment

Copy DC's `wrangler.jsonc` (name `oak-clinic`), `astro.config.mjs` minus the
redirects integration, `src/lib/deploy.ts`, `robots.txt.ts`, `public/_headers`,
`.nvmrc`. `site` is `https://oakclinic.ca`. Indexing is opt-in via
`SITE_URL === SITE.url` exactly as in DC.

## Definition of done

`npm run check` clean, `npm run build` clean, every route in the table
present in `dist/`, no external requests except Jane App links, Google Maps
embed and the partner links. `AGENTS.md` written in DC's style describing this
repo.

## Pending content changes (not to be published yet)

Gordon, Sep 14, 2026. The clinic is changing shape at the end of September
2026 and will need a coordinated content update at some point. Do not apply
any of this until Gordon says so.

- Mackenzie Vandergaag is the only massage therapist and leaves the clinic at
  the end of September 2026. Massage therapy, NST and the related follow-up
  services will need new copy or removal, and the stale "Megan is not taking
  on new clients" note on the massage service goes with them.
- Dr. Anouk Chaumont is remote only already. Dr. Elena Moore becomes remote
  only at the end of September 2026.
- Dr. Ayla Andrus will be the only in-person doctor.
- Open question: Ally Ratzke (acupuncturist) is hidden from the live team
  page; likely an oversight rather than a decision.
