import { SITE } from '@/data/site';
import type { Discipline, ImageAsset, Person, Service } from '@/data/types';

/**
 * Every node points back at the clinic through `@id` rather than repeating the
 * business details, so a crawler resolves one entity for the whole site.
 *
 * This module imports types only. The generated data modules import nothing
 * from here, and nothing here reads them, so `npm run import:cms` can rewrite
 * them without touching the schema layer.
 */
export const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

const abs = (path: string) => new URL(path, SITE.url).href;

/** Rich text fields arrive as HTML; schema values must be plain text. */
const text = (value: string | undefined) =>
  value
    ? value
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#39;|&rsquo;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
    : undefined;

const imageUrl = (image: ImageAsset | undefined) => (image ? abs(image.src) : undefined);

const postalAddress = () => ({
  '@type': 'PostalAddress',
  streetAddress: SITE.address.street,
  addressLocality: SITE.address.city,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postalCode,
  addressCountry: SITE.address.country,
});

const openingHours = () =>
  SITE.hours.map((entry) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${entry.day}`,
    opens: entry.open,
    closes: entry.close,
  }));

/**
 * MedicalClinic rather than Organization: one physical location, and the local
 * pack is the traffic that matters.
 */
export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  '@id': ORG_ID,
  name: SITE.name,
  legalName: SITE.footerName,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  image: abs('/images/og-default.png'),
  logo: abs('/images/logo.png'),
  medicalSpecialty: 'PrimaryCare',
  address: postalAddress(),
  geo: {
    '@type': 'GeoCoordinates',
    latitude: SITE.geo.latitude,
    longitude: SITE.geo.longitude,
  },
  openingHoursSpecification: openingHours(),
  hasMap: SITE.mapUrl,
  sameAs: [SITE.social.facebook, SITE.social.instagram],
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE.url,
  name: SITE.name,
  publisher: { '@id': ORG_ID },
});

export const breadcrumbSchema = (crumbs: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: crumb.name,
    item: abs(crumb.href),
  })),
});

export const collectionPageSchema = (name: string, description: string, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url: abs(path),
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
});

export const contactPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contact ${SITE.name}`,
  url: abs('/contact'),
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
});

/**
 * Naturopathic Doctors are `Physician`; massage therapists, acupuncturists and
 * clinic staff are plain `Person`, because Physician implies a licence to
 * practise medicine that those roles do not hold.
 */
export const personSchema = (person: Person) => ({
  '@context': 'https://schema.org',
  '@type': /naturopathic doctor/i.test(person.title) ? 'Physician' : 'Person',
  '@id': abs(`/people/${person.slug}#person`),
  name: person.name,
  jobTitle: person.title,
  description: text(person.summary ?? person.description),
  url: abs(`/people/${person.slug}`),
  image: imageUrl(person.mainImage ?? person.thumbnailImage),
  worksFor: { '@id': ORG_ID },
  ...(person.practitioner ? { medicalSpecialty: 'PrimaryCare' } : {}),
});

/**
 * `Service` rather than `MedicalProcedure`: these are bookable appointment
 * types, several of which (lab testing, prescription renewals) are not
 * procedures at all.
 */
export const serviceSchema = (service: Service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: text(service.metaDescription ?? service.description),
  url: abs(`/services/${service.slug}`),
  serviceType: service.name,
  provider: { '@id': ORG_ID },
  areaServed: { '@type': 'City', name: SITE.address.city },
  image: imageUrl(service.heroImage),
  ...(service.priceRange ? { offers: { '@type': 'Offer', priceCurrency: 'CAD', price: service.priceRange } } : {}),
});

export const disciplineSchema = (discipline: Discipline) => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: discipline.name,
  description: text(discipline.metaDescription ?? discipline.description),
  url: abs(`/disciplines/${discipline.slug}`),
  image: imageUrl(discipline.heroImage),
  about: { '@id': ORG_ID },
  isPartOf: { '@id': WEBSITE_ID },
});

interface ArticleInput {
  title: string;
  description?: string;
  slug: string;
  publishedOn: Date | string;
  image?: ImageAsset;
  author: Person;
}

export const articleSchema = ({
  title,
  description,
  slug,
  publishedOn,
  image,
  author,
}: ArticleInput) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description: text(description),
  url: abs(`/articles/${slug}`),
  mainEntityOfPage: abs(`/articles/${slug}`),
  datePublished: new Date(publishedOn).toISOString().slice(0, 10),
  image: imageUrl(image),
  author: {
    '@type': /naturopathic doctor/i.test(author.title) ? 'Physician' : 'Person',
    '@id': abs(`/people/${author.slug}#person`),
    name: author.name,
    url: abs(`/people/${author.slug}`),
  },
  publisher: { '@id': ORG_ID },
});
