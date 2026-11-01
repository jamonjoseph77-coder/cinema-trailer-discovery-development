import { type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, PAGE_CONTAINER } from '@/components/ui/styles';
import { EmptyState, LoadingState } from '@/components/ui/StatusViews';

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className={PAGE_CONTAINER}><LoadingState /></div>;

  if (!user) {
    return (
      <div className={PAGE_CONTAINER}>
        <EmptyState
          icon={<ShieldCheck className="h-7 w-7 text-cinema-300" />}
          title="Content manager"
          description="Sign in with an administrator account to manage titles."
          action={<a href="/sign-in" className={BUTTON_PRIMARY}>Sign in</a>}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={PAGE_CONTAINER}>
        <div className={`${CARD} mx-auto max-w-xl space-y-5 text-center`}>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cinema-600/15 ring-1 ring-cinema-400/30">
            <ShieldCheck className="h-5 w-5 text-cinema-300" />
          </span>
          <h1 className="text-xl font-extrabold text-white">Content manager access</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Only Cinema administrators can publish titles. Administrator access must be assigned by the project owner.
          </p>
          <a href="/my-cinema" className={`${BUTTON_SECONDARY} w-full`}>Back to My Cinema</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
