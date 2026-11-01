import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { checkIsAdmin } from '@/lib/library';

export interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  recoveryMode: boolean;
  refreshAdmin: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  completePasswordReset: (password: string) => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function describeAuthError(error: AuthError): string {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (message.includes('already registered')) return 'An account with this email already exists. Try signing in instead.';
  if (message.includes('email not confirmed')) return 'Please confirm your email address first. Check your inbox.';
  if (message.includes('rate limit')) return 'Too many attempts. Wait a moment and try again.';
  if (message.includes('password')) return error.message;
  if (message.includes('fetch') || message.includes('network')) {
    return 'We could not reach Cinema. Check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
      if (event === 'SIGNED_OUT') setRecoveryMode(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  const refreshAdmin = useCallback(async () => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    try {
      setIsAdmin(await checkIsAdmin());
    } catch {
      setIsAdmin(false);
    }
  }, [userId]);

  useEffect(() => {
    void refreshAdmin();
  }, [refreshAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? describeAuthError(error) : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return { error: describeAuthError(error), needsConfirmation: false };
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? describeAuthError(error) : null;
  }, []);

  const completePasswordReset = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return describeAuthError(error);
    setRecoveryMode(false);
    return null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAdmin,
      loading,
      recoveryMode,
      refreshAdmin,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      completePasswordReset,
    }),
    [session, isAdmin, loading, recoveryMode, refreshAdmin, signIn, signUp, signOut, requestPasswordReset, completePasswordReset],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
