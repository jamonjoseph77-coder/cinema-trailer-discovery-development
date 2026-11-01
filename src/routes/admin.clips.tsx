import { createFileRoute } from '@tanstack/react-router';
import { AdminClipsPage } from '@/pages/AdminClipsPage';

export const Route = createFileRoute('/admin/clips')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Discover clips — Cinema' },
      { name: 'description', content: 'Manage Discover clips.' },
      { property: 'og:title', content: 'Discover clips — Cinema' },
      { property: 'og:description', content: 'Manage Discover clips.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <AdminClipsPage />;
}
