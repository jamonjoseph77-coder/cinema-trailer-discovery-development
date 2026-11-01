import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminGate } from '@/components/admin/AdminGate';
import { ClipForm } from '@/components/admin/ClipForm';
import { Modal } from '@/components/ui/Modal';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_GHOST, BUTTON_PRIMARY, CARD, PAGE_CONTAINER } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/hooks/useToast';
import { CLIP_KIND_LABEL, deleteClip, fetchAllClips, setClipPublished, type DiscoverClip } from '@/lib/clips';
import { fetchAllTitles } from '@/lib/library';
import type { Title } from '@/lib/types';

interface ClipsData {
  clips: DiscoverClip[];
  titles: Title[];
}

async function loadClipsData(): Promise<ClipsData> {
  const [clips, titles] = await Promise.all([fetchAllClips(), fetchAllTitles()]);
  return { clips, titles };
}

type EditorState = { mode: 'new' } | { mode: 'edit'; clip: DiscoverClip } | null;

function AdminClipsManager() {
  const { notify } = useToast();
  const { data, error, reload } = useAsyncData(loadClipsData, []);
  const [editor, setEditor] = useState<EditorState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function togglePublished(clip: DiscoverClip) {
    setBusyId(clip.id);
    try {
      await setClipPublished(clip.id, !clip.is_published);
      reload();
    } catch {
      notify('That change could not be saved.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(clip: DiscoverClip) {
    if (!window.confirm(`Delete "${clip.headline}" permanently?`)) return;
    setBusyId(clip.id);
    try {
      await deleteClip(clip.id);
      notify('Clip deleted.');
      reload();
    } catch {
      notify('The clip could not be deleted.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (!data) {
    return <div className={PAGE_CONTAINER}>{error ? <ErrorState onRetry={reload} /> : <LoadingState />}</div>;
  }

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <a href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Content manager
          </a>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Discover clips</h1>
        </div>
        <button type="button" onClick={() => setEditor({ mode: 'new' })} className={BUTTON_PRIMARY}>
          <Plus className="h-4 w-4" /> New clip
        </button>
      </header>

      {data.clips.length === 0 ? (
        <p className={`${CARD} text-sm text-slate-400`}>No clips yet. Add shorts, trailers or clips to fill the Discover page.</p>
      ) : (
        <ul className="space-y-3">
          {data.clips.map((clip) => (
            <li key={clip.id} className={`${CARD} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5`}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{clip.headline}</p>
                <p className="text-xs text-slate-400">
                  {CLIP_KIND_LABEL[clip.kind]}
                  {clip.publisher_name ? ` · ${clip.publisher_name}` : ''}
                  {clip.title ? ` · ${clip.title.title}` : ''}
                </p>
                <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${clip.is_published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                  {clip.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <button type="button" disabled={busyId === clip.id} onClick={() => void togglePublished(clip)} className={BUTTON_GHOST}>
                  {clip.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {clip.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button type="button" onClick={() => setEditor({ mode: 'edit', clip })} className={BUTTON_GHOST}>
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button type="button" disabled={busyId === clip.id} onClick={() => void remove(clip)} className={`${BUTTON_GHOST} text-rose-300 hover:text-rose-200`}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editor && (
        <Modal label={editor.mode === 'edit' ? 'Edit clip' : 'New clip'} onClose={() => setEditor(null)} wide>
          <div className="space-y-6 pr-8">
            <h2 className="text-xl font-extrabold text-white">{editor.mode === 'edit' ? 'Edit clip' : 'New clip'}</h2>
            <ClipForm
              clip={editor.mode === 'edit' ? editor.clip : null}
              titles={data.titles}
              onSaved={() => {
                setEditor(null);
                notify('Clip saved.');
                reload();
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AdminClipsPage() {
  return (
    <AdminGate>
      <AdminClipsManager />
    </AdminGate>
  );
}
