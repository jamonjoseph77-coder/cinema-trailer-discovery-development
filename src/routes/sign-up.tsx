import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/pages/AuthPage';

export const Route = createFileRoute('/sign-up')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Create account — Cinema' },
      { name: 'description', content: 'Create your Cinema account.' },
      { property: 'og:title', content: 'Create account — Cinema' },
      { property: 'og:description', content: 'Create your Cinema account.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <AuthPage mode="sign-up" />;
}
