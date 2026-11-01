import { useAuth } from '@/hooks/useAuth';
import { CinemaLogo } from '@/components/ui/CinemaLogo';
import { NAV_SECTIONS, navKeyOf } from '@/components/layout/navigation';
import type { Route } from '@/lib/router';
import { LogOut, ShieldCheck } from 'lucide-react';

interface SideNavProps {
  route: Route;
}

export function SideNav({ route }: SideNavProps) {
  const { user, isAdmin, signOut } = useAuth();
  const activeKey = navKeyOf(route);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-ink-900/90 backdrop-blur-xl lg:flex">
      <a href="/" className="px-6 pb-8 pt-7" aria-label="Cinema home">
        <CinemaLogo />
      </a>

      <nav aria-label="Main" className="flex-1 space-y-7 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = item.key === activeKey;
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-cinema-600/20 text-white ring-1 ring-cinema-400/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${active ? 'text-cinema-300' : 'text-slate-500 group-hover:text-cinema-300'}`} />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {isAdmin && (
          <div>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Admin</p>
            <a
              href="/admin"
              aria-current={route.name.startsWith('admin') ? 'page' : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
            >
              <ShieldCheck className="h-[18px] w-[18px] text-cinema-300" />
              Content manager
            </a>
          </div>
        )}
      </nav>

      <div className="border-t border-white/5 p-4">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            <a href="/my-cinema" className="min-w-0 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
              <p className="text-xs font-semibold text-slate-400">Signed in as</p>
              <p className="truncate text-sm text-slate-100">{user.email}</p>
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <a
            href="/sign-in"
            className="block rounded-xl bg-cinema-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-cinema-500"
          >
            Sign in to Cinema
          </a>
        )}
      </div>
    </aside>
  );
}
