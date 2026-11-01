import { TmdbAttribution } from '@/components/tmdb/TmdbAttribution';
import type { ReactNode } from 'react';
import { SideNav } from '@/components/layout/SideNav';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { CinemaLogo } from '@/components/ui/CinemaLogo';
import type { Route } from '@/lib/router';

interface AppShellProps {
  route: Route;
  children: ReactNode;
}

export function AppShell({ route, children }: AppShellProps) {
  return (
    <div className="min-h-screen text-slate-100">
      <SideNav route={route} />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopBar />
        <main className="flex-1 pb-24 lg:pb-12">{children}</main>
        <footer className="border-t border-white/5 px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-8">
          <div className="hidden items-center justify-between gap-6 text-sm text-slate-500 lg:flex">
            <CinemaLogo compact />
            <p>Cinema Entertainment Technologies. Experience the World of Stories.</p>
          </div>
          <TmdbAttribution className="lg:mt-4" />
        </footer>
      </div>
      <MobileNav route={route} />
    </div>
  );
}
