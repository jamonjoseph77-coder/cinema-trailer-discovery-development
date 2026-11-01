import { useEffect, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { TmdbCard } from '@/components/tmdb/TmdbCard';
import { TmdbErrorState } from '@/components/tmdb/TmdbErrorState';
import { EmptyState, LoadingState } from '@/components/ui/StatusViews';
import { CHIP_BASE, INPUT, LABEL, PAGE_CONTAINER, chipClass } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchTmdbGenres, fetchTmdbList, searchTmdb, type TmdbListKind, type TmdbMediaType } from '@/lib/tmdb';
import { Clapperboard } from 'lucide-react';

const MODE_LABELS: Record<TmdbListKind, string> = {
  popular: 'Popular',
  trending: 'Trending this week',
};

const SEARCH_DEBOUNCE_MS = 350;

export function TmdbBrowsePage({ mediaType }: { mediaType: TmdbMediaType }) {
  const heading = mediaType === 'movie' ? 'Movies' : 'Series';
  const [mode, setMode] = useState<TmdbListKind>('popular');
  const [genreId, setGenreId] = useState(0);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(draft.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const genres = useAsyncData(() => fetchTmdbGenres(mediaType), [mediaType]);
  const items = useAsyncData(
    () => (query ? searchTmdb(mediaType, query) : fetchTmdbList(mediaType, mode, genreId)),
    [mediaType, mode, genreId, query],
  );

  function selectMode(next: TmdbListKind) {
    setMode(next);
    setGenreId(0);
  }

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{heading}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {mediaType === 'movie' ? 'Explore popular and trending films' : 'Explore popular and trending series'}, with release dates, synopses and official trailers.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full sm:w-96">
          <label htmlFor="tmdb-browse-search" className={LABEL}>
            Search
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="tmdb-browse-search"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Search ${heading.toLowerCase()}`}
              className={`${INPUT} pl-11`}
            />
          </div>
        </div>
        {!query && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Sort titles">
            {(Object.keys(MODE_LABELS) as TmdbListKind[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option && genreId === 0}
                onClick={() => selectMode(option)}
                className={`${CHIP_BASE} ${chipClass(mode === option && genreId === 0)}`}
              >
                {MODE_LABELS[option]}
              </button>
            ))}
          </div>
        )}
      </div>

      {!query && genres.data && genres.data.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Genres">
          {[{ id: 0, name: 'All' }, ...genres.data].map((genre) => (
            <button
              key={genre.id}
              type="button"
              aria-pressed={genreId === genre.id}
              onClick={() => setGenreId(genre.id)}
              className={`${CHIP_BASE} ${chipClass(genreId === genre.id)}`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}

      {items.loading && <LoadingState label="Loading titles" />}
      {!items.loading && items.error && <TmdbErrorState error={items.error} onRetry={items.reload} />}
      {!items.loading && !items.error && items.data && items.data.length === 0 && (
        <EmptyState
          icon={<Clapperboard className="h-7 w-7 text-cinema-300" />}
          title={query ? `No results for "${query}"` : `No ${heading.toLowerCase()} to show`}
          description="Try a different search or genre."
        />
      )}
      {!items.loading && items.data && items.data.length > 0 && (
        <>
          <p className="text-sm text-slate-500">
            {items.data.length} {items.data.length === 1 ? 'title' : 'titles'}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {items.data.map((item) => (
              <TmdbCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

    </div>
  );
}
