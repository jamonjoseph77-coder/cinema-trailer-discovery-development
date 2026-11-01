import { useMemo } from 'react';
import { Heart, LogOut, ShieldCheck } from 'lucide-react';
import { ContinueWatchingRow } from '@/components/catalogue/ContinueWatchingRow';
import { TitleGrid } from '@/components/catalogue/TitleGrid';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, PAGE_CONTAINER, SECTION_HEADING } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { resumeItems } from '@/lib/catalogue';
import { fetchPublishedTitles } from '@/lib/library';

export function MyCinemaPage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { watchlistIds, favouriteIds, progress, ready } = useLibrary();
  const { data: titles, error, reload } = useAsyncData(fetchPublishedTitles, []);

  const view = useMemo(() => {
    if (!titles) return null;
    return {
      resume: resumeItems(progress, titles),
      watchlist: titles.filter((title) => watchlistIds.has(title.id)),
      favourites: titles.filter((title) => favouriteIds.has(title.id)),
    };
  }, [titles, progress, watchlistIds, favouriteIds]);

  if (authLoading) return <div className={PAGE_CONTAINER}><LoadingState /></div>;

  if (!user) {
    return (
      <div className={PAGE_CONTAINER}>
        <EmptyState
          icon={<Heart className="h-7 w-7 text-cinema-300" />}
          title="Your personal cinema"
          description="Sign in to see your watchlist, favourites and the titles you are part way through."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/sign-in" className={BUTTON_PRIMARY}>Sign in</a>
              <a href="/sign-up" className={BUTTON_SECONDARY}>Create account</a>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className={`${PAGE_CONTAINER} space-y-14`}>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">My Cinema</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Your library</h1>
          <p className="text-sm text-slate-400">Signed in as {user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <a href="/admin" className={BUTTON_SECONDARY}>
              <ShieldCheck className="h-4 w-4" /> Content manager
            </a>
          )}
          <button type="button" onClick={() => void signOut()} className={BUTTON_SECONDARY}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      {!view && (error ? <ErrorState onRetry={reload} /> : <LoadingState />)}

      {view && (
        <>
          <ContinueWatchingRow items={view.resume} />

          <section className="space-y-5">
            <h2 className={SECTION_HEADING}>Watchlist</h2>
            {!ready ? (
              <LoadingState label="Loading your list" />
            ) : view.watchlist.length === 0 ? (
              <p className={`${CARD} text-sm text-slate-400`}>
                Titles you add with the watchlist button will appear here. Browse the catalogue to start building your list.
              </p>
            ) : (
              <TitleGrid titles={view.watchlist} />
            )}
          </section>

          <section className="space-y-5">
            <h2 className={SECTION_HEADING}>Favourites</h2>
            {!ready ? (
              <LoadingState label="Loading your favourites" />
            ) : view.favourites.length === 0 ? (
              <p className={`${CARD} text-sm text-slate-400`}>
                Mark titles as favourites to keep the ones you love within reach.
              </p>
            ) : (
              <TitleGrid titles={view.favourites} />
            )}
          </section>

        </>
      )}
    </div>
  );
}
