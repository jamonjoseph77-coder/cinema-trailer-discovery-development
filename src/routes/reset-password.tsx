import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';

export const Route = createFileRoute('/reset-password')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { title: 'Choose a new password — Cinema' },
      { name: 'description', content: 'Set a new Cinema password.' },
      { property: 'og:title', content: 'Choose a new password — Cinema' },
      { property: 'og:description', content: 'Set a new Cinema password.' },
    ],
  }),
  component: Page,
});

function Page() {
  return <ResetPasswordPage />;
}
