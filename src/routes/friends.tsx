import { createFileRoute } from '@tanstack/react-router';
import { FriendsPage } from '@/pages/FriendsPage';

export const Route = createFileRoute('/friends')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Friends — Cinema' },
      { name: 'description', content: 'Find and manage friends on Cinema.' },
      { property: 'og:title', content: 'Friends — Cinema' },
      { property: 'og:description', content: 'Find and manage friends on Cinema.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <FriendsPage />;
}
