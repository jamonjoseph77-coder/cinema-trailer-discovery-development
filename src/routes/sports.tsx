import { createFileRoute } from '@tanstack/react-router';
import { BrowsePage } from '@/pages/BrowsePage';

export const Route = createFileRoute('/sports')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Sports — Cinema' },
      { name: 'description', content: 'Sports fixtures, highlights and replays.' },
      { property: 'og:title', content: 'Sports — Cinema' },
      { property: 'og:description', content: 'Sports fixtures, highlights and replays.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <BrowsePage kind="sport" />;
}
