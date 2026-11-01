import { createFileRoute } from '@tanstack/react-router';
import { AdminTitlePage } from '@/pages/AdminPage';

export const Route = createFileRoute('/admin/title/$id')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Edit title — Cinema' },
      { name: 'description', content: 'Edit a title.' },
      { property: 'og:title', content: 'Edit title — Cinema' },
      { property: 'og:description', content: 'Edit a title.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <AdminTitlePage titleId={Route.useParams().id} />;
}
