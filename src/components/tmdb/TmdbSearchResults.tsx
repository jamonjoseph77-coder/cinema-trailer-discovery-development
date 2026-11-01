import { TmdbCard } from '@/components/tmdb/TmdbCard';
import { TmdbErrorState } from '@/components/tmdb/TmdbErrorState';
import { LoadingState } from '@/components/ui/StatusViews';
import { SECTION_HEADING } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { searchTmdb, type TmdbItem, type TmdbMediaType } from '@/lib/tmdb';

function ResultGroup({ heading, items }: { heading: string; items: TmdbItem[] }) {
  return (
    <section className="space-y-5">
      <h2 className={SECTION_HEADING}>{heading}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <TmdbCard key={`${item.mediaType}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export function TmdbSearchResults({ query }: { query: string }) {
  const { data, error, loading, reload } = useAsyncData(
    () => Promise.all((['movie', 'tv'] as TmdbMediaType[]).map((type) => searchTmdb(type, query))),
    [query],
  );

  if (loading) return <LoadingState label="Searching movies and series" />;
  if (error) return <TmdbErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  const [movies, series] = data;
  if (movies.length === 0 && series.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-ink-850/60 p-8 text-center text-sm text-slate-400">
        No movies or series match &quot;{query}&quot;.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {movies.length > 0 && <ResultGroup heading="Movies" items={movies} />}
      {series.length > 0 && <ResultGroup heading="Series" items={series} />}
    </div>
  );
}
