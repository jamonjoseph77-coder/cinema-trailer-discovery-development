import { createFileRoute, notFound } from '@tanstack/react-router';
import { TmdbDetailPage } from '@/pages/TmdbDetailPage';
import { isTrailerKey } from '@/lib/trailers';

export const Route = createFileRoute('/tmdb/$mediaType/$id')({
  validateSearch: (search: Record<string, unknown>): { trailer?: string } =>
    isTrailerKey(search.trailer) ? { trailer: search.trailer } : {},
  beforeLoad: ({ params }) => {
    const id = Number(params.id);
    if ((params.mediaType !== 'movie' && params.mediaType !== 'tv') || !Number.isInteger(id) || id <= 0) throw notFound();
  },
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Details and trailers — Cinema' },
      { name: 'description', content: 'Movie and series details, release information and official trailers on Cinema.' },
      { property: 'og:title', content: 'Details and trailers — Cinema' },
      { property: 'og:description', content: 'Movie and series details, release information and official trailers on Cinema.' },
    ],
  }),
  component: Page,
});

function Page() {
  const { mediaType, id } = Route.useParams();
  const { trailer } = Route.useSearch();
  return <TmdbDetailPage key={`${mediaType}-${id}`} mediaType={mediaType as 'movie' | 'tv'} id={Number(id)} initialTrailerKey={trailer} />;
}
