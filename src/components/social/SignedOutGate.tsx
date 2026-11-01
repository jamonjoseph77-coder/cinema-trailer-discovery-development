import type { ReactNode } from 'react';
import { LogIn } from 'lucide-react';
import { EmptyState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/components/ui/styles';

export function SignedOutGate({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/sign-in" className={BUTTON_PRIMARY}>
            <LogIn className="h-4 w-4" /> Sign in
          </a>
          <a href="/sign-up" className={BUTTON_SECONDARY}>
            Create account
          </a>
        </div>
      }
    />
  );
}
