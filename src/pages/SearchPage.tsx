import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { TitleGrid } from '@/components/catalogue/TitleGrid';
import { TmdbSearchResults } from '@/components/tmdb/TmdbSearchResults';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, INPUT, PAGE_CONTAINER, LABEL } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { genresOf, matchesQuery } from '@/lib/catalogue';
import { fetchPublishedTitles } from '@/lib/library';
import { navigateTo } from '@/lib/router';

export function SearchPage({ query }: { query: string }) {
  const { data: titles, error, reload } = useAsyncData(fetchPublishedTitles, []);
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const results = useMemo(
    () => (titles ?? []).filter((title) => matchesQuery(title, query)),
    [titles, query],
  );
  const suggestions = useMemo(() => genresOf(titles ?? []).slice(0, 8), [titles]);
  const trimmed = query.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateTo(`/search?q=${encodeURIComponent(draft.trim())}`);
  }

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <header className="space-y-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Search</h1>
        <form onSubmit={handleSubmit} role="search" className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <label htmlFor="search-page-input" className="sr-only">
              Search titles
            </label>
            <input
              id="search-page-input"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Titles, genres, publishers..."
              className={`${INPUT} py-3.5 pl-11`}
            />
          </div>
          <button type="submit" className={BUTTON_PRIMARY}>
            Search
          </button>
        </form>
      </header>

      {!titles && (error ? <ErrorState onRetry={reload} /> : <LoadingState />)}

      {titles && !trimmed && (
        <section className="space-y-4">
          <p className={LABEL}>Browse by genre</p>
          {suggestions.length === 0 ? (
            <p className="text-sm text-slate-400">Search by title, genre, synopsis or publisher once content is published.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((genre) => (
                <a
                  key={genre}
                  href={`/search?q=${encodeURIComponent(genre)}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cinema-400/40 hover:text-white"
                >
                  {genre}
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {titles && trimmed && results.length === 0 && (
        <p className="text-sm text-slate-400">No Cinema titles match &quot;{trimmed}&quot;.</p>
      )}

      {titles && trimmed && results.length > 0 && (
        <section className="space-y-5">
          <p className="text-sm text-slate-400">
            {results.length} {results.length === 1 ? 'result' : 'results'} for <span className="font-semibold text-slate-200">"{trimmed}"</span>
          </p>
          <TitleGrid titles={results} />
        </section>
      )}

      {trimmed && (
        <section className="space-y-6">
          <p className={LABEL}>Across the Cinema catalogue</p>
          <TmdbSearchResults query={trimmed} />
        </section>
      )}
    </div>
  );
}
