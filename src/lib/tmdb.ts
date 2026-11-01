import { callTmdbServer } from '@/lib/tmdb.functions';
import { parseTrailers, type Trailer } from '@/lib/trailers';

export type TmdbMediaType = 'movie' | 'tv';
export type TmdbListKind = 'popular' | 'trending';
export type TmdbErrorReason = 'not_configured' | 'unavailable';
export type TmdbImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'w1280';

export class TmdbError extends Error {
  readonly reason: TmdbErrorReason;

  constructor(reason: TmdbErrorReason, message: string) {
    super(message);
    this.name = 'TmdbError';
    this.reason = reason;
  }
}

export interface TmdbItem {
  id: number;
  mediaType: TmdbMediaType;
  title: string;
  overview: string;
  releaseDate: string | null;
  rating: number | null;
  posterPath: string | null;
  backdropPath: string | null;
}

export interface TmdbDetail extends TmdbItem {
  genres: string[];
  runtimeMinutes: number | null;
  seasons: number | null;
  episodes: number | null;
  tagline: string;
  status: string;
  trailers: Trailer[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

type TmdbRecord = Record<string, unknown>;

const IMAGE_BASE = 'https://image.tmdb.org/t/p/';
const IMAGE_PATH = /^\/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)$/i;

export function tmdbHref(item: TmdbItem): string {
  return `/tmdb/${item.mediaType}/${item.id}`;
}

export function tmdbYear(item: TmdbItem): string {
  return item.releaseDate ? item.releaseDate.slice(0, 4) : '';
}

export function formatReleaseLabel(item: TmdbItem, today = new Date()): string {
  if (!item.releaseDate) return '';
  const date = new Date(`${item.releaseDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const formatted = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return date > today ? `Coming ${formatted}` : formatted;
}

export function tmdbImageUrl(path: string | null, size: TmdbImageSize): string {
  return path && IMAGE_PATH.test(path) ? `${IMAGE_BASE}${size}${path}` : '';
}

function isRecord(value: unknown): value is TmdbRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: unknown): number | null {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : null;
}

async function callTmdb(body: Record<string, unknown>): Promise<unknown> {
  let result;
  try {
    result = await callTmdbServer({ data: body });
  } catch {
    throw new TmdbError('unavailable', 'The catalogue could not be reached.');
  }
  if (!result.ok) throw new TmdbError(result.reason, result.message);
  return JSON.parse(result.json) as unknown;
}

function toItem(raw: unknown, mediaType: TmdbMediaType): TmdbItem | null {
  if (!isRecord(raw)) return null;
  const id = finiteNumber(raw.id);
  const title = text(mediaType === 'movie' ? raw.title : raw.name);
  if (id === null || !title) return null;
  return {
    id,
    mediaType,
    title,
    overview: text(raw.overview),
    releaseDate: text(mediaType === 'movie' ? raw.release_date : raw.first_air_date) || null,
    rating: positiveNumber(raw.vote_average),
    posterPath: text(raw.poster_path) || null,
    backdropPath: text(raw.backdrop_path) || null,
  };
}

function parseResults(data: unknown, mediaType: TmdbMediaType): TmdbItem[] {
  if (!isRecord(data) || !Array.isArray(data.results)) {
    throw new TmdbError('unavailable', 'The catalogue returned an unexpected response.');
  }
  return data.results
    .map((raw) => toItem(raw, mediaType))
    .filter((item): item is TmdbItem => item !== null);
}

export async function fetchTmdbList(mediaType: TmdbMediaType, list: TmdbListKind, genreId = 0): Promise<TmdbItem[]> {
  const data = await callTmdb({ action: 'list', type: mediaType, list, genre: genreId });
  return parseResults(data, mediaType);
}

export async function searchTmdb(mediaType: TmdbMediaType, query: string): Promise<TmdbItem[]> {
  const data = await callTmdb({ action: 'search', type: mediaType, query });
  return parseResults(data, mediaType);
}

export async function fetchTmdbGenres(mediaType: TmdbMediaType): Promise<TmdbGenre[]> {
  const data = await callTmdb({ action: 'genres', type: mediaType });
  if (!isRecord(data) || !Array.isArray(data.genres)) {
    throw new TmdbError('unavailable', 'The catalogue returned an unexpected response.');
  }
  return data.genres.flatMap((raw): TmdbGenre[] => {
    if (!isRecord(raw)) return [];
    const id = finiteNumber(raw.id);
    const name = text(raw.name);
    return id !== null && name ? [{ id, name }] : [];
  });
}

export async function fetchTmdbDetail(mediaType: TmdbMediaType, id: number): Promise<TmdbDetail> {
  const data = await callTmdb({ action: 'details', type: mediaType, id });
  const item = toItem(data, mediaType);
  if (!item || !isRecord(data)) throw new TmdbError('unavailable', 'The catalogue returned an unexpected response.');
  const episodeRuntimes: unknown[] = Array.isArray(data.episode_run_time) ? data.episode_run_time : [];
  const genres = Array.isArray(data.genres)
    ? data.genres.map((genre) => (isRecord(genre) ? text(genre.name) : '')).filter(Boolean)
    : [];
  const isSeries = mediaType === 'tv';
  return {
    ...item,
    genres,
    runtimeMinutes: isSeries ? positiveNumber(episodeRuntimes[0]) : positiveNumber(data.runtime),
    seasons: isSeries ? positiveNumber(data.number_of_seasons) : null,
    episodes: isSeries ? positiveNumber(data.number_of_episodes) : null,
    tagline: text(data.tagline),
    status: text(data.status),
    trailers: parseTrailers(data.videos),
  };
}

export async function fetchTmdbTrailers(mediaType: TmdbMediaType, id: number): Promise<Trailer[]> {
  return parseTrailers(await callTmdb({ action: 'videos', type: mediaType, id }));
}

export type TrailerFeedSectionKey = 'upcoming' | 'trending_movies' | 'trending_series';

export interface TrailerFeedEntry {
  item: TmdbItem;
  trailers: Trailer[];
}

export interface TrailerFeedSection {
  key: TrailerFeedSectionKey;
  entries: TrailerFeedEntry[];
}

const FEED_KEYS: TrailerFeedSectionKey[] = ['upcoming', 'trending_movies', 'trending_series'];

export async function fetchTrailerFeed(): Promise<TrailerFeedSection[]> {
  const data = await callTmdb({ action: 'trailer_feed' });
  if (!isRecord(data) || !Array.isArray(data.sections)) {
    throw new TmdbError('unavailable', 'The catalogue returned an unexpected response.');
  }
  return data.sections.flatMap((raw): TrailerFeedSection[] => {
    if (!isRecord(raw) || !FEED_KEYS.includes(raw.key as TrailerFeedSectionKey) || !Array.isArray(raw.entries)) return [];
    const mediaType: TmdbMediaType = raw.type === 'tv' ? 'tv' : 'movie';
    const entries = raw.entries.flatMap((entry): TrailerFeedEntry[] => {
      if (!isRecord(entry)) return [];
      const item = toItem(entry.title, mediaType);
      const trailers = parseTrailers(entry.videos);
      return item && trailers.length > 0 ? [{ item, trailers }] : [];
    });
    return [{ key: raw.key as TrailerFeedSectionKey, entries }];
  });
}
