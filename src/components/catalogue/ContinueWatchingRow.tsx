import { Play } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { formatClock } from '@/lib/format';
import { resumeHref, type ResumeItem } from '@/lib/catalogue';
import { SECTION_HEADING } from '@/components/ui/styles';

export function ContinueWatchingRow({ items }: { items: ResumeItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-5">
      <h2 className={SECTION_HEADING}>Continue watching</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const ratio =
            item.progress.duration_seconds > 0
              ? Math.min(1, item.progress.position_seconds / item.progress.duration_seconds)
              : 0;
          return (
            <a
              key={item.progress.content_id}
              href={resumeHref(item)}
              className="group w-72 flex-none snap-start sm:w-80"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-cinema-400/50">
                <Artwork
                  src={item.title.backdrop_url || item.title.poster_url}
                  alt=""
                  fallbackTitle={item.title.title}
                  className="h-full w-full transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-ink-950/30 transition group-hover:bg-ink-950/50">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-cinema-600 text-white shadow-lg">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" aria-hidden="true">
                  <div className="h-full bg-cinema-400" style={{ width: `${Math.round(ratio * 100)}%` }} />
                </div>
              </div>
              <div className="mt-3">
                <p className="truncate text-sm font-semibold text-slate-100">{item.title.title}</p>
                <p className="text-xs text-slate-400">
                  {formatClock(item.progress.position_seconds)} watched · {Math.round(ratio * 100)}%
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
