import { useEffect, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { PersonRow } from '@/components/social/PersonRow';
import { LoadingState, ErrorState } from '@/components/ui/StatusViews';
import { INPUT } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAction } from '@/hooks/useAction';
import { acceptFriendRequest, removeFriendship, sendFriendRequest, type FriendsSnapshot } from '@/lib/friends';
import { searchProfiles } from '@/lib/profiles';

interface FindPeopleProps {
  userId: string;
  relations: FriendsSnapshot['relations'];
  onChanged: () => void;
}

function normaliseTerm(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export function FindPeople({ userId, relations, onChanged }: FindPeopleProps) {
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');
  const { pendingKey, run } = useAction(onChanged);

  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(normaliseTerm(input)), 300);
    return () => window.clearTimeout(timer);
  }, [input]);

  const results = useAsyncData(
    () => (term.length >= 2 ? searchProfiles(term, userId) : Promise.resolve([])),
    [term, userId],
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search by username"
          aria-label="Search by username"
          className={`${INPUT} pl-11`}
        />
      </div>

      {term.length < 2 ? (
        <p className="text-sm text-slate-500">Type at least two characters of a username to find people.</p>
      ) : results.loading && !results.data ? (
        <LoadingState label="Searching" />
      ) : results.error ? (
        <ErrorState onRetry={results.reload} />
      ) : results.data && results.data.length === 0 ? (
        <p className="text-sm text-slate-400">No one matches &ldquo;{term}&rdquo;. Check the spelling or try part of the name.</p>
      ) : (
        <ul className="space-y-3">
          {results.data?.map((profile) => {
            const relation = relations.get(profile.user_id);
            return (
              <PersonRow key={profile.user_id} profile={profile}>
                {!relation && (
                  <button
                    type="button"
                    disabled={pendingKey === profile.user_id}
                    onClick={() =>
                      void run(profile.user_id, () => sendFriendRequest(userId, profile.user_id), 'Friend request sent.')
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-cinema-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cinema-500 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" /> Add friend
                  </button>
                )}
                {relation?.state === 'friends' && (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Friends
                  </span>
                )}
                {relation?.state === 'outgoing' && (
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-300">
                    Request sent
                  </span>
                )}
                {relation?.state === 'incoming' && (
                  <button
                    type="button"
                    disabled={pendingKey === profile.user_id}
                    onClick={() =>
                      void run(profile.user_id, () => acceptFriendRequest(relation.friendshipId), 'Friend request accepted.')
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-cinema-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cinema-500 disabled:opacity-50"
                  >
                    Accept request
                  </button>
                )}
                {relation?.state === 'outgoing' && (
                  <button
                    type="button"
                    disabled={pendingKey === profile.user_id}
                    onClick={() => void run(profile.user_id, () => removeFriendship(relation.friendshipId), 'Request cancelled.')}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </PersonRow>
            );
          })}
        </ul>
      )}
    </div>
  );
}
