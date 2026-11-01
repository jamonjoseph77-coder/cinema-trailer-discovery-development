import { createFileRoute } from '@tanstack/react-router';
import { AdminListPage } from '@/pages/AdminPage';

export const Route = createFileRoute('/admin/')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Admin — Cinema' },
      { name: 'description', content: 'Manage Cinema content.' },
      { property: 'og:title', content: 'Admin — Cinema' },
      { property: 'og:description', content: 'Manage Cinema content.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <AdminListPage />;
}
