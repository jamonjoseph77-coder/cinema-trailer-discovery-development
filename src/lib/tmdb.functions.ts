import { createServerFn } from "@tanstack/react-start";

const TMDB_BASE = "https://api.themoviedb.org/3";
const MEDIA_TYPES = ["movie", "tv"];
const LIST_KINDS = ["popular", "trending"];
const FEED_TITLES_PER_SECTION = 12;

type RequestBody = { action?: unknown; type?: unknown; list?: unknown; genre?: unknown; page?: unknown; query?: unknown; id?: unknown };
type Upstream = { path: string; params: Record<string, string> };
type Credentials = { readToken?: string; apiKey?: string };

function asInteger(value: unknown, min: number, max: number, fallback?: number): number | null {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) return null;
  return value;
}

function asMediaType(value: unknown): string | null {
  return typeof value === "string" && MEDIA_TYPES.includes(value) ? value : null;
}

function buildRequest(body: RequestBody): Upstream | { error: string } {
  const type = asMediaType(body.type);
  const page = asInteger(body.page, 1, 500, 1);
  if (body.action === "list") {
    if (!type) return { error: "Unknown media type." };
    if (page === null) return { error: "Page must be between 1 and 500." };
    const genre = body.genre === null || body.genre === undefined || body.genre === 0 ? 0 : asInteger(body.genre, 1, 100000);
    if (genre === null) return { error: "Genre is not valid." };
    if (genre > 0) {
      return { path: `/discover/${type}`, params: { with_genres: String(genre), sort_by: "popularity.desc", include_adult: "false", page: String(page) } };
    }
    if (typeof body.list !== "string" || !LIST_KINDS.includes(body.list)) return { error: "List must be popular or trending." };
    if (body.list === "trending") return { path: `/trending/${type}/week`, params: { page: String(page) } };
    return { path: `/${type}/popular`, params: { page: String(page) } };
  }
  if (body.action === "search") {
    if (!type) return { error: "Unknown media type." };
    if (page === null) return { error: "Page must be between 1 and 500." };
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (query.length < 1 || query.length > 120) return { error: "Search text must be 1 to 120 characters." };
    return { path: `/search/${type}`, params: { query, include_adult: "false", page: String(page) } };
  }
  if (body.action === "details") {
    if (!type) return { error: "Unknown media type." };
    const id = asInteger(body.id, 1, 2147483647);
    if (id === null) return { error: "Title id is not valid." };
    return { path: `/${type}/${id}`, params: { append_to_response: "videos", include_video_language: "en,null" } };
  }
  if (body.action === "videos") {
    if (!type) return { error: "Unknown media type." };
    const id = asInteger(body.id, 1, 2147483647);
    if (id === null) return { error: "Title id is not valid." };
    return { path: `/${type}/${id}/videos`, params: { include_video_language: "en,null" } };
  }
  if (body.action === "genres") {
    if (!type) return { error: "Unknown media type." };
    return { path: `/genre/${type}/list`, params: {} };
  }
  return { error: "Unknown request." };
}

async function fetchUpstream(credentials: Credentials, upstream: Upstream): Promise<unknown> {
  const url = new URL(`${TMDB_BASE}${upstream.path}`);
  Object.entries(upstream.params).forEach(([key, value]) => url.searchParams.set(key, value));
  const headers: Record<string, string> = { Accept: "application/json" };
  if (credentials.readToken) headers.Authorization = `Bearer ${credentials.readToken}`;
  else url.searchParams.set("api_key", credentials.apiKey as string);
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return response.json();
}

function resultIds(data: unknown): number[] {
  if (typeof data !== "object" || data === null || !Array.isArray((data as { results?: unknown }).results)) return [];
  return ((data as { results: unknown[] }).results)
    .map((raw) => (typeof raw === "object" && raw !== null ? (raw as { id?: unknown }).id : null))
    .filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0);
}

// Builds the Discover trailer feed in one round trip: each section's titles plus their official video listings.
async function buildTrailerFeed(credentials: Credentials): Promise<unknown> {
  const sections: { key: string; type: "movie" | "tv"; upstream: Upstream }[] = [
    { key: "upcoming", type: "movie", upstream: { path: "/movie/upcoming", params: { page: "1" } } },
    { key: "trending_movies", type: "movie", upstream: { path: "/trending/movie/week", params: { page: "1" } } },
    { key: "trending_series", type: "tv", upstream: { path: "/trending/tv/week", params: { page: "1" } } },
  ];

  const built = await Promise.all(
    sections.map(async (section) => {
      try {
        const list = await fetchUpstream(credentials, section.upstream);
        const results = (list as { results: unknown[] }).results ?? [];
        const ids = resultIds(list).slice(0, FEED_TITLES_PER_SECTION);
        const videos = await Promise.all(
          ids.map((id) =>
            fetchUpstream(credentials, { path: `/${section.type}/${id}/videos`, params: { include_video_language: "en,null" } }).catch(() => null),
          ),
        );
        const entries = ids.map((id, index) => ({
          title: results.find((raw) => typeof raw === "object" && raw !== null && (raw as { id?: unknown }).id === id) ?? null,
          videos: videos[index],
        }));
        return { key: section.key, type: section.type, entries };
      } catch (error) {
        console.error("trailer feed section failed", section.key, error);
        return { key: section.key, type: section.type, entries: [] };
      }
    }),
  );
  return { sections: built };
}

export type TmdbCallResult =
  | { ok: true; json: string }
  | { ok: false; reason: "not_configured" | "unavailable"; message: string };

export const callTmdbServer = createServerFn({ method: "POST" })
  .validator((input: RequestBody) => input)
  .handler(async ({ data: body }): Promise<TmdbCallResult> => {
    const credentials: Credentials = {
      readToken: process.env.TMDB_READ_ACCESS_TOKEN,
      apiKey: process.env.TMDB_API_KEY,
    };
    if (!credentials.readToken && !credentials.apiKey) {
      return { ok: false, reason: "not_configured", message: "Catalogue service is not configured." };
    }
    try {
      if (body.action === "trailer_feed") {
        return { ok: true, json: JSON.stringify(await buildTrailerFeed(credentials)) };
      }
      const built = buildRequest(body);
      if ("error" in built) return { ok: false, reason: "unavailable", message: built.error };
      return { ok: true, json: JSON.stringify(await fetchUpstream(credentials, built)) };
    } catch (error) {
      console.error("catalogue request failed", error);
      return { ok: false, reason: "unavailable", message: "Catalogue request failed." };
    }
  });
