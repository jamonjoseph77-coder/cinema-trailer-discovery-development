import { useState, type FormEvent } from 'react';
import { PartyPopper } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { BUTTON_PRIMARY, INPUT, LABEL } from '@/components/ui/styles';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/hooks/useToast';
import { fetchPublishedTitles } from '@/lib/library';
import { createWatchParty } from '@/lib/watchParties';
import type { Title, WatchPartyVisibility } from '@/lib/types';

interface CreatePartyDialogProps {
  userId: string;
  onClose: () => void;
  onCreated: (partyId: string) => void;
}

const VISIBILITY_OPTIONS: { value: WatchPartyVisibility; label: string; description: string }[] = [
  { value: 'private', label: 'Private', description: 'Only people with the invite code can join.' },
  { value: 'public', label: 'Public', description: 'Anyone signed in to Cinema can find and join.' },
];

export function CreatePartyDialog({ userId, onClose, onCreated }: CreatePartyDialogProps) {
  const { notify } = useToast();
  const titles = useAsyncData(fetchPublishedTitles, []);
  const [titleId, setTitleId] = useState('');
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<WatchPartyVisibility>('private');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const watchable = (titles.data ?? []).filter((item: Title) => item.type !== 'news');

  function handleTitleChange(nextId: string) {
    setTitleId(nextId);
    const picked = watchable.find((item) => item.id === nextId);
    if (picked && !name.trim()) setName(`${picked.title} watch party`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!titleId) return setError('Choose the title you want to watch.');
    if (cleanName.length < 1 || cleanName.length > 80) return setError('Give your party a name up to 80 characters long.');
    const scheduledIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    if (scheduledIso && new Date(scheduledIso).getTime() < Date.now() - 60_000) {
      return setError('Choose a start time in the future.');
    }

    setError(null);
    setSaving(true);
    try {
      const party = await createWatchParty({
        host_id: userId,
        title_id: titleId,
        name: cleanName,
        visibility,
        scheduled_at: scheduledIso,
      });
      notify('Watch party created.');
      onCreated(party.id);
    } catch {
      setError('The watch party could not be created. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal label="Create a watch party" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6 pt-2" noValidate>
        <div className="flex items-center gap-3 pr-10">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cinema-600/20 text-cinema-200">
            <PartyPopper className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Create a watch party</h2>
            <p className="text-sm text-slate-400">Pick a title, then invite people to watch it with you.</p>
          </div>
        </div>

        {titles.loading && !titles.data && <LoadingState label="Loading titles" />}
        {titles.error && <ErrorState onRetry={titles.reload} />}

        {titles.data && (
          <>
            <div>
              <label htmlFor="party-title" className={LABEL}>
                Title
              </label>
              <select
                id="party-title"
                value={titleId}
                onChange={(event) => handleTitleChange(event.target.value)}
                className={INPUT}
              >
                <option value="">Choose a title</option>
                {watchable.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="party-name" className={LABEL}>
                Party name
              </label>
              <input
                id="party-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                className={INPUT}
                placeholder="Friday night film club"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className={LABEL}>Who can join</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {VISIBILITY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      visibility === option.value
                        ? 'border-cinema-400 bg-cinema-600/15'
                        : 'border-white/10 bg-ink-900/60 hover:border-white/25'
                    }`}
                  >
                    <input
                      type="radio"
                      name="party-visibility"
                      value={option.value}
                      checked={visibility === option.value}
                      onChange={() => setVisibility(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-white">{option.label}</span>
                    <span className="mt-1 block text-xs text-slate-400">{option.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="party-start" className={LABEL}>
                Start time (optional)
              </label>
              <input
                id="party-start"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className={INPUT}
              />
              <p className="mt-2 text-xs text-slate-500">Leave empty to start the party whenever you are ready.</p>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
                {saving ? 'Creating...' : 'Create party'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
