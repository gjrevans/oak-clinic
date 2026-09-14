import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const imageAsset = z.object({
  src: z.string(),
  width: z.number(),
  height: z.number(),
  alt: z.string(),
});

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    publishedOn: z.coerce.date(),
    summary: z.string(),
    mainImage: imageAsset.optional(),
    thumbnail: imageAsset.optional(),
    featured: z.boolean().default(false),
    author: z.string(),
  }),
});

export const collections = { articles };
