import { useMemo, useState } from 'react';
import { ArrowRight, Megaphone, Search as SearchIcon } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { INPUT, PAGE_CONTAINER } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { groupByPublisher, publisherHref } from '@/lib/publishers';
import { fetchPublishedTitles } from '@/lib/library';
import { TITLE_TYPE_LABELS } from '@/lib/types';

export function PublishersPage() {
  const { data: titles, error, reload } = useAsyncData(fetchPublishedTitles, []);
  const [query, setQuery] = useState('');

  const publishers = useMemo(() => groupByPublisher(titles ?? []), [titles]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? publishers.filter((publisher) => publisher.name.toLowerCase().includes(needle)) : publishers;
  }, [publishers, query]);

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">
          <Megaphone className="h-4 w-4" /> Partners
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Publishers</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          The studios, broadcasters and production companies behind the stories on Cinema.
        </p>
      </header>

      {!titles && (error ? <ErrorState onRetry={reload} /> : <LoadingState />)}

      {titles && titles.length === 0 && (
        <EmptyState
          icon={<Megaphone className="h-7 w-7 text-cinema-300" />}
          title="No publishers yet"
          description="Publishers appear here once titles with a publisher name are published."
        />
      )}

      {titles && publishers.length > 0 && (
        <>
          <div className="relative max-w-md">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a publisher"
              aria-label="Find a publisher"
              className={`${INPUT} py-2.5 pl-11`}
            />
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-slate-400">No publishers match “{query.trim()}”.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((publisher) => {
                const types = [...new Set(publisher.titles.map((item) => item.type))];
                return (
                  <li key={publisher.name}>
                    <a
                      href={publisherHref(publisher.name)}
                      className="group flex h-full items-center gap-5 rounded-2xl border border-white/10 bg-ink-850/70 p-5 transition hover:-translate-y-0.5 hover:border-cinema-400/40 hover:shadow-2xl hover:shadow-black/40"
                    >
                      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cinema-600/20 text-2xl font-extrabold uppercase text-cinema-100 ring-1 ring-cinema-400/30">
                        {publisher.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="truncate text-lg font-extrabold text-white">{publisher.name}</p>
                        <p className="text-xs text-slate-400">
                          {publisher.titles.length} {publisher.titles.length === 1 ? 'title' : 'titles'}
                          {publisher.upcoming.length > 0 ? ` · ${publisher.upcoming.length} upcoming` : ''}
                        </p>
                        <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-cinema-300">
                          {types.map((type) => TITLE_TYPE_LABELS[type]).join(' · ')}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cinema-300" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
