import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/useToast';
import { INPUT, LABEL, BUTTON_PRIMARY, CARD } from '@/components/ui/styles';
import { isHttpUrl } from '@/lib/media';
import { saveTitle } from '@/lib/library';
import { TITLE_TYPES, TITLE_TYPE_LABELS, type Title, type TitleInput, type TitleType } from '@/lib/types';

interface FormState {
  type: TitleType;
  title: string;
  synopsis: string;
  genre: string;
  release_year: string;
  release_date: string;
  duration_minutes: string;
  publisher: string;
  poster_url: string;
  backdrop_url: string;
  trailer_url: string;
  playback_url: string;
  subtitle_url: string;
  availability: string;
  is_featured: boolean;
  is_published: boolean;
}

const EMPTY_FORM: FormState = {
  type: 'movie', title: '', synopsis: '', genre: '', release_year: '', release_date: '', duration_minutes: '',
  publisher: '', poster_url: '', backdrop_url: '', trailer_url: '', playback_url: '', subtitle_url: '',
  availability: '', is_featured: false, is_published: false,
};

function toForm(title: Title): FormState {
  return {
    type: title.type,
    title: title.title,
    synopsis: title.synopsis,
    genre: title.genre,
    release_year: title.release_year?.toString() ?? '',
    release_date: title.release_date ?? '',
    duration_minutes: title.duration_minutes?.toString() ?? '',
    publisher: title.publisher,
    poster_url: title.poster_url,
    backdrop_url: title.backdrop_url,
    trailer_url: title.trailer_url,
    playback_url: title.playback_url,
    subtitle_url: title.subtitle_url,
    availability: title.availability,
    is_featured: title.is_featured,
    is_published: title.is_published,
  };
}

function parseWhole(value: string): number | null | 'invalid' {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 'invalid';
}

function buildInput(form: FormState): { input?: TitleInput; error?: string } {
  if (!form.title.trim()) return { error: 'Give the title a name.' };
  const year = parseWhole(form.release_year);
  const minutes = parseWhole(form.duration_minutes);
  if (year === 'invalid' || minutes === 'invalid') return { error: 'Release year and runtime must be whole numbers.' };
  const urlFields = [form.poster_url, form.backdrop_url, form.trailer_url, form.playback_url, form.subtitle_url];
  if (!urlFields.every(isHttpUrl)) return { error: 'Links must start with http:// or https://.' };

  return {
    input: {
      type: form.type,
      title: form.title.trim(),
      synopsis: form.synopsis.trim(),
      genre: form.genre.trim(),
      release_year: year,
      release_date: form.release_date || null,
      duration_minutes: minutes,
      publisher: form.publisher.trim(),
      poster_url: form.poster_url.trim(),
      backdrop_url: form.backdrop_url.trim(),
      trailer_url: form.trailer_url.trim(),
      playback_url: form.playback_url.trim(),
      subtitle_url: form.subtitle_url.trim(),
      availability: form.availability.trim(),
      is_featured: form.is_featured,
      is_published: form.is_published,
    },
  };
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TitleForm({ initial, onSaved }: { initial: Title | null; onSaved: (title: Title) => void }) {
  const { notify } = useToast();
  const [form, setForm] = useState<FormState>(initial ? toForm(initial) : EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const built = buildInput(form);
    if (!built.input) {
      setError(built.error ?? 'Please check the form.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const saved = await saveTitle(built.input, initial?.id ?? null);
      notify(initial ? 'Changes saved.' : 'Title created. Add seasons and episodes below.');
      onSaved(saved);
    } catch {
      setError('The title could not be saved. Check your connection and that you are still an administrator.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${CARD} space-y-8`} noValidate>
      <section className="grid gap-6 md:grid-cols-2">
        <Field id="f-type" label="Type">
          <select id="f-type" className={INPUT} value={form.type} onChange={(e) => set('type', e.target.value as TitleType)}>
            {TITLE_TYPES.map((type) => <option key={type} value={type}>{TITLE_TYPE_LABELS[type]}</option>)}
          </select>
        </Field>
        <Field id="f-title" label="Title">
          <input id="f-title" className={INPUT} value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field id="f-synopsis" label="Synopsis">
            <textarea id="f-synopsis" rows={4} className={INPUT} value={form.synopsis} onChange={(e) => set('synopsis', e.target.value)} />
          </Field>
        </div>
        <Field id="f-genre" label="Genres" hint="Separate several genres with commas.">
          <input id="f-genre" className={INPUT} value={form.genre} onChange={(e) => set('genre', e.target.value)} />
        </Field>
        <Field id="f-publisher" label="Publisher">
          <input id="f-publisher" className={INPUT} value={form.publisher} onChange={(e) => set('publisher', e.target.value)} />
        </Field>
        <Field id="f-year" label="Release year">
          <input id="f-year" inputMode="numeric" className={INPUT} value={form.release_year} onChange={(e) => set('release_year', e.target.value)} />
        </Field>
        <Field id="f-date" label="Release date" hint="Set a future date to show the title as coming soon.">
          <input id="f-date" type="date" className={INPUT} value={form.release_date} onChange={(e) => set('release_date', e.target.value)} />
        </Field>
        <Field id="f-runtime" label="Runtime (minutes)">
          <input id="f-runtime" inputMode="numeric" className={INPUT} value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} />
        </Field>
        <Field id="f-availability" label="Availability note">
          <input id="f-availability" className={INPUT} value={form.availability} onChange={(e) => set('availability', e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-6">
        <p className="text-sm font-semibold text-white">Artwork and playback</p>
        <Field id="f-poster" label="Poster image link">
          <input id="f-poster" type="url" className={INPUT} value={form.poster_url} onChange={(e) => set('poster_url', e.target.value)} />
        </Field>
        <Field id="f-backdrop" label="Wide backdrop image link">
          <input id="f-backdrop" type="url" className={INPUT} value={form.backdrop_url} onChange={(e) => set('backdrop_url', e.target.value)} />
        </Field>
        <Field id="f-trailer" label="Trailer link" hint="A direct MP4 or HLS (.m3u8) link, or a YouTube or Vimeo link.">
          <input id="f-trailer" type="url" className={INPUT} value={form.trailer_url} onChange={(e) => set('trailer_url', e.target.value)} />
        </Field>
        <Field id="f-playback" label="Playback link" hint="For movies, sports, news and live channels. MP4 or HLS (.m3u8). Series use episode links.">
          <input id="f-playback" type="url" className={INPUT} value={form.playback_url} onChange={(e) => set('playback_url', e.target.value)} />
        </Field>
        <Field id="f-subtitles" label="Subtitles link" hint="WebVTT file (.vtt) on a host that allows browser access.">
          <input id="f-subtitles" type="url" className={INPUT} value={form.subtitle_url} onChange={(e) => set('subtitle_url', e.target.value)} />
        </Field>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-200">
          <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="h-4 w-4 accent-cinema-500" />
          Published (visible to everyone)
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-200">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="h-4 w-4 accent-cinema-500" />
          Featured on the home banner
        </label>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={busy} className={BUTTON_PRIMARY}>
          {busy ? 'Saving...' : initial ? 'Save changes' : 'Create title'}
        </button>
      </div>
    </form>
  );
}
