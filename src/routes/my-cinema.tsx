import { createFileRoute } from '@tanstack/react-router';
import { MyCinemaPage } from '@/pages/MyCinemaPage';

export const Route = createFileRoute('/my-cinema')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'My Cinema — Cinema' },
      { name: 'description', content: 'Your watchlist, favourites and progress.' },
      { property: 'og:title', content: 'My Cinema — Cinema' },
      { property: 'og:description', content: 'Your watchlist, favourites and progress.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <MyCinemaPage />;
}
