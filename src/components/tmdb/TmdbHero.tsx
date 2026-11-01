import { Info, Star } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchTmdbList, tmdbHref, tmdbImageUrl, tmdbYear, type TmdbItem } from '@/lib/tmdb';

export function TmdbHero() {
  const { data } = useAsyncData(() => fetchTmdbList('movie', 'trending'), []);
  const item: TmdbItem | undefined = data?.find((candidate) => candidate.backdropPath) ?? data?.[0];
  if (!item) return null;

  const backdrop = tmdbImageUrl(item.backdropPath, 'w1280') || tmdbImageUrl(item.posterPath, 'w500');
  const year = tmdbYear(item);

  return (
    <section
      aria-label="Trending this week"
      className="relative isolate h-[30rem] overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl shadow-black/40 sm:h-[34rem]"
    >
      <Artwork src={backdrop} alt="" fallbackTitle={item.title} className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-ink-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

      <div className="relative flex h-full max-w-2xl flex-col justify-end gap-4 p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-cinema-400/40 bg-cinema-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cinema-100">
            Trending this week
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            Movie{year ? ` · ${year}` : ''}
          </p>
          {item.rating !== null && (
            <p className="flex items-center gap-1 text-xs font-semibold text-amber-300">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {item.rating.toFixed(1)}
            </p>
          )}
        </div>
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">{item.title}</h1>
        {item.overview && <p className="line-clamp-3 text-sm leading-relaxed text-slate-300 sm:text-base">{item.overview}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={tmdbHref(item)} className={BUTTON_PRIMARY}>
            <Info className="h-4 w-4" />
            View details
          </a>
          <a href="/movies" className={BUTTON_SECONDARY}>
            Browse movies
          </a>
        </div>
      </div>
    </section>
  );
}
