import type { ReactNode } from 'react';
import { TmdbCard } from '@/components/tmdb/TmdbCard';
import { TmdbErrorState } from '@/components/tmdb/TmdbErrorState';
import { LoadingState } from '@/components/ui/StatusViews';
import { SECTION_HEADING } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchTmdbList, type TmdbListKind, type TmdbMediaType } from '@/lib/tmdb';

interface TmdbRowProps {
  heading: string;
  description: string;
  mediaType: TmdbMediaType;
  list: TmdbListKind;
  action?: ReactNode;
}

export function TmdbRow({ heading, description, mediaType, list, action }: TmdbRowProps) {
  const { data: items, error, reload } = useAsyncData(() => fetchTmdbList(mediaType, list), [mediaType, list]);

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className={`${SECTION_HEADING} flex items-center gap-3`}>
            <span className="h-6 w-1 shrink-0 rounded-full bg-cinema-400" aria-hidden="true" />
            {heading}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        {action}
      </div>

      {!items && !error && <LoadingState label="Loading titles" />}
      {!items && error && <TmdbErrorState error={error} onRetry={reload} />}
      {items && items.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-ink-850/60 p-6 text-center text-sm text-slate-400">
          No titles are available right now.
        </p>
      )}
      {items && items.length > 0 && (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <div key={`${item.mediaType}-${item.id}`} className="w-36 flex-none snap-start sm:w-44 lg:w-48">
              <TmdbCard item={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
