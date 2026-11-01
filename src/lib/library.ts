import { supabase } from '@/lib/supabase';
import type {
  EpisodeInput,
  ProgressEntry,
  SeasonInput,
  SeasonWithEpisodes,
  Title,
  TitleInput,
  UserListTable,
  WatchProgress,
} from '@/lib/types';

export interface TitleDetail {
  title: Title | null;
  seasons: SeasonWithEpisodes[];
}

export async function fetchPublishedTitles(): Promise<Title[]> {
  const { data, error } = await supabase
    .from('titles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Title[];
}

export async function fetchAllTitles(): Promise<Title[]> {
  const { data, error } = await supabase
    .from('titles')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Title[];
}

export async function fetchTitleDetail(titleId: string): Promise<TitleDetail> {
  const [titleResult, seasonResult] = await Promise.all([
    supabase.from('titles').select('*').eq('id', titleId).maybeSingle(),
    supabase
      .from('seasons')
      .select('*, episodes(*)')
      .eq('title_id', titleId)
      .order('number', { ascending: true })
      .order('number', { referencedTable: 'episodes', ascending: true }),
  ]);
  if (titleResult.error) throw titleResult.error;
  if (seasonResult.error) throw seasonResult.error;
  return {
    title: (titleResult.data ?? null) as Title | null,
    seasons: (seasonResult.data ?? []) as SeasonWithEpisodes[],
  };
}

export async function fetchUserTitleIds(table: UserListTable, userId: string): Promise<string[]> {
  const { data, error } = await supabase.from(table).select('title_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row: { title_id: string }) => row.title_id);
}

export async function addUserTitle(table: UserListTable, userId: string, titleId: string): Promise<void> {
  const { error } = await supabase.from(table).insert({ user_id: userId, title_id: titleId });
  if (error) throw error;
}

export async function removeUserTitle(table: UserListTable, userId: string, titleId: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('user_id', userId).eq('title_id', titleId);
  if (error) throw error;
}

export async function fetchWatchProgress(userId: string): Promise<WatchProgress[]> {
  const { data, error } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as WatchProgress[];
}

export async function upsertWatchProgress(userId: string, entry: ProgressEntry): Promise<WatchProgress> {
  const { data, error } = await supabase
    .from('watch_progress')
    .upsert(
      { user_id: userId, ...entry, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,content_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data as WatchProgress;
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_cinema_admin');
  if (error) throw error;
  return data === true;
}

export async function saveTitle(input: TitleInput, titleId: string | null): Promise<Title> {
  const payload = { ...input, updated_at: new Date().toISOString() };
  const { data, error } = titleId
    ? await supabase.from('titles').update(payload).eq('id', titleId).select().single()
    : await supabase.from('titles').insert(payload).select().single();
  if (error) throw error;
  return data as Title;
}

export async function setTitleFlags(
  titleId: string,
  flags: { is_published?: boolean; is_featured?: boolean },
): Promise<void> {
  const { error } = await supabase
    .from('titles')
    .update({ ...flags, updated_at: new Date().toISOString() })
    .eq('id', titleId);
  if (error) throw error;
}

export async function deleteTitle(titleId: string): Promise<void> {
  const { error } = await supabase.from('titles').delete().eq('id', titleId);
  if (error) throw error;
}

export async function saveSeason(input: SeasonInput): Promise<void> {
  const { error } = await supabase.from('seasons').insert(input);
  if (error) throw error;
}

export async function deleteSeason(seasonId: string): Promise<void> {
  const { error } = await supabase.from('seasons').delete().eq('id', seasonId);
  if (error) throw error;
}

export async function saveEpisode(input: EpisodeInput): Promise<void> {
  const { error } = await supabase.from('episodes').insert(input);
  if (error) throw error;
}

export async function deleteEpisode(episodeId: string): Promise<void> {
  const { error } = await supabase.from('episodes').delete().eq('id', episodeId);
  if (error) throw error;
}
