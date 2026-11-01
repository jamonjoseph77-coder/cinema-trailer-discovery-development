export type TitleType = 'movie' | 'series' | 'sport' | 'news' | 'live';

export const TITLE_TYPES: TitleType[] = ['movie', 'series', 'sport', 'news', 'live'];

export const TITLE_TYPE_LABELS: Record<TitleType, string> = {
  movie: 'Movie',
  series: 'Series',
  sport: 'Sports',
  news: 'News',
  live: 'Live TV',
};

export interface Title {
  id: string;
  type: TitleType;
  title: string;
  synopsis: string;
  genre: string;
  release_year: number | null;
  release_date: string | null;
  duration_minutes: number | null;
  publisher: string;
  poster_url: string;
  backdrop_url: string;
  trailer_url: string;
  playback_url: string;
  subtitle_url: string;
  availability: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  season_id: string;
  number: number;
  title: string;
  synopsis: string;
  duration_minutes: number | null;
  playback_url: string;
  thumbnail_url: string;
}

export interface Season {
  id: string;
  title_id: string;
  number: number;
  name: string;
}

export interface SeasonWithEpisodes extends Season {
  episodes: Episode[];
}

export interface WatchProgress {
  user_id: string;
  content_id: string;
  title_id: string;
  position_seconds: number;
  duration_seconds: number;
  completed: boolean;
  updated_at: string;
}

export type TitleInput = Omit<Title, 'id' | 'created_at' | 'updated_at'>;

export interface SeasonInput {
  title_id: string;
  number: number;
  name: string;
}

export interface EpisodeInput {
  season_id: string;
  number: number;
  title: string;
  synopsis: string;
  duration_minutes: number | null;
  playback_url: string;
  thumbnail_url: string;
}

export interface ProgressEntry {
  content_id: string;
  title_id: string;
  position_seconds: number;
  duration_seconds: number;
  completed: boolean;
}

export type UserListTable = 'watchlist_items' | 'favourites';

export interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  is_discoverable: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileInput {
  username: string;
  display_name: string;
  bio: string;
  is_discoverable: boolean;
}

export type FriendshipStatus = 'pending' | 'accepted';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export type WatchPartyVisibility = 'public' | 'private';
export type WatchPartyStatus = 'scheduled' | 'live' | 'ended';

export interface WatchParty {
  id: string;
  host_id: string;
  title_id: string;
  name: string;
  visibility: WatchPartyVisibility;
  invite_code: string;
  scheduled_at: string | null;
  status: WatchPartyStatus;
  created_at: string;
  updated_at: string;
}

export interface WatchPartyMember {
  party_id: string;
  user_id: string;
  role: 'host' | 'guest';
  joined_at: string;
}

export interface WatchPartyMessage {
  id: string;
  party_id: string;
  user_id: string;
  body: string;
  created_at: string;
}
