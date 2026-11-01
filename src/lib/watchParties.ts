import { supabase } from '@/lib/supabase';
import { fetchProfilesByIds } from '@/lib/profiles';
import type {
  Profile,
  TitleType,
  WatchParty,
  WatchPartyMessage,
  WatchPartyStatus,
  WatchPartyVisibility,
} from '@/lib/types';

export interface WatchPartyTitle {
  id: string;
  title: string;
  type: TitleType;
  poster_url: string;
  backdrop_url: string;
}

export interface WatchPartyWithTitle extends WatchParty {
  title: WatchPartyTitle | null;
}

export interface PartyMemberEntry {
  userId: string;
  role: 'host' | 'guest';
  profile: Profile | null;
}

export interface CreatePartyInput {
  host_id: string;
  title_id: string;
  name: string;
  visibility: WatchPartyVisibility;
  scheduled_at: string | null;
}

const PARTY_SELECT = '*, title:titles(id, title, type, poster_url, backdrop_url)';

export const PARTY_STATUS_LABEL: Record<WatchPartyStatus, string> = {
  scheduled: 'Scheduled',
  live: 'Live now',
  ended: 'Ended',
};

export function describeSchedule(party: Pick<WatchParty, 'status' | 'scheduled_at'>): string {
  if (party.status === 'live') return 'Live now';
  if (party.status === 'ended') return 'This party has ended';
  if (!party.scheduled_at) return 'Starts when the host is ready';
  return `Starts ${new Date(party.scheduled_at).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export async function fetchVisibleParties(): Promise<WatchPartyWithTitle[]> {
  const { data, error } = await supabase
    .from('watch_parties')
    .select(PARTY_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as WatchPartyWithTitle[];
}

export async function fetchPartyWithTitle(partyId: string): Promise<WatchPartyWithTitle | null> {
  const { data, error } = await supabase.from('watch_parties').select(PARTY_SELECT).eq('id', partyId).maybeSingle();
  if (error) throw error;
  return (data ?? null) as WatchPartyWithTitle | null;
}

export async function fetchMyPartyIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('watch_party_members').select('party_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row: { party_id: string }) => row.party_id);
}

export async function createWatchParty(input: CreatePartyInput): Promise<WatchParty> {
  const { data, error } = await supabase.from('watch_parties').insert(input).select().single();
  if (error) throw error;
  return data as WatchParty;
}

export async function joinPublicParty(partyId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('watch_party_members').insert({ party_id: partyId, user_id: userId, role: 'guest' });
  if (error && error.code !== '23505') throw error;
}

export async function joinPartyByInviteCode(inviteCode: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_watch_party', { p_invite_code: inviteCode.trim().toUpperCase() });
  if (error) throw error;
  if (typeof data !== 'string') throw new Error('Unexpected response when joining the watch party.');
  return data;
}

export async function leaveParty(partyId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('watch_party_members').delete().eq('party_id', partyId).eq('user_id', userId);
  if (error) throw error;
}

export async function setPartyStatus(partyId: string, status: WatchPartyStatus): Promise<void> {
  const { error } = await supabase
    .from('watch_parties')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', partyId);
  if (error) throw error;
}

export async function fetchPartyMembers(partyId: string): Promise<PartyMemberEntry[]> {
  const { data, error } = await supabase
    .from('watch_party_members')
    .select('user_id, role, joined_at')
    .eq('party_id', partyId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as { user_id: string; role: 'host' | 'guest' }[];
  const profiles = await fetchProfilesByIds(rows.map((row) => row.user_id));
  const profileById = new Map(profiles.map((profile) => [profile.user_id, profile]));
  return rows.map((row) => ({
    userId: row.user_id,
    role: row.role,
    profile: profileById.get(row.user_id) ?? null,
  }));
}

export async function fetchPartyMessages(partyId: string): Promise<WatchPartyMessage[]> {
  const { data, error } = await supabase
    .from('watch_party_messages')
    .select('*')
    .eq('party_id', partyId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as WatchPartyMessage[];
}

export async function sendPartyMessage(partyId: string, userId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('watch_party_messages')
    .insert({ party_id: partyId, user_id: userId, body });
  if (error) throw error;
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from('watch_party_messages').delete().eq('id', messageId);
  if (error) throw error;
}

export function subscribeToPartyChanges(
  channelName: string,
  table: 'watch_party_messages' | 'watch_party_members' | 'watch_parties',
  filter: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
