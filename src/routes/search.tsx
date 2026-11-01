import { createFileRoute } from '@tanstack/react-router';
import { SearchPage } from '@/pages/SearchPage';

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({ q: typeof search.q === 'string' ? search.q : undefined }),
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Search — Cinema' },
      { name: 'description', content: 'Search movies and series.' },
      { property: 'og:title', content: 'Search — Cinema' },
      { property: 'og:description', content: 'Search movies and series.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <SearchPage query={Route.useSearch().q ?? ''} />;
}
