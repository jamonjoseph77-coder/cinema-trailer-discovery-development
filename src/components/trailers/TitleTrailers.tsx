import { useState } from 'react';
import { Clapperboard, Play } from 'lucide-react';
import { TrailerKindBadge } from '@/components/trailers/TrailerKindBadge';
import { TrailerPlayer, trailerThumbnail } from '@/components/trailers/TrailerPlayer';
import { ShareTrailerButton } from '@/components/trailers/ShareTrailerButton';
import { Artwork } from '@/components/ui/Artwork';
import { tmdbImageUrl, type TmdbItem } from '@/lib/tmdb';
import type { Trailer } from '@/lib/trailers';

interface TitleTrailersProps {
  item: TmdbItem;
  trailers: Trailer[];
  initialKey?: string;
}

export function TitleTrailers({ item, trailers, initialKey }: TitleTrailersProps) {
  const [activeKey, setActiveKey] = useState(() => trailers.find((trailer) => trailer.key === initialKey)?.key ?? trailers[0]?.key);
  const active = trailers.find((trailer) => trailer.key === activeKey) ?? trailers[0];

  if (!active) {
    return (
      <section aria-labelledby="trailers-heading" className="space-y-4">
        <h2 id="trailers-heading" className="text-xl font-extrabold tracking-tight text-white">Trailers and videos</h2>
        <div className="flex items-start gap-4 rounded-2xl border border-dashed border-white/10 bg-ink-850/40 p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cinema-600/15 ring-1 ring-cinema-400/30">
            <Clapperboard className="h-5 w-5 text-cinema-300" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">No official trailer yet</p>
            <p className="text-sm leading-relaxed text-slate-400">
              We have not found an official trailer for {item.title}. Save it to your watchlist and check back closer to release.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const others = trailers.filter((trailer) => trailer.key !== active.key);
  const backdrop = active === trailers[0] ? tmdbImageUrl(item.backdropPath, 'w1280') : '';

  return (
    <section aria-labelledby="trailers-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 id="trailers-heading" className="text-xl font-extrabold tracking-tight text-white">Trailers and videos</h2>
          <p className="text-sm text-slate-400">Official promotional videos. Trailers are previews only, not the full {item.mediaType === 'movie' ? 'film' : 'series'}.</p>
        </div>
        <ShareTrailerButton item={item} trailer={active} />
      </div>

      <TrailerPlayer key={active.key} trailer={active} title={item.title} poster={backdrop} />

      {others.length > 0 && (
        <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" aria-label="More videos">
          {others.slice(0, 12).map((trailer) => (
            <li key={trailer.key} className="w-60 shrink-0 snap-start">
              <button type="button" onClick={() => setActiveKey(trailer.key)} className="group block w-full text-left" aria-label={`Play ${trailer.name}`}>
                <span className="relative block aspect-video overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10 transition group-hover:ring-cinema-400/50">
                  <Artwork src={trailerThumbnail(trailer)} alt="" fallbackTitle={trailer.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <TrailerKindBadge trailer={trailer} className="absolute left-2 top-2" />
                  <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-ink-950/80 text-white">
                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </span>
                </span>
                <span className="mt-2 block truncate text-sm font-medium text-slate-200">{trailer.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
