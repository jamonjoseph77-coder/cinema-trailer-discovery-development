import { Clapperboard, Compass } from 'lucide-react';
import { BUTTON_PRIMARY, PAGE_CONTAINER } from '@/components/ui/styles';
import { EmptyState } from '@/components/ui/StatusViews';

export function NotFoundPage() {
  return (
    <div className={PAGE_CONTAINER}>
      <EmptyState
        icon={<Compass className="h-7 w-7 text-cinema-300" />}
        title="This page is not here"
        description="The link may be out of date, or the title has been removed."
        action={
          <a href="/" className={BUTTON_PRIMARY}>
            <Clapperboard className="h-4 w-4" /> Back to Cinema
          </a>
        }
      />
    </div>
  );
}
