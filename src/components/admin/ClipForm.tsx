import { useState, type FormEvent } from 'react';
import { BUTTON_PRIMARY, INPUT, LABEL } from '@/components/ui/styles';
import { saveClip, CLIP_KIND_LABEL, type ClipInput, type ClipKind, type DiscoverClip } from '@/lib/clips';
import { isHttpUrl } from '@/lib/media';
import type { Title } from '@/lib/types';

const KINDS = Object.keys(CLIP_KIND_LABEL) as ClipKind[];

interface FormState {
  kind: ClipKind;
  headline: string;
  description: string;
  video_url: string;
  poster_url: string;
  publisher_name: string;
  title_id: string;
  duration_seconds: string;
  sort_order: string;
  is_published: boolean;
}

function toForm(clip: DiscoverClip | null): FormState {
  return {
    kind: clip?.kind ?? 'short',
    headline: clip?.headline ?? '',
    description: clip?.description ?? '',
    video_url: clip?.video_url ?? '',
    poster_url: clip?.poster_url ?? '',
    publisher_name: clip?.publisher_name ?? '',
    title_id: clip?.title_id ?? '',
    duration_seconds: clip?.duration_seconds?.toString() ?? '',
    sort_order: clip?.sort_order?.toString() ?? '0',
    is_published: clip?.is_published ?? false,
  };
}

function buildInput(form: FormState): { input?: ClipInput; error?: string } {
  if (!form.headline.trim()) return { error: 'Give the clip a headline.' };
  if (!form.video_url.trim() || !isHttpUrl(form.video_url)) {
    return { error: 'The video link must start with http:// or https://.' };
  }
  if (!isHttpUrl(form.poster_url)) return { error: 'The poster link must start with http:// or https://.' };
  const duration = form.duration_seconds.trim() === '' ? null : Number(form.duration_seconds);
  const order = Number(form.sort_order || '0');
  if (duration !== null && (!Number.isInteger(duration) || duration < 0)) {
    return { error: 'Duration must be a whole number of seconds.' };
  }
  if (!Number.isInteger(order)) return { error: 'Sort order must be a whole number.' };

  return {
    input: {
      kind: form.kind,
      headline: form.headline.trim(),
      description: form.description.trim(),
      video_url: form.video_url.trim(),
      poster_url: form.poster_url.trim(),
      publisher_name: form.publisher_name.trim(),
      title_id: form.title_id || null,
      duration_seconds: duration,
      sort_order: order,
      is_published: form.is_published,
    },
  };
}

interface ClipFormProps {
  clip: DiscoverClip | null;
  titles: Title[];
  onSaved: () => void;
}

export function ClipForm({ clip, titles, onSaved }: ClipFormProps) {
  const [form, setForm] = useState<FormState>(() => toForm(clip));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = buildInput(form);
    if (!result.input) {
      setError(result.error ?? 'Check the highlighted fields.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveClip(clip?.id ?? null, result.input);
      onSaved();
    } catch {
      setError('The clip could not be saved. Check that you are signed in as an administrator.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="clip-kind" className={LABEL}>Type</label>
          <select id="clip-kind" className={INPUT} value={form.kind} onChange={(e) => update('kind', e.target.value as ClipKind)}>
            {KINDS.map((kind) => (
              <option key={kind} value={kind}>{CLIP_KIND_LABEL[kind]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="clip-publisher" className={LABEL}>Publisher</label>
          <input id="clip-publisher" className={INPUT} value={form.publisher_name} onChange={(e) => update('publisher_name', e.target.value)} />
        </div>
      </div>

      <div>
        <label htmlFor="clip-headline" className={LABEL}>Headline</label>
        <input id="clip-headline" className={INPUT} value={form.headline} onChange={(e) => update('headline', e.target.value)} maxLength={160} required />
      </div>

      <div>
        <label htmlFor="clip-description" className={LABEL}>Description</label>
        <textarea id="clip-description" rows={3} className={INPUT} value={form.description} onChange={(e) => update('description', e.target.value)} maxLength={1000} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="clip-video" className={LABEL}>Video link</label>
          <input id="clip-video" type="url" className={INPUT} placeholder="https://" value={form.video_url} onChange={(e) => update('video_url', e.target.value)} required />
          <p className="mt-1.5 text-xs text-slate-500">Direct MP4 or HLS (.m3u8) link, or a YouTube or Vimeo link.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="clip-poster" className={LABEL}>Poster image link</label>
          <input id="clip-poster" type="url" className={INPUT} placeholder="https://" value={form.poster_url} onChange={(e) => update('poster_url', e.target.value)} />
        </div>
        <div>
          <label htmlFor="clip-title" className={LABEL}>Linked title</label>
          <select id="clip-title" className={INPUT} value={form.title_id} onChange={(e) => update('title_id', e.target.value)}>
            <option value="">None</option>
            {titles.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="clip-duration" className={LABEL}>Length (sec)</label>
            <input id="clip-duration" inputMode="numeric" className={INPUT} value={form.duration_seconds} onChange={(e) => update('duration_seconds', e.target.value)} />
          </div>
          <div>
            <label htmlFor="clip-order" className={LABEL}>Order</label>
            <input id="clip-order" inputMode="numeric" className={INPUT} value={form.sort_order} onChange={(e) => update('sort_order', e.target.value)} />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-200">
        <input type="checkbox" className="h-4 w-4 accent-cinema-500" checked={form.is_published} onChange={(e) => update('is_published', e.target.checked)} />
        Published on Discover
      </label>

      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
          {saving ? 'Saving...' : clip ? 'Save clip' : 'Create clip'}
        </button>
      </div>
    </form>
  );
}
