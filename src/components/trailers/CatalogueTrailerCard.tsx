import { Play } from 'lucide-react';
import { CatalogueSaveButton } from '@/components/trailers/CatalogueSaveButton';
import { ShareTrailerButton } from '@/components/trailers/ShareTrailerButton';
import { TrailerKindBadge } from '@/components/trailers/TrailerKindBadge';
import { trailerThumbnail } from '@/components/trailers/TrailerPlayer';
import { Artwork } from '@/components/ui/Artwork';
import { formatReleaseLabel, tmdbHref, tmdbImageUrl, type TmdbItem } from '@/lib/tmdb';
import type { Trailer } from '@/lib/trailers';

interface CatalogueTrailerCardProps {
  item: TmdbItem;
  trailer: Trailer;
  onPlay: (item: TmdbItem, trailer: Trailer) => void;
}

export function CatalogueTrailerCard({ item, trailer, onPlay }: CatalogueTrailerCardProps) {
  const image = tmdbImageUrl(item.backdropPath, 'w780') || trailerThumbnail(trailer);
  const typeLabel = item.mediaType === 'movie' ? 'Movie' : 'Series';
  const release = formatReleaseLabel(item);

  return (
    <article className="group">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10 transition duration-300 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-cinema-400/50">
        <button type="button" onClick={() => onPlay(item, trailer)} className="absolute inset-0 h-full w-full" aria-label={`Play ${item.title}: ${trailer.name}`}>
          <Artwork src={image} alt="" fallbackTitle={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink-950/70 text-white ring-1 ring-white/20 backdrop-blur transition group-hover:scale-110 group-hover:bg-cinema-600">
            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
          </span>
        </button>
        <TrailerKindBadge trailer={trailer} className="pointer-events-none absolute left-3 top-3" />
        <div className="absolute right-3 top-3 flex gap-2">
          <CatalogueSaveButton item={item} compact />
          <ShareTrailerButton item={item} trailer={trailer} compact />
        </div>
      </div>
      <div className="mt-3 flex gap-3 px-0.5">
        <a href={tmdbHref(item)} className="w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10" tabIndex={-1} aria-hidden="true">
          <div className="aspect-[2/3]">
            <Artwork src={tmdbImageUrl(item.posterPath, 'w185')} alt="" fallbackTitle={item.title} className="h-full w-full" />
          </div>
        </a>
        <div className="min-w-0">
          <a href={tmdbHref(item)} className="block truncate text-sm font-semibold text-slate-100 transition hover:text-cinema-300">
            {item.title}
          </a>
          <p className="truncate text-xs text-slate-400">
            {typeLabel}
            {release ? ` · ${release}` : ''}
          </p>
        </div>
      </div>
    </article>
  );
}
