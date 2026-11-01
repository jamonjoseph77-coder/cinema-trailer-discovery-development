import { Play } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import type { DiscoverClip } from '@/lib/clips';

interface ShortCardProps {
  clip: DiscoverClip;
  onOpen: (clip: DiscoverClip) => void;
}

export function ShortCard({ clip, onOpen }: ShortCardProps) {
  return (
    <article className="group w-44 shrink-0 snap-start sm:w-52">
      <button
        type="button"
        onClick={() => onOpen(clip)}
        aria-label={`Play short: ${clip.headline}`}
        className="relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-ink-800 text-left ring-1 ring-white/5 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-cinema-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-300"
      >
        <Artwork
          src={clip.poster_url}
          alt=""
          fallbackTitle={clip.headline}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" aria-hidden="true" />
        <span className="absolute left-3 top-3 rounded-md bg-cinema-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          Short
        </span>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink-950/80 text-white opacity-0 transition group-hover:opacity-100" aria-hidden="true">
          <Play className="h-4 w-4 fill-current" />
        </span>
        <span className="absolute inset-x-3 bottom-3 space-y-1">
          <span className="line-clamp-2 block text-sm font-semibold leading-snug text-white">{clip.headline}</span>
          {clip.publisher_name && <span className="block truncate text-xs text-slate-300">{clip.publisher_name}</span>}
        </span>
      </button>
    </article>
  );
}
