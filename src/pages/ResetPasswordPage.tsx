import { useState, type FormEvent } from 'react';
import { KeyRound, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { BUTTON_PRIMARY, CARD, INPUT, LABEL } from '@/components/ui/styles';
import { CinemaLogo } from '@/components/ui/CinemaLogo';
import { navigateTo } from '@/lib/router';

function linkErrorInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(`${window.location.search.slice(1)}&${window.location.hash.slice(1)}`);
  return params.has('error') || params.has('error_code');
}

function isLinkFailure(message: string): boolean {
  return /expired|invalid|session|jwt|token/i.test(message);
}

function InvalidResetLink() {
  return (
    <div className="mx-auto w-full max-w-md animate-rise-in px-4 py-12 sm:py-16">
      <div className="mb-8 flex justify-center">
        <CinemaLogo />
      </div>
      <div className={`${CARD} space-y-6 p-6 text-center sm:p-8`} role="alert">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-400/30">
          <LinkIcon className="h-5 w-5 text-rose-300" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">This reset link has expired</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            For your security, password reset links can only be used once and expire after a short time. Request a new link and we will email it to you straight away.
          </p>
        </div>
        <a href="/forgot-password" className={`${BUTTON_PRIMARY} w-full`}>Send a new reset link</a>
        <a href="/sign-in" className="block text-sm font-semibold text-slate-400 transition hover:text-white">Back to sign in</a>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const { completePasswordReset, user, loading, recoveryMode } = useAuth();
  const { notify } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(linkErrorInUrl);

  if (linkInvalid || (!loading && !user && !recoveryMode)) return <InvalidResetLink />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    const failure = await completePasswordReset(password);
    setBusy(false);
    if (failure) {
      if (isLinkFailure(failure)) setLinkInvalid(true);
      else setError(failure);
      return;
    }
    notify('Your password has been updated.');
    navigateTo('/my-cinema');
  }

  return (
    <div className="mx-auto w-full max-w-md animate-rise-in px-4 py-12 sm:py-16">
      <div className="mb-8 flex justify-center">
        <CinemaLogo />
      </div>
      <form onSubmit={handleSubmit} className={`${CARD} space-y-6 p-6 sm:p-8`} noValidate>
        <div className="space-y-2 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cinema-600/15 ring-1 ring-cinema-400/30">
            <KeyRound className="h-5 w-5 text-cinema-300" />
          </span>
          <h1 className="text-2xl font-extrabold text-white">Choose a new password</h1>
          <p className="text-sm text-slate-400">Pick a password you have not used on Cinema before.</p>
        </div>
        <div>
          <label htmlFor="new-password" className={LABEL}>New password</label>
          <input id="new-password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label htmlFor="confirm-password" className={LABEL}>Confirm password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={INPUT} />
        </div>
        {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <button type="submit" disabled={busy} className={`${BUTTON_PRIMARY} w-full`}>
          {busy ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
