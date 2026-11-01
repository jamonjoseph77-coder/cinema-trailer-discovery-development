import { useState, type ReactNode } from 'react';
import { Compass, Play } from 'lucide-react';
import { VideoCard } from '@/components/catalogue/VideoCard';
import { ClipCard } from '@/components/discover/ClipCard';
import { ShortCard } from '@/components/discover/ShortCard';
import { VideoDialog } from '@/components/player/VideoDialog';
import { titleTrailerSource, type VideoSource } from '@/lib/videoSource';
import { Artwork } from '@/components/ui/Artwork';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, CHIP_BASE, PAGE_CONTAINER, SECTION_HEADING, chipClass } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchPublishedClips, type DiscoverClip } from '@/lib/clips';
import { fetchPublishedTitles } from '@/lib/library';
import { publisherHref } from '@/lib/publishers';
import type { Title } from '@/lib/types';
import { CatalogueSaveButton } from '@/components/trailers/CatalogueSaveButton';
import { CatalogueTrailerCard } from '@/components/trailers/CatalogueTrailerCard';
import { ShareTrailerButton } from '@/components/trailers/ShareTrailerButton';
import { TrailerKindBadge } from '@/components/trailers/TrailerKindBadge';
import { TrailerPlayer } from '@/components/trailers/TrailerPlayer';
import { fetchTrailerFeed, formatReleaseLabel, tmdbHref, tmdbImageUrl, type TmdbItem, type TrailerFeedSection } from '@/lib/tmdb';
import { firstOfKinds, trailerLabel, trailerWatchUrl, type Trailer, type TrailerKind } from '@/lib/trailers';

type DiscoverTab = 'all' | 'shorts' | 'trailers' | 'clips';

const TABS: { id: DiscoverTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'trailers', label: 'Trailers' },
  { id: 'clips', label: 'Clips' },
];

interface DiscoverData {
  titles: Title[];
  clips: DiscoverClip[];
  feed: TrailerFeedSection[];
}

const FEED_HEADINGS: Record<TrailerFeedSection['key'], string> = {
  upcoming: 'Coming soon to cinemas',
  trending_movies: 'Trending movie trailers',
  trending_series: 'Trending series trailers',
};

async function loadDiscover(): Promise<DiscoverData> {
  const [titles, clips, feed] = await Promise.all([
    fetchPublishedTitles(),
    fetchPublishedClips(),
    fetchTrailerFeed().catch((error) => {
      console.warn('Trailer feed unavailable', error);
      return [] as TrailerFeedSection[];
    }),
  ]);
  return { titles, clips, feed };
}

interface FeedPick {
  item: TmdbItem;
  trailer: Trailer;
}

function picksFor(section: TrailerFeedSection, kinds: TrailerKind[]): FeedPick[] {
  return section.entries.flatMap(({ item, trailers }) => {
    const trailer = firstOfKinds(trailers, kinds);
    return trailer ? [{ item, trailer }] : [];
  });
}

function DiscoverSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className={SECTION_HEADING}>{heading}</h2>
      {children}
    </section>
  );
}

function EmptySection({ label }: { label: string }) {
  return <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">New {label} are on their way. Check back soon.</p>;
}

