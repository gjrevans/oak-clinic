interface Announcement {
  text: string;
  href: string;
}

export interface HoursEntry {
  day: string;
  /** 24 hour, so `openingHoursSpecification` can use it unchanged. */
  open: string;
  close: string;
}

export const SITE = {
  name: 'Oak Clinic',
  /** The footer wordmark, which spells the business out in full. */
  footerName: 'Oak Naturopathic Clinic',
  tagline: 'Nurturing Health through Evidence-Based Medicine',
  /** Home page <title>, minus the brand: what the clinic is plus where it is. */
  homeTitle: 'Naturopathic Clinic in Dawson Creek, BC',
  url: 'https://oakclinic.ca',
  description:
    'Oak Clinic is a general, Naturopathic, family clinic located in Dawson Creek, British Columbia. We offer a variety of products and services to provide you with effective treatments for your unique healthcare care needs. We currently offer Naturopathic Consultations, Massage Therapy, Neurostructural Integration Therapy (NST), Cancer Support, Lyme Support, IV Therapy, Pharmaceuticals, Acupuncture, and Lab Testing. Come visit us in-clinic to browse our wide selection of professional grade supplements, personalized botanical prescriptions and medicinal teas.',
  phone: '250-719-4900',
  phoneHref: 'tel:+12507194900',
  tollFree: '844-810-8862',
  tollFreeHref: 'tel:+18448108862',
  email: 'hello@oakclinic.ca',
  address: {
    street: '829 103 Ave',
    city: 'Dawson Creek',
    region: 'BC',
    regionName: 'British Columbia',
    postalCode: 'V1G 2G2',
    country: 'CA',
  },
  geo: { latitude: 55.756933, longitude: -120.225866 },
  mapUrl:
    'https://www.google.ca/maps/place/Dawson+Creek+Medical+Clinic/@55.7566557,-120.2259504,17z/data=!4m5!3m4!1s0x43ddd3a93966ee6b:0xecdc8c087748eb51!8m2!3d55.756933!4d-120.225866?hl=en',
  reviewUrl: 'https://g.page/r/CXxg1j9hAHIKEAI/review',
  /** Jane App. Per-service and per-practitioner links live in the data files. */
  bookingUrl: 'https://oakclinic.janeapp.com/',
  social: {
    facebook: 'https://www.facebook.com/oakclinic',
    instagram: 'https://www.instagram.com/oakclinic',
  },
  /** Framework Nutrition, the meal-planning partner featured on the home page. */
  partner: {
    name: 'Framework Nutrition',
    signupUrl: 'https://app.frameworknutrition.io/auth/signup?ref=OAK',
    aboutUrl: 'https://frameworknutrition.io/about/',
  },
  /** Professional supplement dispensary, linked from the services page. */
  fullscriptUrl: 'https://ca.fullscript.com/welcome/oakclinic',
  hours: [
    { day: 'Monday', open: '09:00', close: '17:00' },
    { day: 'Tuesday', open: '09:00', close: '17:00' },
    { day: 'Wednesday', open: '09:00', close: '17:00' },
    { day: 'Thursday', open: '09:00', close: '17:00' },
    { day: 'Friday', open: '09:00', close: '17:00' },
  ] as HoursEntry[],
  /** Set to null to take the bar down without touching a component. */
  announcement: {
    text: 'Important Reminder About Direct Billing and Insurance Coverage',
    href: '/articles/important-reminder-about-direct-billing',
  } as Announcement | null,
} as const;

export const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Team', href: '/team' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/contact' },
] as const;

export const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/contact' },
] as const;

export const addressLine = () =>
  `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}`;

const clockLabel = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? 'am' : 'pm';
  return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`;
};

/** The 24 hour pair as the clinic writes it on the page: "9am - 5pm". */
export const formatHours = (entry: HoursEntry) =>
  `${clockLabel(entry.open)} - ${clockLabel(entry.close)}`;
