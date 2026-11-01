import { createFileRoute } from '@tanstack/react-router';
import { DiscoverPage } from '@/pages/DiscoverPage';

export const Route = createFileRoute('/discover')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Discover — Cinema' },
      { name: 'description', content: 'Trailers, shorts and clips.' },
      { property: 'og:title', content: 'Discover — Cinema' },
      { property: 'og:description', content: 'Trailers, shorts and clips.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <DiscoverPage />;
}
