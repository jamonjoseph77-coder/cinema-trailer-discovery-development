import { Play } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { isUpcoming, titleHref, titleMeta } from '@/lib/catalogue';
import type { Title } from '@/lib/types';
import { TITLE_TYPE_LABELS } from '@/lib/types';

interface TitleCardProps {
  title: Title;
  progress?: number;
  landscape?: boolean;
}

export function TitleCard({ title, progress, landscape = false }: TitleCardProps) {
  const upcoming = isUpcoming(title);
  const badge = upcoming ? 'Coming soon' : title.type === 'live' ? 'Live' : null;

  return (
    <a href={titleHref(title)} className="group block w-full" aria-label={`${title.title}, ${titleMeta(title)}`}>
      <div className={`relative ${landscape ? 'aspect-video' : 'aspect-[2/3]'} overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-cinema-400/50`}>
        <Artwork
          src={landscape ? title.backdrop_url || title.poster_url : title.poster_url}
          alt=""
          fallbackTitle={title.title}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/50 opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-cinema-600 text-white shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>
        {badge && (
          <span className="absolute left-2 top-2 rounded-md bg-cinema-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            {badge}
          </span>
        )}
        {progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" aria-hidden="true">
            <div className="h-full bg-cinema-400" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <p className="truncate text-sm font-semibold text-slate-100">{title.title}</p>
        <p className="truncate text-xs text-slate-400">{TITLE_TYPE_LABELS[title.type]}{title.release_year ? ` · ${title.release_year}` : ''}</p>
      </div>
    </a>
  );
}
