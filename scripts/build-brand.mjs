// Brand assets that are derived rather than downloaded: the favicon set, the
// white wordmark used on dark grounds, and the default social-share card.
//
//   node scripts/build-brand.mjs
//
// Sources are crawl/logo.png (240x100 RGBA) and crawl/favicon.png (32x32).
// Idempotent: rerun it after either source changes.
import { mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

const LOGO_SRC = 'crawl/logo.png';
const FAVICON_SRC = 'crawl/favicon.png';
const DARK_SEA_GREEN = '#184126';

const OG = { width: 1200, height: 630 };
// The source raster is 240px wide, so anything past 480 is invented detail.
const OG_LOGO_WIDTH = 480;
const APPLE_TOUCH = 180;
const APPLE_LOGO_WIDTH = 140;

await mkdir('public/images', { recursive: true });

await copyFile(FAVICON_SRC, 'public/favicon.png');
await copyFile(LOGO_SRC, 'public/images/logo.png');

/** Repaint every pixel white while keeping the original alpha, so the wordmark
 *  reads on the footer and in dark mode without a runtime filter. */
const whiten = async (src) => {
  const { width, height } = await sharp(src).metadata();
  const alpha = await sharp(src).ensureAlpha().extractChannel('alpha').raw().toBuffer();
  return sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
};

const whiteLogo = await whiten(LOGO_SRC);
await sharp(whiteLogo).toFile('public/images/logo-white.png');

const centred = async (logo, width, ground, logoWidth) => {
  const height = ground.height ?? width;
  const plate = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: ground.colour,
    },
  });
  const scaled = await sharp(logo).resize({ width: logoWidth }).png().toBuffer();
  const meta = await sharp(scaled).metadata();
  return plate
    .composite([
      {
        input: scaled,
        left: Math.round((width - meta.width) / 2),
        top: Math.round((height - meta.height) / 2),
      },
    ])
    .png();
};

const og = await centred(
  whiteLogo,
  OG.width,
  { colour: DARK_SEA_GREEN, height: OG.height },
  OG_LOGO_WIDTH,
);
await og.toFile('public/images/og-default.png');

const apple = await centred(
  whiteLogo,
  APPLE_TOUCH,
  { colour: DARK_SEA_GREEN, height: APPLE_TOUCH },
  APPLE_LOGO_WIDTH,
);
await apple.toFile('public/apple-touch-icon.png');

for (const size of [192, 512]) {
  const icon = await centred(
    whiteLogo,
    size,
    { colour: DARK_SEA_GREEN, height: size },
    Math.round(size * 0.78),
  );
  await icon.toFile(`public/android-chrome-${size}x${size}.png`);
}

console.log(
  [
    'public/favicon.png',
    'public/apple-touch-icon.png',
    'public/android-chrome-192x192.png',
    'public/android-chrome-512x512.png',
    'public/images/logo.png',
    'public/images/logo-white.png',
    'public/images/og-default.png',
  ].join('\n'),
);
