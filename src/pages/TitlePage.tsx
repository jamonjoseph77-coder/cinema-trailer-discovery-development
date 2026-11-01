import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Film, Play, Radio } from 'lucide-react';
import { EpisodeList } from '@/components/title/EpisodeList';
import { TitleActions } from '@/components/title/TitleActions';
import { VideoDialog } from '@/components/player/VideoDialog';
import { titleTrailerSource } from '@/lib/videoSource';
import { TitleRow } from '@/components/catalogue/TitleRow';
import { Artwork } from '@/components/ui/Artwork';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, PAGE_CONTAINER, SECTION_HEADING } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useLibrary } from '@/hooks/useLibrary';
import { relatedTitles, titleMeta } from '@/lib/catalogue';
import { formatDuration } from '@/lib/format';
import { publisherHref } from '@/lib/publishers';
import { fetchPublishedTitles, fetchTitleDetail } from '@/lib/library';
import { TITLE_TYPE_LABELS, type TitleType } from '@/lib/types';
import { NotFoundPage } from '@/pages/NotFoundPage';

const BROWSE_PATH: Record<TitleType, string> = {
  movie: 'movies',
  series: 'series',
  sport: 'sports',
  live: 'live-tv',
  news: 'news',
};

export function TitlePage({ titleId }: { titleId: string }) {
  const { progress } = useLibrary();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { data, error, reload } = useAsyncData(async () => {
    const [detail, published] = await Promise.all([fetchTitleDetail(titleId), fetchPublishedTitles()]);
    return { ...detail, published };
  }, [titleId]);

  const related = useMemo(
    () => (data?.title ? relatedTitles(data.published, data.title) : []),
    [data],
  );

  if (!data) {
    return <div className={PAGE_CONTAINER}>{error ? <ErrorState onRetry={reload} /> : <LoadingState />}</div>;
  }

  const { title, seasons } = data;
  if (!title) return <NotFoundPage />;

  const firstEpisode = seasons.flatMap((season) => season.episodes).find((episode) => episode.playback_url.trim() !== '');
  const savedProgress = progress.find((entry) => entry.content_id === title.id);
  const canResume = savedProgress && !savedProgress.completed && savedProgress.position_seconds > 5;

  let primary: ReactNode;
  if (title.type === 'series') {
    primary = firstEpisode ? (
      <a href={`/watch/${title.id}?ep=${firstEpisode.id}`} className={BUTTON_PRIMARY}>
        <Play className="h-4 w-4 fill-current" /> Play first episode
      </a>
    ) : (
      <span className="text-sm text-slate-400">Episodes are not available yet.</span>
    );
  } else if (title.playback_url.trim() !== '') {
    primary = (
      <a href={`/watch/${title.id}`} className={BUTTON_PRIMARY}>
        {title.type === 'live' ? <Radio className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        {title.type === 'live' ? 'Watch live' : canResume ? 'Resume' : 'Play'}
      </a>
    );
  } else {
    primary = <span className="text-sm text-slate-400">This title is not available to watch yet.</span>;
  }

  const runtime = formatDuration(title.duration_minutes);

  return (
    <div className="animate-fade-in">
      <section className="relative isolate overflow-hidden border-b border-white/5">
        <Artwork
          src={title.backdrop_url || title.poster_url}
          alt=""
          fallbackTitle={title.title}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-top opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
        <div className={`${PAGE_CONTAINER} flex min-h-[26rem] items-end gap-8 pb-10 pt-16 sm:pt-24`}>
          <Artwork
            src={title.poster_url}
            alt={`${title.title} poster`}
            fallbackTitle={title.title}
            className="hidden aspect-[2/3] w-48 flex-none rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10 md:block lg:w-56"
          />
          <div className="max-w-2xl space-y-5">
            <a href={`/${BROWSE_PATH[title.type]}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> {TITLE_TYPE_LABELS[title.type]}
            </a>
            {!title.is_published && (
              <p className="inline-block rounded-md bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
                Draft: only administrators can see this title
              </p>
            )}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{title.title}</h1>
            <p className="text-sm text-slate-300">
              {[title.release_year, runtime, title.genre].filter(Boolean).join(' · ')}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {primary}
              {title.trailer_url.trim() !== '' && (
                <button type="button" onClick={() => setTrailerOpen(true)} className={BUTTON_SECONDARY}>
                  <Film className="h-4 w-4" /> Trailer
                </button>
              )}
              <TitleActions title={title} />
            </div>
          </div>
        </div>
      </section>

      <div className={`${PAGE_CONTAINER} space-y-14`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-10">
            <section className="space-y-4">
              <h2 className={SECTION_HEADING}>About this title</h2>
              <p className="max-w-3xl text-base leading-relaxed text-slate-300">
                {title.synopsis || 'A synopsis has not been added for this title yet.'}
              </p>
            </section>

            {title.type === 'series' && (
              <section className="space-y-5">
                <h2 className={SECTION_HEADING}>Episodes</h2>
                <EpisodeList titleId={title.id} seasons={seasons} />
              </section>
            )}
          </div>

          <aside className={`${CARD} h-fit space-y-4 text-sm`} aria-label="Title details">
            <DetailRow label="Type" value={TITLE_TYPE_LABELS[title.type]} />
            <DetailRow label="Publisher" value={title.publisher} href={title.publisher ? publisherHref(title.publisher) : undefined} />
            <DetailRow label="Release date" value={title.release_date ? new Date(title.release_date).toLocaleDateString() : title.release_year ? String(title.release_year) : ''} />
            <DetailRow label="Runtime" value={runtime} />
            <DetailRow label="Genre" value={title.genre} />
            <DetailRow label="Availability" value={title.availability} />
            <p className="pt-2 text-xs text-slate-500">{titleMeta(title)}</p>
          </aside>
        </div>

        <TitleRow heading="More like this" titles={related} />
      </div>

      {trailerOpen && <VideoDialog {...titleTrailerSource(title)} onClose={() => setTrailerOpen(false)} />}
    </div>
  );
}

function DetailRow({ label, value, href }: { label: string; value: string; href?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      {href ? (
        <a href={href} className="text-right font-semibold text-cinema-300 transition hover:text-white">{value}</a>
      ) : (
        <span className="text-right font-semibold text-slate-100">{value}</span>
      )}
    </div>
  );
}
