import { supabase } from '@/lib/supabase';
import type { TitleType } from '@/lib/types';

export type ClipKind = 'trailer' | 'short' | 'clip' | 'featured';

export interface ClipTitle {
  id: string;
  title: string;
  type: TitleType;
}

export interface DiscoverClip {
  id: string;
  kind: ClipKind;
  headline: string;
  description: string;
  video_url: string;
  poster_url: string;
  publisher_name: string;
  title_id: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_published: boolean;
  title: ClipTitle | null;
}

export const CLIP_KIND_LABEL: Record<ClipKind, string> = {
  trailer: 'Trailer',
  short: 'Short',
  clip: 'Clip',
  featured: 'Featured',
};

export async function fetchPublishedClips(): Promise<DiscoverClip[]> {
  const { data, error } = await supabase
    .from('discover_clips')
    .select('*, title:titles(id, title, type)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiscoverClip[];
}

export interface ClipInput {
  kind: ClipKind;
  headline: string;
  description: string;
  video_url: string;
  poster_url: string;
  publisher_name: string;
  title_id: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_published: boolean;
}

export async function fetchAllClips(): Promise<DiscoverClip[]> {
  const { data, error } = await supabase
    .from('discover_clips')
    .select('*, title:titles(id, title, type)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiscoverClip[];
}

export async function saveClip(id: string | null, input: ClipInput): Promise<void> {
  const payload = { ...input, updated_at: new Date().toISOString() };
  const { error } = id
    ? await supabase.from('discover_clips').update(payload).eq('id', id)
    : await supabase.from('discover_clips').insert(payload);
  if (error) throw error;
}

export async function setClipPublished(id: string, isPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from('discover_clips')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteClip(id: string): Promise<void> {
  const { error } = await supabase.from('discover_clips').delete().eq('id', id);
  if (error) throw error;
}

export function formatClipDuration(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return '';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}
