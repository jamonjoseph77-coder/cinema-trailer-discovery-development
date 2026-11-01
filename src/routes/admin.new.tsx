import { createFileRoute } from '@tanstack/react-router';
import { AdminTitlePage } from '@/pages/AdminPage';

export const Route = createFileRoute('/admin/new')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'New title — Cinema' },
      { name: 'description', content: 'Add a title.' },
      { property: 'og:title', content: 'New title — Cinema' },
      { property: 'og:description', content: 'Add a title.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <AdminTitlePage titleId={null} />;
}
