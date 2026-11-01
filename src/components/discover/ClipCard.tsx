import { Play } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { CLIP_KIND_LABEL, formatClipDuration, type DiscoverClip } from '@/lib/clips';
import { publisherHref } from '@/lib/publishers';

interface ClipCardProps {
  clip: DiscoverClip;
  onOpen: (clip: DiscoverClip) => void;
}

export function ClipCard({ clip, onOpen }: ClipCardProps) {
  const duration = formatClipDuration(clip.duration_seconds);

  return (
    <article className="group flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onOpen(clip)}
        aria-label={`Play ${CLIP_KIND_LABEL[clip.kind].toLowerCase()}: ${clip.headline}`}
        className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-ink-800 text-left ring-1 ring-white/5 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-cinema-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-300"
      >
        <Artwork
          src={clip.poster_url}
          alt=""
          fallbackTitle={clip.headline}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-cinema-500/90 text-white shadow-xl shadow-cinema-900/60">
            <Play className="h-6 w-6 fill-current" />
          </span>
        </span>
        <span className="absolute left-3 top-3 rounded-md bg-cinema-600 px-2 py-0.5 text-[11px] font-semibold text-white">
          {CLIP_KIND_LABEL[clip.kind]}
        </span>
        {duration && (
          <span className="absolute bottom-3 right-3 rounded-md bg-ink-950/85 px-2 py-0.5 text-xs font-semibold text-white">
            {duration}
          </span>
        )}
      </button>

      <div className="min-w-0 space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100">{clip.headline}</h3>
        <p className="truncate text-xs text-slate-400">
          {clip.publisher_name ? (
            <a href={publisherHref(clip.publisher_name)} className="transition hover:text-cinema-300">
              {clip.publisher_name}
            </a>
          ) : (
            'Cinema'
          )}
        </p>
        {clip.title && (
          <a href={`/title/${clip.title.id}`} className="block truncate text-xs font-semibold text-cinema-300 transition hover:text-white">
            From {clip.title.title}
          </a>
        )}
      </div>
    </article>
  );
}
