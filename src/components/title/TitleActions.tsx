import { Bookmark, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { BUTTON_SECONDARY } from '@/components/ui/styles';
import type { Title } from '@/lib/types';

export function TitleActions({ title }: { title: Title }) {
  const { user } = useAuth();
  const { watchlistIds, favouriteIds, toggleWatchlist, toggleFavourite, ready } = useLibrary();

  if (!user) {
    return (
      <a href="/sign-in" className={BUTTON_SECONDARY}>
        <Bookmark className="h-4 w-4" />
        Sign in to save
      </a>
    );
  }

  const inWatchlist = watchlistIds.has(title.id);
  const isFavourite = favouriteIds.has(title.id);

  return (
    <>
      <button
        type="button"
        disabled={!ready}
        onClick={() => void toggleWatchlist(title.id)}
        aria-pressed={inWatchlist}
        className={`${BUTTON_SECONDARY} ${inWatchlist ? 'border-cinema-400/60 bg-cinema-600/20' : ''}`}
      >
        <Bookmark className={`h-4 w-4 ${inWatchlist ? 'fill-current text-cinema-300' : ''}`} />
        {inWatchlist ? 'In watchlist' : 'Add to watchlist'}
      </button>
      <button
        type="button"
        disabled={!ready}
        onClick={() => void toggleFavourite(title.id)}
        aria-pressed={isFavourite}
        className={`${BUTTON_SECONDARY} ${isFavourite ? 'border-rose-400/60 bg-rose-500/15' : ''}`}
      >
        <Heart className={`h-4 w-4 ${isFavourite ? 'fill-current text-rose-300' : ''}`} />
        {isFavourite ? 'Favourited' : 'Favourite'}
      </button>
    </>
  );
}
