import type { Person } from '@/data/types';

/**
 * Some CMS rows repeat the title in the summary field (Violet Andrus is
 * "OFFICE MANAGER" twice), which renders as a duplicated line. Anything that
 * only echoes the title is dropped.
 */
export function displaySummary(person: Person): string | undefined {
  const summary = person.summary?.trim();
  if (!summary) return undefined;
  return summary.toLowerCase() === person.title.trim().toLowerCase() ? undefined : summary;
}

/** The same person with a summary that never echoes the title. */
export function withDisplaySummary(person: Person): Person {
  return { ...person, summary: displaySummary(person) };
}
