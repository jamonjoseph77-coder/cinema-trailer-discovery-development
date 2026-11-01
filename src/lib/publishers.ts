import { comingSoonTitles } from '@/lib/catalogue';
import type { Title } from '@/lib/types';

export interface PublisherSummary {
  name: string;
  titles: Title[];
  upcoming: Title[];
  trailers: Title[];
}

export function publisherHref(name: string): string {
  return `/publishers/${encodeURIComponent(name)}`;
}

export function groupByPublisher(titles: Title[]): PublisherSummary[] {
  const groups = new Map<string, Title[]>();
  titles.forEach((title) => {
    const name = title.publisher.trim();
    if (!name) return;
    groups.set(name, [...(groups.get(name) ?? []), title]);
  });
  return [...groups.entries()]
    .map(([name, items]) => ({
      name,
      titles: items,
      upcoming: comingSoonTitles(items),
      trailers: items.filter((item) => item.trailer_url.trim() !== ''),
    }))
    .sort((a, b) => b.titles.length - a.titles.length || a.name.localeCompare(b.name));
}

export function findPublisher(titles: Title[], name: string): PublisherSummary | null {
  const key = name.trim().toLowerCase();
  return groupByPublisher(titles).find((publisher) => publisher.name.toLowerCase() === key) ?? null;
}
