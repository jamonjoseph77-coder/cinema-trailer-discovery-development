import { Search as SearchIcon } from 'lucide-react';
import { ContinueWatchingRow } from '@/components/catalogue/ContinueWatchingRow';
import { HeroBanner } from '@/components/catalogue/HeroBanner';
import { TitleRow } from '@/components/catalogue/TitleRow';
import { TmdbHero } from '@/components/tmdb/TmdbHero';
import { TmdbRow } from '@/components/tmdb/TmdbRow';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, PAGE_CONTAINER } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import {
  comingSoonTitles,
  featuredTitles,
  progressRatioByTitle,
  resumeItems,
  titlesOfType,
} from '@/lib/catalogue';
import { fetchPublishedTitles } from '@/lib/library';
import { useMemo } from 'react';

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="whitespace-nowrap text-sm font-semibold text-cinema-300 transition hover:text-white">
      {label}
    </a>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const { progress } = useLibrary();
  const { data: titles, error, reload } = useAsyncData(fetchPublishedTitles, []);

  const view = useMemo(() => {
    if (!titles) return null;
    const featured = featuredTitles(titles);
    return {
      hero: (featured.length > 0 ? featured : titles).slice(0, 5),
      recent: titles.slice(0, 12),
      upcoming: comingSoonTitles(titles),
      movies: titlesOfType(titles, 'movie'),
      series: titlesOfType(titles, 'series'),
      live: titlesOfType(titles, 'live'),
      sports: titlesOfType(titles, 'sport'),
      news: titlesOfType(titles, 'news'),
      resume: resumeItems(progress, titles),
      ratios: progressRatioByTitle(progress),
    };
  }, [titles, progress]);

  if (!view) {
    return <div className={PAGE_CONTAINER}>{error ? <ErrorState onRetry={reload} /> : <LoadingState />}</div>;
  }

  return (
    <div className={`${PAGE_CONTAINER} space-y-14`}>
      {view.hero.length > 0 ? <HeroBanner titles={view.hero} /> : <TmdbHero />}

      {!user && (
        <div className="flex flex-col gap-4 rounded-2xl border border-cinema-400/20 bg-cinema-600/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-200">
            Sign in to build your watchlist, save favourites and pick up where you left off.
          </p>
          <a href="/sign-in" className={`${BUTTON_PRIMARY} shrink-0 px-4 py-2.5`}>
            Sign in
          </a>
        </div>
      )}

      <ContinueWatchingRow items={view.resume} />
      <TitleRow heading="Recently added" description="The newest stories on Cinema." titles={view.recent} progressById={view.ratios} />
      <TitleRow heading="Coming soon" description="Scheduled releases." titles={view.upcoming} />
      <TitleRow heading="Movies" titles={view.movies} progressById={view.ratios} action={<SeeAll href="/movies" label="See all" />} />
      <TitleRow heading="Series" titles={view.series} progressById={view.ratios} action={<SeeAll href="/series" label="See all" />} />
      <TitleRow heading="Live TV" titles={view.live} landscape action={<SeeAll href="/live-tv" label="See all" />} />
      <TitleRow heading="Sports" titles={view.sports} landscape action={<SeeAll href="/sports" label="See all" />} />
      <TitleRow heading="News" titles={view.news} action={<SeeAll href="/news" label="See all" />} />

      <TmdbRow heading="Trending movies" description="The films everyone is talking about this week." mediaType="movie" list="trending" action={<SeeAll href="/movies" label="See all" />} />
      <TmdbRow heading="Trending series" description="The series everyone is watching this week." mediaType="tv" list="trending" action={<SeeAll href="/series" label="See all" />} />
      <TmdbRow heading="Popular movies" description="Audience favourites across the catalogue." mediaType="movie" list="popular" action={<SeeAll href="/movies" label="See all" />} />
      <TmdbRow heading="Popular series" description="Series audiences keep coming back to." mediaType="tv" list="popular" action={<SeeAll href="/series" label="See all" />} />

      <a
        href="/search"
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-850/60 p-5 text-sm text-slate-400 transition hover:border-cinema-400/40 hover:text-slate-200"
      >
        <SearchIcon className="h-4 w-4 text-cinema-300" />
        Looking for something specific? Search the whole catalogue.
      </a>
    </div>
  );
}
