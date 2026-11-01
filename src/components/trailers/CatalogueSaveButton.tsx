import { Bookmark, BookmarkCheck } from 'lucide-react';
import { BUTTON_SECONDARY } from '@/components/ui/styles';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { catalogueKey } from '@/lib/catalogueSaves';
import type { TmdbItem } from '@/lib/tmdb';

export function CatalogueSaveButton({ item, compact = false }: { item: TmdbItem; compact?: boolean }) {
  const { user } = useAuth();
  const { catalogueSaveKeys, toggleCatalogueSave } = useLibrary();
  const saved = catalogueSaveKeys.has(catalogueKey(item));
  const label = saved ? `Remove ${item.title} from your watchlist` : `Add ${item.title} to your watchlist`;
  const Icon = saved ? BookmarkCheck : Bookmark;

  const compactClass = `grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition ${
    saved ? 'border-cinema-400/60 bg-cinema-600/90 text-white' : 'border-white/10 bg-ink-950/70 text-slate-200 hover:border-cinema-400/50 hover:text-white'
  }`;

  if (!user) {
    return (
      <a href="/sign-in" aria-label="Sign in to save titles to your watchlist" className={compact ? compactClass : BUTTON_SECONDARY}>
        <Bookmark className="h-4 w-4" aria-hidden="true" />
        {!compact && 'Sign in to save'}
      </a>
    );
  }

  return (
    <button type="button" onClick={() => toggleCatalogueSave(item)} aria-pressed={saved} aria-label={label} className={compact ? compactClass : BUTTON_SECONDARY}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {!compact && (saved ? 'On your watchlist' : 'Add to watchlist')}
    </button>
  );
}
