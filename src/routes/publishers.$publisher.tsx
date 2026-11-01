import { createFileRoute } from '@tanstack/react-router';
import { PublisherPage } from '@/pages/PublisherPage';

export const Route = createFileRoute('/publishers/$publisher')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Publisher — Cinema' },
      { name: 'description', content: 'Publisher catalogue.' },
      { property: 'og:title', content: 'Publisher — Cinema' },
      { property: 'og:description', content: 'Publisher catalogue.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <PublisherPage publisher={Route.useParams().publisher} />;
}