export function DiscoverPage() {
  const { data, error, reload } = useAsyncData(loadDiscover, []);
  const [tab, setTab] = useState<DiscoverTab>('all');
  const [activeVideo, setActiveVideo] = useState<VideoSource | null>(null);

  if (!data) {
    return <div className={PAGE_CONTAINER}>{error ? <ErrorState onRetry={reload} /> : <LoadingState />}</div>;
  }

  const featured = data.clips.find((clip) => clip.kind === 'featured') ?? null;
  const shorts = data.clips.filter((clip) => clip.kind === 'short');
  const clipTrailers = data.clips.filter((clip) => clip.kind === 'trailer');
  const titleTrailers = data.titles.filter((title) => title.trailer_url.trim() !== '');
  const clips = data.clips.filter((clip) => clip.kind === 'clip');
  const trailerSections = data.feed
    .map((section) => ({ section, picks: picksFor(section, ['trailer', 'teaser']) }))
    .filter(({ picks }) => picks.length > 0);
  const extraPicks = data.feed.flatMap((section) => picksFor(section, ['clip', 'featurette', 'behind_the_scenes'])).slice(0, 12);
  const catalogueSpotlight = trailerSections[0]?.picks[0] ?? null;
  const hasAnything = data.clips.length > 0 || titleTrailers.length > 0 || trailerSections.length > 0;

  const openClip = (clip: DiscoverClip) =>
    setActiveVideo({ url: clip.video_url, label: clip.headline, heading: clip.headline });

  const openCatalogueTrailer = (item: TmdbItem, trailer: Trailer) =>
    setActiveVideo({ url: trailerWatchUrl(trailer), label: `${item.title}: ${trailer.name}`, heading: `${trailerLabel(trailer)} · ${item.title}` });

  const pickGrid = (picks: FeedPick[]) => (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {picks.map(({ item, trailer }) => (
        <CatalogueTrailerCard key={`${item.mediaType}-${item.id}-${trailer.key}`} item={item} trailer={trailer} onPlay={openCatalogueTrailer} />
      ))}
    </div>
  );

  const catalogueTrailerSections = trailerSections.map(({ section, picks }) => (
    <DiscoverSection key={section.key} heading={FEED_HEADINGS[section.key]}>
      {pickGrid(picks)}
    </DiscoverSection>
  ));

  const hasCinemaTrailers = clipTrailers.length + titleTrailers.length > 0;

  const trailerGrid = (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {clipTrailers.map((clip) => (
        <ClipCard key={`clip-${clip.id}`} clip={clip} onOpen={openClip} />
      ))}
      {titleTrailers.map((title) => (
        <VideoCard key={`title-${title.id}`} title={title} onTrailer={(item) => setActiveVideo(titleTrailerSource(item))} />
      ))}
    </div>
  );

  const shortsRow = (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden">
      {shorts.map((clip) => (
        <ShortCard key={clip.id} clip={clip} onOpen={openClip} />
      ))}
    </div>
  );

  const clipGrid = (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} onOpen={openClip} />
      ))}
    </div>
  );

  return (
    <div className={`${PAGE_CONTAINER} space-y-10`}>
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">
          <Compass className="h-4 w-4" /> Discover
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Trailers, shorts and clips</h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Official trailers, teasers and clips for the latest movies and series. Save what catches your eye and share it with friends.
        </p>
      </header>

      {!hasAnything ? (
        <EmptyState
          icon={<Compass className="h-7 w-7 text-cinema-300" />}
          title="New trailers are on their way"
          description="We are lining up the latest trailers and clips. Please check back shortly."
          action={<button type="button" onClick={reload} className={BUTTON_PRIMARY}>Refresh</button>}
        />
      ) : (
        <>
          <div className="sticky top-16 z-10 -mx-4 border-b border-white/5 bg-ink-950/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter discover content">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={`${CHIP_BASE} shrink-0 ${chipClass(tab === item.id)}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'all' && featured && (
            <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-ink-900">
              <div className="absolute inset-0">
                <Artwork src={featured.poster_url} alt="" fallbackTitle={featured.headline} className="h-full w-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/20" />
              </div>
              <div className="relative max-w-2xl space-y-4 p-6 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">Featured</p>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{featured.headline}</h2>
                {featured.description && <p className="text-sm leading-relaxed text-slate-300">{featured.description}</p>}
                {featured.publisher_name && (
                  <a href={publisherHref(featured.publisher_name)} className="text-sm font-semibold text-slate-200 transition hover:text-cinema-300">
                    {featured.publisher_name}
                  </a>
                )}
                <div>
                  <button type="button" onClick={() => openClip(featured)} className={BUTTON_PRIMARY}>
                    <Play className="h-4 w-4 fill-current" /> Play
                  </button>
                </div>
              </div>
            </section>
          )}

          {tab === 'all' && !featured && catalogueSpotlight && (
            <section className="grid gap-6 rounded-3xl border border-white/10 bg-ink-900 p-4 sm:p-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <TrailerPlayer
                trailer={catalogueSpotlight.trailer}
                title={catalogueSpotlight.item.title}
                poster={tmdbImageUrl(catalogueSpotlight.item.backdropPath, 'w1280')}
              />
              <div className="space-y-4">
                <TrailerKindBadge trailer={catalogueSpotlight.trailer} />
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{catalogueSpotlight.item.title}</h2>
                {formatReleaseLabel(catalogueSpotlight.item) && (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{formatReleaseLabel(catalogueSpotlight.item)}</p>
                )}
                {catalogueSpotlight.item.overview && (
                  <p className="line-clamp-4 text-sm leading-relaxed text-slate-300">{catalogueSpotlight.item.overview}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  <a href={tmdbHref(catalogueSpotlight.item)} className={BUTTON_PRIMARY}>View details</a>
                  <CatalogueSaveButton item={catalogueSpotlight.item} />
                  <ShareTrailerButton item={catalogueSpotlight.item} trailer={catalogueSpotlight.trailer} />
                </div>
              </div>
            </section>
          )}

          {tab === 'all' && (
            <>
              {shorts.length > 0 && <DiscoverSection heading="Shorts">{shortsRow}</DiscoverSection>}
              {hasCinemaTrailers && <DiscoverSection heading="Cinema trailers">{trailerGrid}</DiscoverSection>}
              {catalogueTrailerSections}
              {(clips.length > 0 || extraPicks.length > 0) && (
                <DiscoverSection heading="Clips and featurettes">
                  {clips.length > 0 && clipGrid}
                  {extraPicks.length > 0 && pickGrid(extraPicks)}
                </DiscoverSection>
              )}
            </>
          )}

          {tab === 'shorts' && (
            <DiscoverSection heading="Shorts">{shorts.length > 0 ? shortsRow : <EmptySection label="shorts" />}</DiscoverSection>
          )}
          {tab === 'trailers' && (
            <>
              {hasCinemaTrailers && <DiscoverSection heading="Cinema trailers">{trailerGrid}</DiscoverSection>}
              {catalogueTrailerSections}
              {!hasCinemaTrailers && trailerSections.length === 0 && <EmptySection label="trailers" />}
            </>
          )}
          {tab === 'clips' && (
            <DiscoverSection heading="Clips and featurettes">
              {clips.length === 0 && extraPicks.length === 0 && <EmptySection label="clips" />}
              {clips.length > 0 && clipGrid}
              {extraPicks.length > 0 && pickGrid(extraPicks)}
            </DiscoverSection>
          )}
        </>
      )}

      {activeVideo && <VideoDialog {...activeVideo} onClose={() => setActiveVideo(null)} />}
    </div>
  );
}
