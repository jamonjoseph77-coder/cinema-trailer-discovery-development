import { UserRound } from 'lucide-react';
import { ProfileAvatar } from '@/components/social/ProfileAvatar';
import { ProfileForm } from '@/components/social/ProfileForm';
import { SignedOutGate } from '@/components/social/SignedOutGate';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { PAGE_CONTAINER } from '@/components/ui/styles';
import { useAuth } from '@/hooks/useAuth';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchProfile } from '@/lib/profiles';

function ProfileEditor({ userId }: { userId: string }) {
  const { data: profile, loading, error, reload } = useAsyncData(() => fetchProfile(userId), [userId]);

  if (loading && !profile) return <LoadingState />;
  if (error) return <ErrorState onRetry={reload} />;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <aside className="space-y-4 rounded-2xl border border-white/10 bg-ink-850/70 p-6 text-center lg:self-start">
        <div className="mx-auto w-fit">
          <ProfileAvatar name={profile?.display_name ?? 'C'} size="lg" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">{profile?.display_name ?? 'Your profile'}</p>
          <p className="text-sm text-slate-400">{profile ? `@${profile.username}` : 'Not set up yet'}</p>
        </div>
        {profile?.bio && <p className="text-sm text-slate-300">{profile.bio}</p>}
        <p className="text-xs text-slate-500">
          {profile?.is_discoverable ? 'Visible in friend search' : 'Hidden from friend search'}
        </p>
      </aside>
      <ProfileForm key={profile?.updated_at ?? 'new'} userId={userId} profile={profile} onSaved={reload} />
    </div>
  );
}

export function ProfilePage() {
  const { user, loading } = useAuth();

  return (
    <div className={`${PAGE_CONTAINER} space-y-10`}>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">Your Cinema</p>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <UserRound className="h-7 w-7 text-cinema-300" /> Profile and privacy
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">Choose how you appear to friends and whether people can find you.</p>
      </header>

      {loading && <LoadingState />}
      {!loading && !user && (
        <SignedOutGate
          icon={<UserRound className="h-7 w-7 text-cinema-300" />}
          title="Sign in to set up your profile"
          description="Your profile is how friends find you and how watch party guests see your name."
        />
      )}
      {!loading && user && <ProfileEditor userId={user.id} />}
    </div>
  );
}
