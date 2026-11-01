import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Tone = 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

export interface ToastContextValue {
  notify: (message: string, tone?: Tone) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 3800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((message: string, tone: Tone = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((toast) => {
          const Icon = toast.tone === 'error' ? AlertCircle : CheckCircle2;
          return (
            <div
              key={toast.id}
              role="status"
              className="animate-rise-in flex max-w-md items-center gap-3 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-slate-100 shadow-2xl shadow-black/50"
            >
              <Icon className={`h-5 w-5 shrink-0 ${toast.tone === 'error' ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
