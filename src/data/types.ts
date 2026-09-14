/**
 * Shapes shared by the generated data modules (`scripts/import-cms.mjs`
 * writes services.ts, disciplines.ts and people.ts) and the components that
 * render them. Rich text fields hold sanitized HTML from the Webflow export
 * and are rendered with `set:html` inside a prose wrapper.
 */

export interface ImageAsset {
  /** Site-relative path under /public, e.g. /images/heroes/acupuncture.webp */
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface ContentSection {
  title: string;
  html: string;
  image?: ImageAsset;
}

export interface Service {
  name: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  /** Short HTML paragraph shown in the hero and on cards. */
  description: string;
  initialAppointment: boolean;
  visibleInNavigation: boolean;
  visibleInServicesPage: boolean;
  bookableInServicesPage: boolean;
  bookingText?: string;
  bookingLink?: string;
  /** Lower sorts first. */
  priority: number;
  priceRange?: string;
  icon?: ImageAsset;
  heroImage?: ImageAsset;
  sections: ContentSection[];
  /** HTML */
  callToAction?: string;
}

export interface Discipline {
  name: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  /** Short HTML, hero and accordion copy. */
  description: string;
  icon?: ImageAsset;
  bookingLink?: string;
  /** Lower sorts first. */
  order: number;
  visibleInNavigation: boolean;
  heroImage?: ImageAsset;
  /** Long HTML body. */
  pageContent: string;
  /** People slugs. */
  practitioners: string[];
}

export interface Person {
  name: string;
  slug: string;
  title: string;
  practitioner: boolean;
  showInNavigation: boolean;
  summary?: string;
  /** HTML */
  description?: string;
  quote?: string;
  bookable: boolean;
  bookingText?: string;
  bookingLink?: string;
  /** Service slugs. */
  services: string[];
  /** Discipline slugs. */
  disciplines: string[];
  /** Lower sorts first. */
  order: number;
  mainImage?: ImageAsset;
  /** Square-ish portrait for cards. */
  thumbnailImage?: ImageAsset;
  /** 160px square for bylines and author boxes. */
  avatar?: ImageAsset;
}
