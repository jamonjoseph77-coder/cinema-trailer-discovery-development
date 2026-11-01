import { supabase } from '@/lib/supabase';
import type { Profile, ProfileInput } from '@/lib/types';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Profile | null;
}

export async function fetchProfilesByIds(userIds: string[]): Promise<Profile[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase.from('profiles').select('*').in('user_id', userIds);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function searchProfiles(term: string, excludeUserId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${term}%`)
    .neq('user_id', excludeUserId)
    .order('username', { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function saveProfile(userId: string, input: ProfileInput, exists: boolean): Promise<Profile> {
  const { data, error } = exists
    ? await supabase
        .from('profiles')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()
    : await supabase.from('profiles').insert({ user_id: userId, ...input }).select().single();
  if (error) throw error;
  return data as Profile;
}
