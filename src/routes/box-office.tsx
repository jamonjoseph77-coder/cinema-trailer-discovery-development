import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/pages/ComingSoonPage';

export const Route = createFileRoute('/box-office')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Box Office — Cinema' },
      { name: 'description', content: 'Box office is coming soon to Cinema.' },
      { property: 'og:title', content: 'Box Office — Cinema' },
      { property: 'og:description', content: 'Box office is coming soon to Cinema.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <ComingSoonPage section="box-office" />;
}
