import { useState } from 'react';
import { Play } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { trailerLabel, type Trailer } from '@/lib/trailers';

export function trailerThumbnail(trailer: Trailer): string {
  return `https://i.ytimg.com/vi/${trailer.key}/hqdefault.jpg`;
}

export function trailerEmbedUrl(trailer: Trailer, autoplay: boolean): string {
  const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.youtube-nocookie.com/embed/${trailer.key}?${params.toString()}`;
}

/** Loads the official video only after the viewer chooses to play it, keeping pages light on mobile. */
export function TrailerPlayer({ trailer, title, poster }: { trailer: Trailer; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  const label = `${title}: ${trailer.name}`;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      {playing ? (
        <iframe
          key={trailer.key}
          src={trailerEmbedUrl(trailer, true)}
          title={label}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full text-left" aria-label={`Play ${label}`}>
          <Artwork src={poster || trailerThumbnail(trailer)} alt="" fallbackTitle={title} className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cinema-600 text-white shadow-2xl shadow-black/60 ring-4 ring-white/10 transition group-hover:scale-110 group-hover:bg-cinema-500">
            <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
          </span>
          <span className="absolute bottom-4 left-4 right-4 space-y-1">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">{trailerLabel(trailer)}</span>
            <span className="block truncate text-sm font-semibold text-white sm:text-base">{trailer.name}</span>
          </span>
        </button>
      )}
    </div>
  );
}
