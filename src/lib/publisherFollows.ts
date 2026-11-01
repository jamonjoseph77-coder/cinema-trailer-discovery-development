import { supabase } from '@/lib/supabase';

export async function fetchFollowedPublishers(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('publisher_follows').select('publisher_name').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row: { publisher_name: string }) => row.publisher_name);
}

export async function followPublisher(userId: string, publisherName: string): Promise<void> {
  const { error } = await supabase.from('publisher_follows').insert({ user_id: userId, publisher_name: publisherName });
  if (error && error.code !== '23505') throw error;
}

export async function unfollowPublisher(userId: string, publisherName: string): Promise<void> {
  const { error } = await supabase
    .from('publisher_follows')
    .delete()
    .eq('user_id', userId)
    .eq('publisher_name', publisherName);
  if (error) throw error;
}
