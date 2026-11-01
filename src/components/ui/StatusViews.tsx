import type { ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { BUTTON_PRIMARY } from '@/components/ui/styles';

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="h-7 w-7 animate-spin text-cinema-400" aria-hidden="true" />
      <span className="text-sm">{label}...</span>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-7 w-7 text-amber-400" />}
      title="We could not load this right now"
      description="Check your connection and try again. If the problem continues, come back in a few minutes."
      action={
        onRetry && (
          <button type="button" onClick={onRetry} className={BUTTON_PRIMARY}>
            Try again
          </button>
        )
      }
    />
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-ink-900/60 px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cinema-600/15 ring-1 ring-cinema-400/30">
        {icon}
      </span>
      <h2 className="text-lg font-extrabold text-white">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
