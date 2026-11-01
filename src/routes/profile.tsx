import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/pages/ProfilePage';

export const Route = createFileRoute('/profile')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Profile — Cinema' },
      { name: 'description', content: 'Edit your Cinema profile.' },
      { property: 'og:title', content: 'Profile — Cinema' },
      { property: 'og:description', content: 'Edit your Cinema profile.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <ProfilePage />;
}
