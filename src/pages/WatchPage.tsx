import { useMemo } from 'react';
import { ArrowLeft, Clapperboard } from 'lucide-react';
import { EpisodeList } from '@/components/title/EpisodeList';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { ErrorState, EmptyState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, PAGE_CONTAINER, CARD } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { fetchTitleDetail } from '@/lib/library';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { Episode, SeasonWithEpisodes, Title } from '@/lib/types';

interface PlayableEpisode extends Episode {
  seasonNumber: number;
}

function findCurrentEpisode(seasons: SeasonWithEpisodes[], title: Title, episodeId: string | null): PlayableEpisode | null | 'missing' {
  const episodes: PlayableEpisode[] = seasons.flatMap((season) =>
    season.episodes.map((episode) => ({ ...episode, seasonNumber: season.number })),
  );
  if (episodeId) {
    const requested = episodes.find((episode) => episode.id === episodeId);
    return requested ?? 'missing';
  }
  if (title.type === 'series') {
    return episodes.find((episode) => episode.playback_url.trim() !== '') ?? null;
  }
  return null;
}

export function WatchPage({ titleId, episodeId }: { titleId: string; episodeId: string | null }) {
  const { user } = useAuth();
  const { progress, saveProgress } = useLibrary();
  const { data, error, reload } = useAsyncData(() => fetchTitleDetail(titleId), [titleId]);

  const current = useMemo(
    () => (data?.title ? findCurrentEpisode(data.seasons, data.title, episodeId) : null),
    [data, episodeId],
  );

  if (!data) {
    return <div className={PAGE_CONTAINER}>{error ? <ErrorState onRetry={reload} /> : <LoadingState />}</div>;
  }

  const { title, seasons } = data;
  if (!title) return <NotFoundPage />;

  if (current === 'missing') {
    return (
      <div className={PAGE_CONTAINER}>
        <EmptyState
          icon={<Clapperboard className="h-7 w-7 text-cinema-300" />}
          title="This episode is not available"
          description="It may have been removed or is not published yet."
          action={
            <a href={`/title/${title.id}`} className={BUTTON_PRIMARY}>
              Back to {title.title}
            </a>
          }
        />
      </div>
    );
  }

  const episode = current;
  const source = episode ? episode.playback_url : title.playback_url;
  const contentId = episode?.id ?? title.id;
  const saved = progress.find((entry) => entry.content_id === contentId);
  const startAt = saved && !saved.completed ? saved.position_seconds : 0;
  const subtitle = episode ? undefined : title.subtitle_url || undefined;
  const subheading = episode
    ? `Season ${episode.seasonNumber}, Episode ${episode.number}: ${episode.title}`
    : [title.genre, title.release_year].filter(Boolean).join(' · ');

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <a href={`/title/${title.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to {title.title}
      </a>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {source.trim() ? (
            <VideoPlayer
              key={contentId}
              src={source}
              title={episode ? `${title.title}: ${episode.title}` : title.title}
              poster={title.backdrop_url || title.poster_url || undefined}
              subtitleUrl={subtitle}
              startAt={startAt}
              isLive={title.type === 'live'}
              onProgress={(playback) =>
                void saveProgress({
                  content_id: contentId,
                  title_id: title.id,
                  position_seconds: playback.position,
                  duration_seconds: playback.duration,
                  completed: playback.completed,
                })
              }
            />
          ) : (
            <EmptyState
              icon={<Clapperboard className="h-7 w-7 text-cinema-300" />}
              title="Nothing to play yet"
              description="A playback link has not been added for this title. It will appear here once it is connected."
            />
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title.title}</h1>
            {subheading && <p className="text-sm text-slate-400">{subheading}</p>}
            {!user && (
              <p className="pt-2 text-xs text-slate-500">
                <a href="/sign-in" className="font-semibold text-cinema-300 hover:text-white">Sign in</a> to resume where you left off on any device.
              </p>
            )}
          </div>
        </div>

        {title.type === 'series' && (
          <aside className={`${CARD} h-fit space-y-4`}>
            <h2 className="text-lg font-extrabold text-white">Episodes</h2>
            <EpisodeList titleId={title.id} seasons={seasons} currentEpisodeId={episode?.id ?? null} />
          </aside>
        )}
      </div>
    </div>
  );
}
