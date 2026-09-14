const SITE = 'https://cdn.prod.website-files.com/6234fcdf951f256d90a06e0d';

export const CRAWL_PAGES = [
  'index.html',
  'services.html',
  'team.html',
  'articles.html',
  'contact.html',
  'iv-therapy.html',
];

export const STATIC_IMAGES = [
  {
    key: 'home.hero',
    role: 'hero',
    out: 'images/heroes/home.webp',
    alt: 'The Oak Clinic team gathered at the front reception desk',
    url: `${SITE}/6a1a36e878c306601d3490ad_211016_Oak%20Clinic%202021_6060_websize.avif`,
  },
  {
    key: 'services.hero',
    role: 'hero',
    out: 'images/heroes/services.webp',
    alt: 'A patient booking an appointment on a tablet',
    url: `${SITE}/62392727881c5c797c575613_hero-services.jpg`,
  },
  {
    key: 'services.supplements',
    role: 'photo',
    out: 'images/pages/services-supplements.webp',
    alt: 'Shelves of professional supplements in the Oak Clinic dispensary',
    url: `${SITE}/6238dcbe4cbee829f2630466_supplements-078948c90505f61f0e93f42f71aa6b4485966fc8762c189187afdb954a04d85b.jpg`,
  },
  {
    key: 'services.herbalDispensary',
    role: 'photo',
    out: 'images/pages/services-herbal-dispensary.webp',
    alt: 'Dried herbs being measured into a bowl at the herbal dispensary',
    url: `${SITE}/6238de395c3bc1c64996feea_dispensary-5547d4bba2dfdba6ec56ba47f01bd2f90204fac1efc2f1d2760e3b555aa3982a.jpg`,
  },
  {
    key: 'team.hero',
    role: 'hero',
    out: 'images/heroes/team.webp',
    alt: 'The Oak Clinic team at the front reception desk',
    url: `${SITE}/623926d9efbba77ce7c3b5ba_hero-home.jpg`,
  },
  {
    key: 'articles.hero',
    role: 'hero',
    out: 'images/heroes/articles.webp',
    alt: 'A woman holding a head of freshly harvested lettuce',
    url: `${SITE}/6238db9905321637843fd480_holding-4818e2e2be4715de80d033067f72a81abdd0209919696e63d1cb291cee81a799.jpg`,
  },
  {
    key: 'contact.hero',
    role: 'hero',
    out: 'images/heroes/contact.webp',
    alt: 'Oak Clinic reception desk beside the open sign',
    url: `${SITE}/62392b5682d662c0318e5508_hero-contact.jpg`,
  },
  {
    key: 'ivTherapy.hero',
    role: 'hero',
    out: 'images/heroes/iv-therapy.webp',
    alt: 'Patients relaxing in recliners during IV therapy',
    url: `${SITE}/6239286380f792944f02375b_hero-iv-therapy.jpg`,
  },
  {
    key: 'ivTherapy.sections.0',
    role: 'photo',
    out: 'images/pages/iv-therapy-1.webp',
    alt: 'A practitioner adjusting an IV drip for a seated patient',
    url: `${SITE}/6238e36be77ea27e02824785_iv-therapy-1-9fbbceaa46211e39eb1dbe8abe5fa4ef39079a76ef7a97704d7c4acfdfa28681.jpg`,
  },
  {
    key: 'ivTherapy.sections.1',
    role: 'photo',
    out: 'images/pages/iv-therapy-2.webp',
    alt: 'A practitioner hanging an IV bag on a stand',
    url: `${SITE}/6238e36b112c4437af51d790_iv-therapy-3-8aa95159f72327bae0cab7541318342061c9160bbf1f59957bbb6f6e6d0953a8.jpg`,
  },
  {
    key: 'ivTherapy.sections.2',
    role: 'photo',
    out: 'images/pages/iv-therapy-3.webp',
    alt: 'Vials of vitamin B12 and B-complex injections on a tray',
    url: `${SITE}/6238e36b11591c9d702f852e_iv-therapy-2-bc5448dae1c96e23eab17ad3b4906d3bf9de27065e87d6ded6bb7edcd0a158fe.jpg`,
  },
  {
    key: 'partner.logo',
    role: 'photo',
    out: 'images/pages/framework-nutrition-logo.webp',
    alt: 'Framework Nutrition',
    url: `${SITE}/6a063c2d0fad169c3a539ad4_Framework%20Nutrition%20(5).png`,
  },
  {
    key: 'partner.photo',
    role: 'photo',
    out: 'images/pages/framework-nutrition.webp',
    alt: 'Framework Nutrition meal plan cards showing recipes and nutrition facts',
    url: `${SITE}/6a063b113a258e009194e751_framework.avif`,
  },
];

export const SKIPPED_STATIC_URLS = [
  `${SITE}/6236127c93da876b8b877eac_logo.png`,
];
