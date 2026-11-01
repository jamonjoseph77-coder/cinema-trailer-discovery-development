import { createFileRoute } from '@tanstack/react-router';
import { BrowsePage } from '@/pages/BrowsePage';

export const Route = createFileRoute('/live-tv')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Live TV — Cinema' },
      { name: 'description', content: 'Watch live TV channels.' },
      { property: 'og:title', content: 'Live TV — Cinema' },
      { property: 'og:description', content: 'Watch live TV channels.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <BrowsePage kind="live" />;
}
