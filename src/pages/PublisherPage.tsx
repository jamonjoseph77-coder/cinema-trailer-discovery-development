import { useMemo, useState } from 'react';
import { ArrowLeft, BellPlus, BellRing, Megaphone } from 'lucide-react';
import { TitleGrid } from '@/components/catalogue/TitleGrid';
import { TitleRow } from '@/components/catalogue/TitleRow';
import { VideoCard } from '@/components/catalogue/VideoCard';
import { VideoDialog } from '@/components/player/VideoDialog';
import { titleTrailerSource } from '@/lib/videoSource';
import { Artwork } from '@/components/ui/Artwork';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, PAGE_CONTAINER, SECTION_HEADING } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { fetchPublishedTitles } from '@/lib/library';
import { findPublisher } from '@/lib/publishers';
import { fetchFollowedPublishers, followPublisher, unfollowPublisher } from '@/lib/publisherFollows';
import type { Title } from '@/lib/types';

export function PublisherPage({ publisher }: { publisher: string }) {
  const { data: titles, error, reload } = useAsyncData(fetchPublishedTitles, []);
  const [trailerTitle, setTrailerTitle] = useState<Title | null>(null);
  const { user } = useAuth();
  const { notify } = useToast();
  const follows = useAsyncData(
    () => (user ? fetchFollowedPublishers(user.id) : Promise.resolve([] as string[])),
    [user?.id],
  );
  const [followBusy, setFollowBusy] = useState(false);

  const profile = useMemo(() => (titles ? findPublisher(titles, publisher) : null), [titles, publisher]);

  if (!titles) {
    return <div className={PAGE_CONTAINER}>{error ? <ErrorState onRetry={reload} /> : <LoadingState />}</div>;
  }

  if (!profile) {
    return (
      <div className={PAGE_CONTAINER}>
        <EmptyState
          icon={<Megaphone className="h-7 w-7 text-cinema-300" />}
          title="Publisher not found"
          description="This publisher has no published titles on Cinema yet."
          action={
            <a href="/publishers" className={BUTTON_SECONDARY}>
              <ArrowLeft className="h-4 w-4" /> All publishers
            </a>
          }
        />
      </div>
    );
  }

  const cover = profile.titles.find((item) => item.backdrop_url)?.backdrop_url ?? '';
  const isFollowing = follows.data?.includes(profile.name) ?? false;

  async function toggleFollow() {
    if (!user || !profile || followBusy) return;
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await unfollowPublisher(user.id, profile.name);
      } else {
        await followPublisher(user.id, profile.name);
      }
      follows.reload();
    } catch {
      notify('We could not update your follow. Please try again.', 'error');
    } finally {
      setFollowBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full animate-rise-in space-y-14 pb-10">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-ink-900">
        <div className="absolute inset-0">
          <Artwork src={cover} alt="" fallbackTitle={profile.name} className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
        </div>
        <div className="relative mx-auto max-w-7xl space-y-5 px-4 pb-10 pt-8 sm:px-6 lg:px-10 lg:pt-12">
          <a href="/publishers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All publishers
          </a>
          <div className="flex items-end gap-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-cinema-600 text-3xl font-extrabold uppercase text-white shadow-2xl shadow-cinema-900/60 ring-2 ring-cinema-300/30 sm:h-24 sm:w-24">
              {profile.name.charAt(0)}
            </span>
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">Publisher</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{profile.name}</h1>
              <p className="text-sm text-slate-300">
                {profile.titles.length} {profile.titles.length === 1 ? 'title' : 'titles'}
                {profile.upcoming.length > 0 ? ` · ${profile.upcoming.length} upcoming` : ''}
                {profile.trailers.length > 0 ? ` · ${profile.trailers.length} with trailers` : ''}
              </p>
              {!user && (
                <a href="/sign-in" className={BUTTON_SECONDARY}>
                  <BellPlus className="h-4 w-4" /> Sign in to follow
                </a>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => void toggleFollow()}
                  disabled={followBusy || follows.loading}
                  aria-pressed={isFollowing}
                  className={isFollowing ? BUTTON_SECONDARY : BUTTON_PRIMARY}
                >
                  {isFollowing ? <BellRing className="h-4 w-4" /> : <BellPlus className="h-4 w-4" />}
                  {isFollowing ? 'Following' : 'Follow publisher'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-14 px-4 sm:px-6 lg:px-10">
        {profile.upcoming.length > 0 && <TitleRow heading="Upcoming releases" titles={profile.upcoming} />}

        {profile.trailers.length > 0 && (
          <section className="space-y-5">
            <h2 className={SECTION_HEADING}>Trailers and previews</h2>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {profile.trailers.map((title) => (
                <VideoCard key={title.id} title={title} onTrailer={setTrailerTitle} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-5">
          <h2 className={SECTION_HEADING}>Catalogue</h2>
          <TitleGrid titles={profile.titles} />
        </section>
      </div>

      {trailerTitle && <VideoDialog {...titleTrailerSource(trailerTitle)} onClose={() => setTrailerTitle(null)} />}
    </div>
  );
}
