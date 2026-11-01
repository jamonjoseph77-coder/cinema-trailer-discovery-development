import {
  Compass,
  Film,
  Heart,
  Home,
  MonitorPlay,
  Newspaper,
  PartyPopper,
  Search,
  Megaphone,
  Ticket,
  Trophy,
  Tv,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Route } from '@/lib/router';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const HOME: NavItem = { key: 'home', label: 'Home', href: '/', icon: Home };
const MOVIES: NavItem = { key: 'movies', label: 'Movies', href: '/movies', icon: Film };
const SERIES: NavItem = { key: 'series', label: 'Series', href: '/series', icon: MonitorPlay };
const SPORTS: NavItem = { key: 'sports', label: 'Sports', href: '/sports', icon: Trophy };
const LIVE: NavItem = { key: 'live-tv', label: 'Live TV', href: '/live-tv', icon: Tv };
const NEWS: NavItem = { key: 'news', label: 'News', href: '/news', icon: Newspaper };
const DISCOVER: NavItem = { key: 'discover', label: 'Discover', href: '/discover', icon: Compass };
const SEARCH: NavItem = { key: 'search', label: 'Search', href: '/search', icon: Search };
const FRIENDS: NavItem = { key: 'friends', label: 'Friends', href: '/friends', icon: Users };
const WATCH_PARTIES: NavItem = { key: 'watch-parties', label: 'Watch Parties', href: '/watch-parties', icon: PartyPopper };
const MY_CINEMA: NavItem = { key: 'my-cinema', label: 'My Cinema', href: '/my-cinema', icon: Heart };
const PROFILE: NavItem = { key: 'profile', label: 'Profile', href: '/profile', icon: UserRound };
const PUBLISHERS: NavItem = { key: 'publishers', label: 'Publishers', href: '/publishers', icon: Megaphone };
const BOX_OFFICE: NavItem = { key: 'box-office', label: 'Digital Box Office', href: '/box-office', icon: Ticket };

export const NAV_SECTIONS: NavSection[] = [
  { title: 'Watch', items: [HOME, MOVIES, SERIES, SPORTS, LIVE, NEWS, DISCOVER, SEARCH] },
  { title: 'Your Cinema', items: [MY_CINEMA, FRIENDS, WATCH_PARTIES, PROFILE] },
  { title: 'Partners', items: [PUBLISHERS, BOX_OFFICE] },
];

export const MOBILE_PRIMARY_NAV: NavItem[] = [HOME, MOVIES, SERIES, LIVE, MY_CINEMA];

export function navKeyOf(route: Route): string | null {
  switch (route.name) {
    case 'home':
      return 'home';
    case 'browse':
      return { movie: 'movies', series: 'series', sport: 'sports', live: 'live-tv', news: 'news' }[route.kind];
    case 'discover':
      return 'discover';
    case 'search':
      return 'search';
    case 'my-cinema':
      return 'my-cinema';
    case 'friends':
      return 'friends';
    case 'profile':
      return 'profile';
    case 'watch-parties':
    case 'watch-party':
      return 'watch-parties';
    case 'coming-soon':
      return route.section;
    case 'publishers':
    case 'publisher':
      return 'publishers';
    default:
      return null;
  }
}
