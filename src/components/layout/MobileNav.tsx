import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MOBILE_PRIMARY_NAV, NAV_SECTIONS, navKeyOf } from '@/components/layout/navigation';
import type { Route } from '@/lib/router';

interface MobileNavProps {
  route: Route;
}

export function MobileNav({ route }: MobileNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const activeKey = navKeyOf(route);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-6">
          {MOBILE_PRIMARY_NAV.map((item) => {
            const active = item.key === activeKey;
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <a
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold transition ${
                    active ? 'text-cinema-300' : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </a>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold text-slate-400 transition hover:text-slate-100"
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/70 backdrop-blur-sm animate-fade-in lg:hidden" onClick={() => setMoreOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All sections"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[80vh] w-full animate-rise-in overflow-y-auto rounded-t-3xl border-t border-white/10 bg-ink-900 p-6 pb-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="text-lg font-extrabold text-white">All sections</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{section.title}</p>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = item.key === activeKey;
                      return (
                        <li key={item.key}>
                          <a
                            href={item.href}
                            onClick={() => setMoreOpen(false)}
                            aria-current={active ? 'page' : undefined}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                              active
                                ? 'border-cinema-400/50 bg-cinema-600/20 text-white'
                                : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                            }`}
                          >
                            <Icon className="h-5 w-5 text-cinema-300" />
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
