import type { APIRoute } from 'astro';
import { getPerson } from '@/data/people';
import { getArticles } from '@/lib/articles';

/** Long enough for the body of every live article, short enough to stay a small download. */
const MAX_TEXT = 4000;

/**
 * Article bodies are markdown with raw Webflow HTML left in, so the index is
 * built from the words a reader would see: no tags, no link targets, no
 * markdown punctuation. Hyphens inside words survive, because "over-the-counter"
 * should still match "counter".
 */
function plainText(body: string): string {
  return body
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, ' ')
    .replace(/[*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, MAX_TEXT);
}

export const prerender = true;

export const GET: APIRoute = async () => {
  const articles = await getArticles();

  const index = articles.map((article) => ({
    slug: article.data.slug,
    title: article.data.title,
    summary: article.data.summary,
    author: getPerson(article.data.author)?.name ?? '',
    date: article.data.publishedOn.toISOString(),
    text: plainText(article.body ?? ''),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
