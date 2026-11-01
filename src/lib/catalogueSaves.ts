import { supabase } from '@/lib/supabase';
import type { TmdbItem, TmdbMediaType } from '@/lib/tmdb';

const TABLE = 'catalogue_watchlist';

interface CatalogueSaveRow {
  media_type: TmdbMediaType;
  catalogue_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  created_at: string;
}

// The table is added by an additive migration and is not yet part of the generated database types.
const table = () => (supabase as unknown as { from: (name: string) => ReturnType<typeof supabase.from> }).from(TABLE as never);

export function catalogueKey(item: Pick<TmdbItem, 'mediaType' | 'id'>): string {
  return `${item.mediaType}:${item.id}`;
}

function toItem(row: CatalogueSaveRow): TmdbItem {
  return {
    id: row.catalogue_id,
    mediaType: row.media_type,
    title: row.title,
    overview: '',
    releaseDate: row.release_date,
    rating: null,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
  };
}

export async function fetchCatalogueSaves(userId: string): Promise<TmdbItem[]> {
  const { data, error } = await table()
    .select('media_type, catalogue_id, title, poster_path, backdrop_path, release_date, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as CatalogueSaveRow[]).map(toItem);
}

export async function addCatalogueSave(userId: string, item: TmdbItem): Promise<void> {
  const { error } = await table().insert({
    user_id: userId,
    media_type: item.mediaType,
    catalogue_id: item.id,
    title: item.title.slice(0, 300),
    poster_path: item.posterPath,
    backdrop_path: item.backdropPath,
    release_date: item.releaseDate,
  } as never);
  if (error) throw error;
}

export async function removeCatalogueSave(userId: string, item: Pick<TmdbItem, 'mediaType' | 'id'>): Promise<void> {
  const { error } = await table()
    .delete()
    .eq('user_id', userId)
    .eq('media_type', item.mediaType)
    .eq('catalogue_id', item.id);
  if (error) throw error;
}
