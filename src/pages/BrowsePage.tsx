import { useMemo, useState } from 'react';
import { TitleGrid } from '@/components/catalogue/TitleGrid';
import { ErrorState, EmptyState, LoadingState } from '@/components/ui/StatusViews';
import { CHIP_BASE, INPUT, LABEL, PAGE_CONTAINER, chipClass } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { genresOf, hasGenre, matchesQuery, SORT_LABELS, sortTitles, type SortOption } from '@/lib/catalogue';
import { fetchPublishedTitles } from '@/lib/library';
import type { TitleType } from '@/lib/types';
import { Clapperboard } from 'lucide-react';

type LocalBrowseKind = Exclude<TitleType, 'movie' | 'series'>;

const COPY: Record<LocalBrowseKind, { heading: string; intro: string; empty: string }> = {
  sport: {
    heading: 'Sports',
    intro: 'Matches, highlights and sports programmes.',
    empty: 'No sports titles are published yet. Live fixtures and highlights will be listed here when they are available.',
  },
  live: {
    heading: 'Live TV',
    intro: 'Channels and live events streaming on Cinema.',
    empty: 'No live channels are running right now. Live streams will appear here when they are connected.',
  },
  news: {
    heading: 'News',
    intro: 'Bulletins and current affairs programming.',
    empty: 'No news programmes are published yet. Bulletins will appear here as they go live.',
  },
};

const ALL_GENRES = 'All';

export function BrowsePage({ kind }: { kind: LocalBrowseKind }) {
  const { data: titles, error, reload } = useAsyncData(fetchPublishedTitles, []);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState(ALL_GENRES);
  const [sort, setSort] = useState<SortOption>('newest');
  const copy = COPY[kind];

  const ofType = useMemo(() => (titles ?? []).filter((title) => title.type === kind), [titles, kind]);
  const genres = useMemo(() => genresOf(ofType), [ofType]);
  const visible = useMemo(
    () =>
      sortTitles(
        ofType.filter(
          (title) => (genre === ALL_GENRES || hasGenre(title, genre)) && matchesQuery(title, query),
        ),
        sort,
      ),
    [ofType, genre, query, sort],
  );

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{copy.heading}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{copy.intro}</p>
      </header>

      {!titles && (error ? <ErrorState onRetry={reload} /> : <LoadingState />)}

      {titles && ofType.length === 0 && (
        <EmptyState
          icon={<Clapperboard className="h-7 w-7 text-cinema-300" />}
          title={`${copy.heading} coming soon`}
          description={copy.empty}
        />
      )}

      {titles && ofType.length > 0 && (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="w-full sm:w-72">
                <label htmlFor="browse-filter" className={LABEL}>
                  Filter
                </label>
                <input
                  id="browse-filter"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Filter ${copy.heading.toLowerCase()}`}
                  className={INPUT}
                />
              </div>
              <div className="w-full sm:w-52">
                <label htmlFor="browse-sort" className={LABEL}>
                  Sort by
                </label>
                <select
                  id="browse-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className={INPUT}
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <option key={option} value={option}>
                      {SORT_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Genres">
              {[ALL_GENRES, ...genres].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={genre === item}
                  onClick={() => setGenre(item)}
                  className={`${CHIP_BASE} ${chipClass(genre === item)}`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-ink-850/60 p-8 text-center text-sm text-slate-400">
              Nothing matches those filters. Try a different genre or clear the search.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {visible.length} {visible.length === 1 ? 'title' : 'titles'}
              </p>
              <TitleGrid titles={visible} />
            </>
          )}
        </>
      )}
    </div>
  );
}
