import { useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { saveProfile } from '@/lib/profiles';
import type { Profile } from '@/lib/types';
import { BUTTON_PRIMARY, CARD, INPUT, LABEL } from '@/components/ui/styles';

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

interface ProfileFormProps {
  userId: string;
  profile: Profile | null;
  onSaved: () => void;
}

export function ProfileForm({ userId, profile, onSaved }: ProfileFormProps) {
  const { notify } = useToast();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [discoverable, setDiscoverable] = useState(profile?.is_discoverable ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = displayName.trim();
    if (!USERNAME_PATTERN.test(cleanUsername)) {
      setError('Usernames use 3 to 24 letters, numbers or underscores.');
      return;
    }
    if (cleanName.length < 1 || cleanName.length > 60) {
      setError('Enter a display name up to 60 characters long.');
      return;
    }
    if (bio.length > 280) {
      setError('Your bio can be up to 280 characters.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await saveProfile(
        userId,
        { username: cleanUsername, display_name: cleanName, bio: bio.trim(), is_discoverable: discoverable },
        profile !== null,
      );
      notify(profile ? 'Profile saved.' : 'Welcome to Cinema. Your profile is ready.');
      onSaved();
    } catch (saveError) {
      const duplicate = (saveError as { code?: string }).code === '23505';
      setError(duplicate ? 'That username is already taken. Try another.' : 'Your profile could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${CARD} space-y-6`} noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-username" className={LABEL}>
            Username
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">@</span>
            <input
              id="profile-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={24}
              autoComplete="off"
              className={`${INPUT} pl-8`}
              placeholder="yourname"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Friends find you by this name.</p>
        </div>
        <div>
          <label htmlFor="profile-display-name" className={LABEL}>
            Display name
          </label>
          <input
            id="profile-display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={60}
            className={INPUT}
            placeholder="How you appear to others"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="profile-bio" className={LABEL}>
            Bio
          </label>
          <span className="text-xs text-slate-500">{bio.length}/280</span>
        </div>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={280}
          rows={3}
          className={`${INPUT} resize-none`}
          placeholder="Your favourite genres, or what you are watching"
        />
      </div>

      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/10 bg-ink-900/60 p-4">
        <span>
          <span className="block text-sm font-semibold text-white">Let people find me</span>
          <span className="mt-1 block text-sm text-slate-400">
            When off, you will not appear in friend search. People you add or who add you can still see your profile.
          </span>
        </span>
        <span className="relative mt-1 inline-flex shrink-0">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={discoverable}
            onChange={(event) => setDiscoverable(event.target.checked)}
          />
          <span className="h-6 w-11 rounded-full bg-white/15 transition peer-checked:bg-cinema-600 peer-focus-visible:ring-2 peer-focus-visible:ring-cinema-400" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : profile ? 'Save changes' : 'Create profile'}
        </button>
      </div>
    </form>
  );
}
