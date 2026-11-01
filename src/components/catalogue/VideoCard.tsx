import { Play } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { isUpcoming, titleHref, titleMeta } from '@/lib/catalogue';
import { formatDuration } from '@/lib/format';
import { publisherHref } from '@/lib/publishers';
import type { Title } from '@/lib/types';

interface VideoCardProps {
  title: Title;
  onTrailer: (title: Title) => void;
}

export function VideoCard({ title, onTrailer }: VideoCardProps) {
  const upcoming = isUpcoming(title);
  const runtime = formatDuration(title.duration_minutes);
  const hasTrailer = title.trailer_url.trim() !== '';
  const publisher = title.publisher || 'Cinema';

  return (
    <article className="group flex flex-col gap-3">
      <a
        href={titleHref(title)}
        aria-label={`${title.title}, ${titleMeta(title)}`}
        className="relative block aspect-video overflow-hidden rounded-2xl bg-ink-800 ring-1 ring-white/5 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-cinema-400/40"
      >
        <Artwork
          src={title.backdrop_url || title.poster_url}
          alt=""
          fallbackTitle={title.title}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-cinema-500/90 text-white shadow-xl shadow-cinema-900/60">
            <Play className="h-6 w-6 fill-current" />
          </span>
        </span>
        {upcoming && (
          <span className="absolute left-3 top-3 rounded-md bg-cinema-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            Coming soon
          </span>
        )}
        {runtime && (
          <span className="absolute bottom-3 right-3 rounded-md bg-ink-950/85 px-2 py-0.5 text-xs font-semibold text-white">
            {runtime}
          </span>
        )}
      </a>

      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cinema-600/25 text-sm font-extrabold uppercase text-cinema-100 ring-1 ring-cinema-400/30"
        >
          {publisher.charAt(0)}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <a href={titleHref(title)} className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100 transition hover:text-white">
            {title.title}
          </a>
          <p className="truncate text-xs text-slate-400">
            {title.publisher ? (
              <a href={publisherHref(title.publisher)} className="transition hover:text-cinema-300">
                {publisher}
              </a>
            ) : (
              publisher
            )}
          </p>
          <p className="truncate text-xs text-slate-500">{titleMeta(title)}</p>
          {hasTrailer && (
            <button
              type="button"
              onClick={() => onTrailer(title)}
              className="pt-1 text-xs font-semibold text-cinema-300 transition hover:text-white"
            >
              Watch trailer
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
