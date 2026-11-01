import { useState } from 'react';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { chipClass } from '@/components/ui/styles';
import { FindPeople } from '@/components/social/FindPeople';
import { FriendRequests, FriendsList } from '@/components/social/FriendsList';
import { useAsyncData } from '@/hooks/useAsyncData';
import { loadFriendsSnapshot } from '@/lib/friends';

type Tab = 'friends' | 'requests' | 'find';

const TABS: { key: Tab; label: string }[] = [
  { key: 'friends', label: 'Friends' },
  { key: 'requests', label: 'Requests' },
  { key: 'find', label: 'Find people' },
];

export function FriendsHub({ userId }: { userId: string }) {
  const { data: snapshot, error, reload } = useAsyncData(() => loadFriendsSnapshot(userId), [userId]);
  const [tab, setTab] = useState<Tab>('friends');

  if (!snapshot) return error ? <ErrorState onRetry={reload} /> : <LoadingState />;

  const requestCount = snapshot.incoming.length;

  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Friends sections" className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`${chipClass(tab === item.key)} inline-flex shrink-0 items-center gap-2`}
          >
            {item.label}
            {item.key === 'friends' && <span className="text-xs opacity-70">{snapshot.friends.length}</span>}
            {item.key === 'requests' && requestCount > 0 && (
              <span className="rounded-full bg-cinema-400 px-1.5 text-xs font-bold text-ink-950">{requestCount}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'friends' && <FriendsList friends={snapshot.friends} onChanged={reload} />}
      {tab === 'requests' && (
        <FriendRequests incoming={snapshot.incoming} outgoing={snapshot.outgoing} onChanged={reload} />
      )}
      {tab === 'find' && <FindPeople userId={userId} relations={snapshot.relations} onChanged={reload} />}
    </div>
  );
}
