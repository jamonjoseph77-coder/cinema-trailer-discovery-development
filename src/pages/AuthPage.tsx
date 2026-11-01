import { useState, type FormEvent } from 'react';
import { Clapperboard, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, INPUT, LABEL } from '@/components/ui/styles';
import { CinemaLogo } from '@/components/ui/CinemaLogo';
import { LoadingState } from '@/components/ui/StatusViews';
import { navigateTo } from '@/lib/router';

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string }> = {
  'sign-in': { title: 'Welcome back', subtitle: 'Sign in to your Cinema account.', submit: 'Sign in' },
  'sign-up': { title: 'Create your account', subtitle: 'Join Cinema to save titles and pick up where you left off.', submit: 'Create account' },
  'forgot-password': { title: 'Reset your password', subtitle: 'Enter your email and we will send you a link to choose a new password.', submit: 'Send reset link' },
};

export function AuthPage({ mode }: { mode: AuthMode }) {
  const { user, loading, signIn, signUp, requestPasswordReset, signOut } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const copy = COPY[mode];

  if (loading) return <div className="mx-auto max-w-md px-4 py-16"><LoadingState /></div>;

  if (user && mode !== 'forgot-password') {
    return (
      <div className="mx-auto max-w-md animate-rise-in px-4 py-16">
        <div className={`${CARD} space-y-5 text-center`}>
          <p className="text-lg font-extrabold text-white">You are signed in</p>
          <p className="text-sm text-slate-400">{user.email}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="/my-cinema" className={BUTTON_PRIMARY}>Go to My Cinema</a>
            <button type="button" onClick={() => void signOut()} className={BUTTON_SECONDARY}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const trimmedEmail = email.trim();
    if (mode === 'sign-up' && password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'sign-in') {
        const failure = await signIn(trimmedEmail, password);
        if (failure) setError(failure);
        else {
          notify('Welcome back to Cinema.');
          navigateTo('/my-cinema');
        }
      } else if (mode === 'sign-up') {
        const result = await signUp(trimmedEmail, password);
        if (result.error) setError(result.error);
        else if (result.needsConfirmation) setNotice('Check your inbox to confirm your email address, then sign in.');
        else {
          notify('Your Cinema account is ready.');
          navigateTo('/my-cinema');
        }
      } else {
        const failure = await requestPasswordReset(trimmedEmail);
        if (failure) setError(failure);
        else setNotice('If an account exists for this email, a reset link is on its way.');
      }
    } finally {
      setBusy(false);
    }
  }

  const Icon = mode === 'sign-in' ? LogIn : mode === 'sign-up' ? UserPlus : KeyRound;

  return (
    <div className="mx-auto w-full max-w-md animate-rise-in px-4 py-12 sm:py-16">
      <div className="mb-8 flex justify-center">
        <CinemaLogo />
      </div>
      <div className={`${CARD} space-y-6 p-6 sm:p-8`}>
        <div className="space-y-2 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cinema-600/15 ring-1 ring-cinema-400/30">
            <Icon className="h-5 w-5 text-cinema-300" />
          </span>
          <h1 className="text-2xl font-extrabold text-white">{copy.title}</h1>
          <p className="text-sm leading-relaxed text-slate-400">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="auth-email" className={LABEL}>Email</label>
            <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} placeholder="you@example.com" />
          </div>
          {mode !== 'forgot-password' && (
            <div>
              <label htmlFor="auth-password" className={LABEL}>Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT}
                placeholder={mode === 'sign-up' ? 'At least 8 characters' : 'Your password'}
              />
            </div>
          )}

          {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

          <button type="submit" disabled={busy} className={`${BUTTON_PRIMARY} w-full`}>
            {busy ? 'Please wait...' : copy.submit}
          </button>
        </form>

        <div className="space-y-2 text-center text-sm text-slate-400">
          {mode === 'sign-in' && (
            <>
              <p>New to Cinema? <a href="/sign-up" className="font-semibold text-cinema-300 hover:text-white">Create an account</a></p>
              <p><a href="/forgot-password" className="font-semibold text-cinema-300 hover:text-white">Forgot your password?</a></p>
            </>
          )}
          {mode === 'sign-up' && (
            <p>Already have an account? <a href="/sign-in" className="font-semibold text-cinema-300 hover:text-white">Sign in</a></p>
          )}
          {mode === 'forgot-password' && (
            <p>Remembered it? <a href="/sign-in" className="font-semibold text-cinema-300 hover:text-white">Back to sign in</a></p>
          )}
        </div>
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Clapperboard className="h-3.5 w-3.5" /> Secure sign-in powered by Cinema
      </p>
    </div>
  );
}
