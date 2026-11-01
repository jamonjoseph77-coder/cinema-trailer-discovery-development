import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AdminGate } from '@/components/admin/AdminGate';
import { TitleForm } from '@/components/admin/TitleForm';
import { SeasonManager } from '@/components/admin/SeasonManager';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_GHOST, BUTTON_PRIMARY, CARD, PAGE_CONTAINER } from '@/components/ui/styles';
import { deleteTitle, fetchAllTitles, fetchTitleDetail, setTitleFlags } from '@/lib/library';
import { navigateTo } from '@/lib/router';
import { TITLE_TYPE_LABELS, type Title } from '@/lib/types';

function AdminPageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Content manager
        </a>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">{title}</h1>
      </div>
      {action}
    </header>
  );
}

export function AdminTitleList() {
  const { notify } = useToast();
  const { data: titles, error, reload } = useAsyncData(fetchAllTitles, []);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(title: Title, flag: 'is_published' | 'is_featured') {
    setBusyId(title.id);
    try {
      await setTitleFlags(title.id, { [flag]: !title[flag] });
      reload();
    } catch {
      notify('That change could not be saved.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(title: Title) {
    if (!window.confirm(`Delete "${title.title}" permanently? Its seasons and episodes will be removed too.`)) return;
    setBusyId(title.id);
    try {
      await deleteTitle(title.id);
      notify('Title deleted.');
      reload();
    } catch {
      notify('The title could not be deleted.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <AdminPageHeader
        title="Content manager"
        action={
          <div className="flex flex-wrap gap-2">
            <a href="/admin/clips" className={BUTTON_GHOST}>Discover clips</a>
            <a href="/admin/new" className={BUTTON_PRIMARY}><Plus className="h-4 w-4" /> New title</a>
          </div>
        }
      />

      {!titles && (error ? <ErrorState onRetry={reload} /> : <LoadingState />)}

      {titles && titles.length === 0 && (
        <p className={`${CARD} text-sm text-slate-400`}>No titles yet. Create your first title to start building the catalogue.</p>
      )}

      {titles && titles.length > 0 && (
        <ul className="space-y-3">
          {titles.map((title) => (
            <li key={title.id} className={`${CARD} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5`}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{title.title}</p>
                <p className="text-xs text-slate-400">{TITLE_TYPE_LABELS[title.type]}{title.release_year ? ` · ${title.release_year}` : ''}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${title.is_published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                    {title.is_published ? 'Published' : 'Draft'}
                  </span>
                  {title.is_featured && <span className="rounded-md bg-cinema-600/20 px-2 py-0.5 text-xs font-semibold text-cinema-200">Featured</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <button type="button" disabled={busyId === title.id} onClick={() => void toggle(title, 'is_published')} className={BUTTON_GHOST}>
                  {title.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {title.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button type="button" disabled={busyId === title.id} onClick={() => void toggle(title, 'is_featured')} className={BUTTON_GHOST}>
                  <Star className={`h-4 w-4 ${title.is_featured ? 'fill-current text-cinema-300' : ''}`} />
                  {title.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <a href={`/admin/title/${title.id}`} className={BUTTON_GHOST}>
                  <Pencil className="h-4 w-4" /> Edit
                </a>
                <button type="button" disabled={busyId === title.id} onClick={() => void remove(title)} className={`${BUTTON_GHOST} text-rose-300 hover:text-rose-200`}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminListPage() {
  return (
    <AdminGate>
      <AdminTitleList />
    </AdminGate>
  );
}

function AdminTitleEditor({ titleId }: { titleId: string | null }) {
  const { data, error, reload } = useAsyncData(
    () => (titleId ? fetchTitleDetail(titleId) : Promise.resolve(null)),
    [titleId],
  );

  if (titleId && !data) {
    return <div className={PAGE_CONTAINER}>{error ? <ErrorState onRetry={reload} /> : <LoadingState />}</div>;
  }

  const title = data?.title ?? null;
  if (titleId && !title) {
    return (
      <div className={PAGE_CONTAINER}>
        <p className={`${CARD} text-sm text-slate-300`}>This title could not be found.</p>
      </div>
    );
  }

  return (
    <div className={`${PAGE_CONTAINER} space-y-10`}>
      <AdminPageHeader title={title ? `Edit: ${title.title}` : 'New title'} />
      <TitleForm
        key={title?.id ?? 'new'}
        initial={title}
        onSaved={(saved) => {
          if (!titleId) navigateTo(`/admin/title/${saved.id}`);
          else reload();
        }}
      />
      {title?.type === 'series' && data && (
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-white">Seasons and episodes</h2>
          <SeasonManager titleId={title.id} seasons={data.seasons} onChanged={reload} />
        </section>
      )}
      {title && title.type !== 'series' && (
        <p className="text-sm text-slate-400">
          Playback for this title uses the playback link above. Seasons and episodes are only used for series.
        </p>
      )}
    </div>
  );
}

export function AdminTitlePage({ titleId }: { titleId: string | null }) {
  return (
    <AdminGate>
      <AdminTitleEditor titleId={titleId} />
    </AdminGate>
  );
}
