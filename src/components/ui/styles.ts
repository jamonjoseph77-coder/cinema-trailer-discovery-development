export const PAGE_CONTAINER = 'mx-auto w-full max-w-7xl animate-rise-in px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-10';

export const BUTTON_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-cinema-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cinema-900/40 transition hover:bg-cinema-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

export const BUTTON_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cinema-400/50 hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

export const BUTTON_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50';

export const INPUT =
  'w-full rounded-xl border border-white/10 bg-ink-850 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-cinema-400 focus:outline-none focus:ring-2 focus:ring-cinema-500/30';

export const LABEL = 'mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400';

export const CARD = 'rounded-2xl border border-white/10 bg-ink-850/70 p-6 shadow-xl shadow-black/20';

export const SECTION_HEADING = 'text-xl font-extrabold tracking-tight text-white sm:text-2xl';

export const CHIP_BASE =
  'rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none';

export function chipClass(active: boolean): string {
  return `${CHIP_BASE} ${
    active
      ? 'border-cinema-400 bg-cinema-600 text-white'
      : 'border-white/10 bg-white/5 text-slate-300 hover:border-cinema-400/40 hover:text-white'
  }`;
}
