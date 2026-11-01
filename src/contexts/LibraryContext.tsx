import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  addUserTitle,
  fetchUserTitleIds,
  fetchWatchProgress,
  removeUserTitle,
  upsertWatchProgress,
} from '@/lib/library';
import { addCatalogueSave, catalogueKey, fetchCatalogueSaves, removeCatalogueSave } from '@/lib/catalogueSaves';
import type { TmdbItem } from '@/lib/tmdb';
import type { ProgressEntry, UserListTable, WatchProgress } from '@/lib/types';

export interface LibraryContextValue {
  watchlistIds: ReadonlySet<string>;
  favouriteIds: ReadonlySet<string>;
  catalogueSaves: readonly TmdbItem[];
  catalogueSaveKeys: ReadonlySet<string>;
  progress: WatchProgress[];
  ready: boolean;
  toggleWatchlist: (titleId: string) => Promise<void>;
  toggleFavourite: (titleId: string) => Promise<void>;
  toggleCatalogueSave: (item: TmdbItem) => Promise<void>;
  saveProgress: (entry: ProgressEntry) => Promise<void>;
}

export const LibraryContext = createContext<LibraryContextValue | null>(null);

function withMember(ids: ReadonlySet<string>, id: string, present: boolean): Set<string> {
  const next = new Set(ids);
  if (present) next.add(id);
  else next.delete(id);
  return next;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const userId = user?.id ?? null;

  const [watchlistIds, setWatchlistIds] = useState<ReadonlySet<string>>(new Set());
  const [favouriteIds, setFavouriteIds] = useState<ReadonlySet<string>>(new Set());
  const [catalogueSaves, setCatalogueSaves] = useState<readonly TmdbItem[]>([]);
  const [progress, setProgress] = useState<WatchProgress[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) {
      setWatchlistIds(new Set());
      setFavouriteIds(new Set());
      setCatalogueSaves([]);
      setProgress([]);
      setReady(true);
      return;
    }
    let active = true;
    setReady(false);
    fetchCatalogueSaves(userId)
      .then((saves) => {
        if (active) setCatalogueSaves(saves);
      })
      .catch((error) => console.warn('Saved catalogue titles could not be loaded', error));
    Promise.all([
      fetchUserTitleIds('watchlist_items', userId),
      fetchUserTitleIds('favourites', userId),
      fetchWatchProgress(userId),
    ])
      .then(([watchlist, favourites, history]) => {
        if (!active) return;
        setWatchlistIds(new Set(watchlist));
        setFavouriteIds(new Set(favourites));
        setProgress(history);
      })
      .catch(() => {
        if (active) notify('We could not load your saved titles. Refresh the page to try again.', 'error');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [userId, notify]);

  const toggleMembership = useCallback(
    async (
      table: UserListTable,
      ids: ReadonlySet<string>,
      setIds: (next: ReadonlySet<string>) => void,
      titleId: string,
    ) => {
      if (!userId) return;
      const wasMember = ids.has(titleId);
      setIds(withMember(ids, titleId, !wasMember));
      try {
        if (wasMember) await removeUserTitle(table, userId, titleId);
        else await addUserTitle(table, userId, titleId);
      } catch {
        setIds(withMember(ids, titleId, wasMember));
        notify('That change did not save. Please try again.', 'error');
      }
    },
    [userId, notify],
  );

  const toggleWatchlist = useCallback(
    (titleId: string) => toggleMembership('watchlist_items', watchlistIds, setWatchlistIds, titleId),
    [toggleMembership, watchlistIds],
  );

  const toggleFavourite = useCallback(
    (titleId: string) => toggleMembership('favourites', favouriteIds, setFavouriteIds, titleId),
    [toggleMembership, favouriteIds],
  );

  const catalogueSaveKeys = useMemo(() => new Set(catalogueSaves.map(catalogueKey)), [catalogueSaves]);

  const toggleCatalogueSave = useCallback(
    async (item: TmdbItem) => {
      if (!userId) return;
      const key = catalogueKey(item);
      const previous = catalogueSaves;
      const wasSaved = catalogueSaveKeys.has(key);
      setCatalogueSaves(wasSaved ? previous.filter((saved) => catalogueKey(saved) !== key) : [item, ...previous]);
      try {
        if (wasSaved) await removeCatalogueSave(userId, item);
        else await addCatalogueSave(userId, item);
        notify(wasSaved ? `${item.title} was removed from your watchlist.` : `${item.title} was added to your watchlist.`);
      } catch {
        setCatalogueSaves(previous);
        notify('Your watchlist could not be updated just now. Please try again shortly.', 'error');
      }
    },
    [userId, notify, catalogueSaves, catalogueSaveKeys],
  );

  const saveProgress = useCallback(
    async (entry: ProgressEntry) => {
      if (!userId) return;
      try {
        const saved = await upsertWatchProgress(userId, entry);
        setProgress((previous) => [saved, ...previous.filter((item) => item.content_id !== saved.content_id)]);
      } catch (error) {
        console.warn('Watch progress could not be saved', error);
      }
    },
    [userId],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      watchlistIds,
      favouriteIds,
      catalogueSaves,
      catalogueSaveKeys,
      progress,
      ready,
      toggleWatchlist,
      toggleFavourite,
      toggleCatalogueSave,
      saveProgress,
    }),
    [watchlistIds, favouriteIds, catalogueSaves, catalogueSaveKeys, progress, ready, toggleWatchlist, toggleFavourite, toggleCatalogueSave, saveProgress],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
