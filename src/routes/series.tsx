import { createFileRoute } from '@tanstack/react-router';
import { TmdbBrowsePage } from '@/pages/TmdbBrowsePage';

export const Route = createFileRoute('/series')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Series — Cinema' },
      { name: 'description', content: 'Browse popular and trending series.' },
      { property: 'og:title', content: 'Series — Cinema' },
      { property: 'og:description', content: 'Browse popular and trending series.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <TmdbBrowsePage mediaType="tv" />;
}
