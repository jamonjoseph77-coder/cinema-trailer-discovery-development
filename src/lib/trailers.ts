export type TrailerKind = 'trailer' | 'teaser' | 'clip' | 'featurette' | 'behind_the_scenes';

export interface Trailer {
  key: string;
  name: string;
  kind: TrailerKind;
  official: boolean;
  publishedAt: string | null;
}

export const TRAILER_KIND_LABELS: Record<TrailerKind, string> = {
  trailer: 'Trailer',
  teaser: 'Teaser',
  clip: 'Clip',
  featurette: 'Featurette',
  behind_the_scenes: 'Behind the scenes',
};

const KIND_BY_SOURCE_TYPE: Record<string, TrailerKind> = {
  Trailer: 'trailer',
  Teaser: 'teaser',
  Clip: 'clip',
  Featurette: 'featurette',
  'Behind the Scenes': 'behind_the_scenes',
};

const KIND_RANK: Record<TrailerKind, number> = { trailer: 0, teaser: 1, clip: 2, featurette: 3, behind_the_scenes: 4 };

const YOUTUBE_KEY = /^[A-Za-z0-9_-]{11}$/;

// Excludes anything that looks like a full-length upload even if it was tagged as promotional.
const FULL_LENGTH_HINT = /\b(full (movie|film|episode)|complete (movie|film))\b/i;

export function trailerLabel(trailer: Trailer): string {
  if (trailer.kind === 'trailer' && trailer.official) return 'Official trailer';
  if (trailer.kind === 'teaser' && trailer.official) return 'Official teaser';
  return TRAILER_KIND_LABELS[trailer.kind];
}

export function trailerWatchUrl(trailer: Trailer): string {
  return `https://www.youtube.com/watch?v=${trailer.key}`;
}

export function isTrailerKey(value: unknown): value is string {
  return typeof value === 'string' && YOUTUBE_KEY.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toTrailer(raw: unknown): Trailer | null {
  if (!isRecord(raw)) return null;
  if (raw.site !== 'YouTube' || !isTrailerKey(raw.key)) return null;
  const kind = typeof raw.type === 'string' ? KIND_BY_SOURCE_TYPE[raw.type] : undefined;
  if (!kind) return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (FULL_LENGTH_HINT.test(name)) return null;
  return {
    key: raw.key,
    name: name || TRAILER_KIND_LABELS[kind],
    kind,
    official: raw.official === true,
    publishedAt: typeof raw.published_at === 'string' ? raw.published_at : null,
  };
}

function compareTrailers(a: Trailer, b: Trailer): number {
  if (KIND_RANK[a.kind] !== KIND_RANK[b.kind]) return KIND_RANK[a.kind] - KIND_RANK[b.kind];
  if (a.official !== b.official) return a.official ? -1 : 1;
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
}

/** Accepts a video listing payload (`{ results: [...] }`) and returns playable official videos, best first. */
export function parseTrailers(payload: unknown): Trailer[] {
  const results = isRecord(payload) && Array.isArray(payload.results) ? payload.results : [];
  const seen = new Set<string>();
  return results
    .map(toTrailer)
    .filter((trailer): trailer is Trailer => {
      if (!trailer || seen.has(trailer.key)) return false;
      seen.add(trailer.key);
      return true;
    })
    .sort(compareTrailers);
}

export function primaryTrailer(trailers: Trailer[]): Trailer | null {
  return trailers[0] ?? null;
}

export function firstOfKinds(trailers: Trailer[], kinds: TrailerKind[]): Trailer | null {
  return trailers.find((trailer) => kinds.includes(trailer.kind)) ?? null;
}
