import { UserPlus, Users } from 'lucide-react';
import { FriendsHub } from '@/components/social/FriendsHub';
import { SignedOutGate } from '@/components/social/SignedOutGate';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, PAGE_CONTAINER, SECTION_HEADING } from '@/components/ui/styles';
import { useAuth } from '@/hooks/useAuth';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchProfile } from '@/lib/profiles';

function FriendsGate({ userId }: { userId: string }) {
  const profile = useAsyncData(() => fetchProfile(userId), [userId]);

  if (profile.loading) return <LoadingState />;
  if (profile.error) return <ErrorState onRetry={profile.reload} />;
  if (!profile.data) {
    return (
      <EmptyState
        icon={<UserPlus className="h-7 w-7 text-cinema-300" />}
        title="Create your profile first"
        description="Choose a username so friends can find you. You can change your details at any time."
        action={
          <a href="/profile" className={BUTTON_PRIMARY}>
            Create profile
          </a>
        }
      />
    );
  }

  return <FriendsHub userId={userId} />;
}

export function FriendsPage() {
  const { user, loading } = useAuth();

  return (
    <div className={`${PAGE_CONTAINER} space-y-10`}>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cinema-300">Your Cinema</p>
        <h1 className={`${SECTION_HEADING} flex items-center gap-3 text-3xl sm:text-4xl`}>
          <Users className="h-7 w-7 text-cinema-300" /> Friends
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">Connect with people, respond to requests and keep your circle close.</p>
      </header>

      {loading && <LoadingState />}
      {!loading && !user && (
        <SignedOutGate
          icon={<Users className="h-7 w-7 text-cinema-300" />}
          title="Sign in to see friends"
          description="Add friends by username and see the people you connect with on Cinema."
        />
      )}
      {!loading && user && <FriendsGate userId={user.id} />}
    </div>
  );
}
