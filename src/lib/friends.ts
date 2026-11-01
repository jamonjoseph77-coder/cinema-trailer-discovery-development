import { supabase } from '@/lib/supabase';
import { fetchProfilesByIds } from '@/lib/profiles';
import type { Friendship, Profile } from '@/lib/types';

export interface FriendEntry {
  friendshipId: string;
  otherUserId: string;
  profile: Profile | null;
  createdAt: string;
}

export interface FriendsSnapshot {
  friends: FriendEntry[];
  incoming: FriendEntry[];
  outgoing: FriendEntry[];
  relations: Map<string, { state: 'friends' | 'incoming' | 'outgoing'; friendshipId: string }>;
}

export async function loadFriendsSnapshot(userId: string): Promise<FriendsSnapshot> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as Friendship[];
  const otherIds = rows.map((row) => (row.requester_id === userId ? row.addressee_id : row.requester_id));
  const profiles = await fetchProfilesByIds([...new Set(otherIds)]);
  const profileById = new Map(profiles.map((profile) => [profile.user_id, profile]));

  const snapshot: FriendsSnapshot = { friends: [], incoming: [], outgoing: [], relations: new Map() };
  for (const row of rows) {
    const otherUserId = row.requester_id === userId ? row.addressee_id : row.requester_id;
    const entry: FriendEntry = {
      friendshipId: row.id,
      otherUserId,
      profile: profileById.get(otherUserId) ?? null,
      createdAt: row.created_at,
    };
    if (row.status === 'accepted') {
      snapshot.friends.push(entry);
      snapshot.relations.set(otherUserId, { state: 'friends', friendshipId: row.id });
    } else if (row.addressee_id === userId) {
      snapshot.incoming.push(entry);
      snapshot.relations.set(otherUserId, { state: 'incoming', friendshipId: row.id });
    } else {
      snapshot.outgoing.push(entry);
      snapshot.relations.set(otherUserId, { state: 'outgoing', friendshipId: row.id });
    }
  }
  return snapshot;
}

export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' });
  if (error) throw error;
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId);
  if (error) throw error;
}

export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
  if (error) throw error;
}
