import { useAuth } from '@/hooks/useAuth';
import { EmptyState, ErrorState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY } from '@/components/ui/styles';
import { TmdbError } from '@/lib/tmdb';
import { Film } from 'lucide-react';

export function TmdbErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { isAdmin } = useAuth();
  if (error instanceof TmdbError && error.reason === 'not_configured') {
    return (
      <EmptyState
        icon={<Film className="h-7 w-7 text-cinema-300" />}
        title="The catalogue is being prepared"
        description={
          isAdmin
            ? 'Catalogue information is not configured yet. Add the catalogue access token in the server settings to load titles and trailers.'
            : 'New movies and series are on their way. Please check back soon.'
        }
        action={onRetry && <button type="button" onClick={onRetry} className={BUTTON_PRIMARY}>Try again</button>}
      />
    );
  }
  return <ErrorState onRetry={onRetry} />;
}
