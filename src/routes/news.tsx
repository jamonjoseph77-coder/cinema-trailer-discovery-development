import { createFileRoute } from '@tanstack/react-router';
import { BrowsePage } from '@/pages/BrowsePage';

export const Route = createFileRoute('/news')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'News — Cinema' },
      { name: 'description', content: 'The latest news on Cinema.' },
      { property: 'og:title', content: 'News — Cinema' },
      { property: 'og:description', content: 'The latest news on Cinema.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <BrowsePage kind="news" />;
}
