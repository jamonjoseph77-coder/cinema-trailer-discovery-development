import { useState } from 'react';
import { Check, Clock, UserMinus, Users, X } from 'lucide-react';
import { PersonRow } from '@/components/social/PersonRow';
import { EmptyState } from '@/components/ui/StatusViews';
import { BUTTON_GHOST } from '@/components/ui/styles';
import { useAction } from '@/hooks/useAction';
import { acceptFriendRequest, removeFriendship, type FriendEntry } from '@/lib/friends';

interface FriendsListProps {
  friends: FriendEntry[];
  onChanged: () => void;
}

export function FriendsList({ friends, onChanged }: FriendsListProps) {
  const { pendingKey, run } = useAction(onChanged);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (friends.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-7 w-7 text-cinema-300" />}
        title="No friends yet"
        description="Find people by their username and send them a friend request."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {friends.map((entry) => {
        const confirming = confirmId === entry.friendshipId;
        return (
          <PersonRow key={entry.friendshipId} profile={entry.profile}>
            <button
              type="button"
              disabled={pendingKey === entry.friendshipId}
              onClick={() => {
                if (!confirming) {
                  setConfirmId(entry.friendshipId);
                  return;
                }
                setConfirmId(null);
                void run(entry.friendshipId, () => removeFriendship(entry.friendshipId), 'Friend removed.');
              }}
              className={`${BUTTON_GHOST} ${confirming ? 'text-rose-300 hover:text-rose-200' : ''}`}
            >
              <UserMinus className="h-4 w-4" /> {confirming ? 'Confirm remove' : 'Remove'}
            </button>
          </PersonRow>
        );
      })}
    </ul>
  );
}

interface FriendRequestsProps {
  incoming: FriendEntry[];
  outgoing: FriendEntry[];
  onChanged: () => void;
}

export function FriendRequests({ incoming, outgoing, onChanged }: FriendRequestsProps) {
  const { pendingKey, run } = useAction(onChanged);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Requests for you</h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-slate-500">No one is waiting for an answer from you.</p>
        ) : (
          <ul className="space-y-3">
            {incoming.map((entry) => (
              <PersonRow key={entry.friendshipId} profile={entry.profile}>
                <button
                  type="button"
                  disabled={pendingKey === entry.friendshipId}
                  onClick={() => void run(entry.friendshipId, () => acceptFriendRequest(entry.friendshipId), 'Friend request accepted.')}
                  className="inline-flex items-center gap-2 rounded-xl bg-cinema-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cinema-500 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> Accept
                </button>
                <button
                  type="button"
                  disabled={pendingKey === entry.friendshipId}
                  onClick={() => void run(entry.friendshipId, () => removeFriendship(entry.friendshipId), 'Request declined.')}
                  className={BUTTON_GHOST}
                >
                  <X className="h-4 w-4" /> Decline
                </button>
              </PersonRow>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Sent by you</h2>
        {outgoing.length === 0 ? (
          <p className="text-sm text-slate-500">You have no pending requests.</p>
        ) : (
          <ul className="space-y-3">
            {outgoing.map((entry) => (
              <PersonRow key={entry.friendshipId} profile={entry.profile}>
                <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4" /> Waiting for reply
                </span>
                <button
                  type="button"
                  disabled={pendingKey === entry.friendshipId}
                  onClick={() => void run(entry.friendshipId, () => removeFriendship(entry.friendshipId), 'Request cancelled.')}
                  className={BUTTON_GHOST}
                >
                  Cancel
                </button>
              </PersonRow>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
