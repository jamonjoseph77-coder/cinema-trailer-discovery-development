import type { Title, TitleType, WatchProgress } from '@/lib/types';
import { TITLE_TYPE_LABELS } from '@/lib/types';

export interface ResumeItem {
  title: Title;
  progress: WatchProgress;
}

export function resumeHref(item: ResumeItem): string {
  const { title, progress } = item;
  if (progress.content_id === title.id) return `/watch/${title.id}`;
  return `/watch/${title.id}?ep=${progress.content_id}`;
}

export function resumeItems(progress: WatchProgress[], titles: Title[]): ResumeItem[] {
  const byId = new Map(titles.map((title) => [title.id, title]));
  const seen = new Set<string>();
  const items: ResumeItem[] = [];
  progress.forEach((entry) => {
    if (entry.completed || entry.position_seconds < 5 || seen.has(entry.content_id)) return;
    const title = byId.get(entry.title_id);
    if (!title) return;
    seen.add(entry.content_id);
    items.push({ title, progress: entry });
  });
  return items;
}

export function progressRatioByTitle(progress: WatchProgress[]): Map<string, number> {
  const ratios = new Map<string, number>();
  progress.forEach((entry) => {
    if (ratios.has(entry.title_id) || entry.completed || entry.duration_seconds <= 0) return;
    ratios.set(entry.title_id, Math.min(1, entry.position_seconds / entry.duration_seconds));
  });
  return ratios;
}

export type SortOption = 'newest' | 'title' | 'year';

export const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  title: 'A to Z',
  year: 'Release year',
};

export function titlesOfType(titles: Title[], type: TitleType): Title[] {
  return titles.filter((title) => title.type === type);
}

export function featuredTitles(titles: Title[]): Title[] {
  return titles.filter((title) => title.is_featured);
}

export function isUpcoming(title: Title, now: Date = new Date()): boolean {
  return title.release_date !== null && new Date(title.release_date) > now;
}

export function comingSoonTitles(titles: Title[], now: Date = new Date()): Title[] {
  return titles
    .filter((title) => isUpcoming(title, now))
    .sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''));
}

export function genresOf(titles: Title[]): string[] {
  const genres = new Set<string>();
  titles.forEach((title) => {
    splitGenres(title.genre).forEach((genre) => genres.add(genre));
  });
  return [...genres].sort((a, b) => a.localeCompare(b));
}

function splitGenres(genre: string): string[] {
  return genre
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function hasGenre(title: Title, genre: string): boolean {
  return splitGenres(title.genre).includes(genre);
}

export function matchesQuery(title: Title, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [title.title, title.genre, title.synopsis, title.publisher]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export function sortTitles(titles: Title[], sort: SortOption): Title[] {
  const copy = [...titles];
  if (sort === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'year') return copy.sort((a, b) => (b.release_year ?? 0) - (a.release_year ?? 0));
  return copy;
}

export function relatedTitles(all: Title[], current: Title, limit = 12): Title[] {
  const currentGenres = splitGenres(current.genre);
  return all
    .filter(
      (candidate) =>
        candidate.id !== current.id &&
        (candidate.type === current.type || currentGenres.some((genre) => hasGenre(candidate, genre))),
    )
    .slice(0, limit);
}

export function titleHref(title: Title): string {
  if (title.type !== 'series' && title.playback_url) return `/watch/${title.id}`;
  return `/title/${title.id}`;
}

export function titleMeta(title: Title): string {
  const parts = [TITLE_TYPE_LABELS[title.type]];
  if (title.release_year) parts.push(String(title.release_year));
  const genre = splitGenres(title.genre)[0];
  if (genre) parts.push(genre);
  return parts.join(' · ');
}
