import { useMemo } from 'react';
import { useRouterState, type AnyRouter } from '@tanstack/react-router';
import type { TitleType } from '@/lib/types';
import type { TmdbMediaType } from '@/lib/tmdb';

export type ComingSoonSection = 'box-office';

export type Route =
  | { name: 'home' }
  | { name: 'browse'; kind: TitleType }
  | { name: 'discover' }
  | { name: 'search'; query: string }
  | { name: 'title'; id: string }
  | { name: 'tmdb'; mediaType: TmdbMediaType; id: number }
  | { name: 'watch'; id: string; episodeId: string | null }
  | { name: 'my-cinema' }
  | { name: 'sign-in' }
  | { name: 'sign-up' }
  | { name: 'forgot-password' }
  | { name: 'reset-password' }
  | { name: 'admin' }
  | { name: 'admin-new' }
  | { name: 'admin-clips' }
  | { name: 'admin-title'; id: string }
  | { name: 'publishers' }
  | { name: 'publisher'; publisher: string }
  | { name: 'friends' }
  | { name: 'profile' }
  | { name: 'watch-parties' }
  | { name: 'watch-party'; id: string }
  | { name: 'coming-soon'; section: ComingSoonSection }
  | { name: 'not-found' };

const BROWSE_ROUTES: Record<string, TitleType> = {
  movies: 'movie',
  series: 'series',
  sports: 'sport',
  'live-tv': 'live',
  news: 'news',
};

const COMING_SOON_ROUTES: Record<string, ComingSoonSection> = {
  'box-office': 'box-office',
};

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function parsePath(href: string): Route {
  const [pathPart = '', queryPart = ''] = href.split('?');
  const segments = pathPart.split('/').filter(Boolean).map(safeDecode);
  const params = new URLSearchParams(queryPart);
  const [first, second, third] = segments;

  if (!first) return { name: 'home' };

  const browseKind = BROWSE_ROUTES[first];
  if (browseKind) return { name: 'browse', kind: browseKind };

  const comingSoon = COMING_SOON_ROUTES[first];
  if (comingSoon) return { name: 'coming-soon', section: comingSoon };

  switch (first) {
    case 'discover':
      return { name: 'discover' };
    case 'search':
      return { name: 'search', query: params.get('q') ?? '' };
    case 'title':
      return second ? { name: 'title', id: second } : { name: 'not-found' };
    case 'tmdb': {
      const id = Number(third);
      const mediaType = second === 'movie' || second === 'tv' ? second : null;
      return mediaType && Number.isInteger(id) && id > 0 ? { name: 'tmdb', mediaType, id } : { name: 'not-found' };
    }
    case 'watch':
      return second ? { name: 'watch', id: second, episodeId: params.get('ep') } : { name: 'not-found' };
    case 'publishers':
      return second ? { name: 'publisher', publisher: second } : { name: 'publishers' };
    case 'my-cinema':
      return { name: 'my-cinema' };
    case 'friends':
      return { name: 'friends' };
    case 'profile':
      return { name: 'profile' };
    case 'watch-parties':
      return second ? { name: 'watch-party', id: second } : { name: 'watch-parties' };
    case 'sign-in':
      return { name: 'sign-in' };
    case 'sign-up':
      return { name: 'sign-up' };
    case 'forgot-password':
      return { name: 'forgot-password' };
    case 'reset-password':
      return { name: 'reset-password' };
    case 'admin':
      if (second === 'new') return { name: 'admin-new' };
      if (second === 'clips') return { name: 'admin-clips' };
      if (second === 'title' && third) return { name: 'admin-title', id: third };
      return { name: 'admin' };
    default:
      return { name: 'not-found' };
  }
}

let activeRouter: AnyRouter | null = null;

export function registerRouter(router: AnyRouter): void {
  activeRouter = router;
}

export function useRoute(): Route {
  const href = useRouterState({ select: (state) => state.location.href });
  return useMemo(() => parsePath(href), [href]);
}

export function navigateTo(path: string): void {
  if (activeRouter) void activeRouter.navigate({ href: path });
  else window.location.assign(path);
}
