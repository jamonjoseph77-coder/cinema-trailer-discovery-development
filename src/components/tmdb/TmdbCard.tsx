import { Star } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { tmdbHref, tmdbImageUrl, tmdbYear, type TmdbItem } from '@/lib/tmdb';

export function TmdbCard({ item, landscape = false }: { item: TmdbItem; landscape?: boolean }) {
  const typeLabel = item.mediaType === 'movie' ? 'Movie' : 'Series';
  const year = tmdbYear(item);
  const image = landscape
    ? tmdbImageUrl(item.backdropPath, 'w780') || tmdbImageUrl(item.posterPath, 'w342')
    : tmdbImageUrl(item.posterPath, 'w342');

  return (
    <a href={tmdbHref(item)} className="group block w-full" aria-label={`${item.title}, ${typeLabel}${year ? `, ${year}` : ''}`}>
      <div
        className={`relative ${landscape ? 'aspect-video' : 'aspect-[2/3]'} overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-cinema-400/50`}
      >
        <Artwork
          src={image}
          alt=""
          fallbackTitle={item.title}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        {item.rating !== null && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-ink-950/80 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            {item.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <p className="truncate text-sm font-semibold text-slate-100">{item.title}</p>
        <p className="truncate text-xs text-slate-400">
          {typeLabel}
          {year ? ` · ${year}` : ''}
        </p>
      </div>
    </a>
  );
}
