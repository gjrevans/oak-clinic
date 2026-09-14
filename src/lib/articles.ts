import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

const newestFirst = (a: Article, b: Article) =>
  b.data.publishedOn.getTime() - a.data.publishedOn.getTime();

/** Every live article, newest first. The collection is the only source. */
export async function getArticles(): Promise<Article[]> {
  const articles = await getCollection('articles');
  return articles.sort(newestFirst);
}

/** The home page shows three; the CSV flags more than that in some exports. */
export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const articles = await getArticles();
  return articles.filter((article) => article.data.featured).slice(0, limit);
}

export async function getArticlesByAuthor(slug: string): Promise<Article[]> {
  const articles = await getArticles();
  return articles.filter((article) => article.data.author === slug);
}

export async function getRecentArticles(limit: number, excludeSlug?: string): Promise<Article[]> {
  const articles = await getArticles();
  return articles.filter((article) => article.data.slug !== excludeSlug).slice(0, limit);
}

/** "June 22, 2026", the way the live site writes a post date. */
export function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
