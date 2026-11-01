import { useEffect, useState } from 'react';
import { ArrowLeft, Clapperboard, DoorOpen, Lock, PartyPopper, Play, Square } from 'lucide-react';
import { PartyChat } from '@/components/social/PartyChat';
import { ProfileAvatar } from '@/components/social/ProfileAvatar';
import { SignedOutGate } from '@/components/social/SignedOutGate';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_GHOST, BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, PAGE_CONTAINER } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { fetchTitleDetail } from '@/lib/library';
import { navigateTo } from '@/lib/router';
import {
  describeSchedule,
  fetchPartyMembers,
  fetchPartyWithTitle,
  joinPublicParty,
  leaveParty,
  PARTY_STATUS_LABEL,
  setPartyStatus,
  subscribeToPartyChanges,
  type PartyMemberEntry,
  type WatchPartyWithTitle,
} from '@/lib/watchParties';
import type { WatchPartyStatus } from '@/lib/types';

interface RoomSnapshot {
  party: WatchPartyWithTitle | null;
  members: PartyMemberEntry[];
  playbackUrl: string;
  subtitleUrl: string;
}

async function loadRoom(partyId: string): Promise<RoomSnapshot> {
  const party = await fetchPartyWithTitle(partyId);
  if (!party) return { party: null, members: [], playbackUrl: '', subtitleUrl: '' };
  const [members, detail] = await Promise.all([fetchPartyMembers(partyId), fetchTitleDetail(party.title_id)]);
  return {
    party,
    members,
    playbackUrl: detail.title?.playback_url.trim() ?? '',
    subtitleUrl: detail.title?.subtitle_url.trim() ?? '',
  };
}

const STATUS_PILL: Record<WatchPartyStatus, string> = {
  scheduled: 'bg-slate-700/70 text-slate-200',
  live: 'bg-rose-500/20 text-rose-200',
  ended: 'bg-ink-800 text-slate-400',
};

function RoomView({ partyId, userId }: { partyId: string; userId: string }) {
  const { notify } = useToast();
  const room = useAsyncData(() => loadRoom(partyId), [partyId]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribers = [
      subscribeToPartyChanges(`room-party-${partyId}`, 'watch_parties', `id=eq.${partyId}`, room.reload),
      subscribeToPartyChanges(`room-members-${partyId}`, 'watch_party_members', `party_id=eq.${partyId}`, room.reload),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [partyId, room.reload]);

  if (!room.data) {
    return room.error ? <ErrorState onRetry={room.reload} /> : <LoadingState />;
  }

  const { party, members, playbackUrl, subtitleUrl } = room.data;
  if (!party) {
    return (
      <EmptyState
        icon={<PartyPopper className="h-7 w-7 text-cinema-300" />}
        title="This watch party is not available"
        description="It may have been removed, or you may not have access to it."
        action={
          <a href="/watch-parties" className={BUTTON_SECONDARY}>
            Back to Watch Parties
          </a>
        }
      />
    );
  }

  const isHost = party.host_id === userId;
  const isMember = members.some((member) => member.userId === userId);
  const canJoin = !isMember && party.visibility === 'public' && party.status !== 'ended';

  async function run(action: () => Promise<void>, failure: string, onDone?: () => void) {
    setBusy(true);
    try {
      await action();
      onDone?.();
      room.reload();
    } catch {
      notify(failure, 'error');
    } finally {
      setBusy(false);
    }
  }

  const changeStatus = (status: WatchPartyStatus) =>
    run(() => setPartyStatus(party!.id, status), 'The party status could not be updated.');

  const handleLeave = () =>
    run(() => leaveParty(party!.id, userId), 'You could not leave the party. Please try again.', () =>
      navigateTo('/watch-parties'),
    );

  const handleJoin = () =>
    run(() => joinPublicParty(party!.id, userId), 'We could not join this party.');

  const hostNames = new Map(members.map((member) => [member.userId, member.profile?.display_name ?? 'Cinema member']));

  return (
    <div className="space-y-8">
      <a href="/watch-parties" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> All watch parties
      </a>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          {playbackUrl ? (
            <VideoPlayer
              key={`${party.id}-${playbackUrl}`}
              src={playbackUrl}
              title={party.title?.title ?? party.name}
              poster={party.title?.backdrop_url || party.title?.poster_url || undefined}
              subtitleUrl={subtitleUrl || undefined}
              isLive={party.title?.type === 'live'}
            />
          ) : (
            <EmptyState
              icon={<Clapperboard className="h-7 w-7 text-cinema-300" />}
              title="Nothing to play yet"
              description="A playback link has not been added for this title, so the room has no video to show."
            />
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_PILL[party.status]}`}>
                {PARTY_STATUS_LABEL[party.status]}
              </span>
              <span className="text-xs text-slate-400">{describeSchedule(party)}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{party.name}</h1>
            <p className="text-sm text-slate-400">
              {party.title?.title ?? 'Unknown title'} · Hosted by {hostNames.get(party.host_id) ?? 'the host'}
            </p>
            <p className="text-xs text-slate-500">
              Each guest controls their own player. Playback is not synchronised across the room yet.
            </p>
          </div>

          {isHost && (
            <section className={`${CARD} space-y-4`}>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-cinema-300">Host controls</h2>
              <div className="flex flex-wrap gap-3">
                {party.status !== 'live' && party.status !== 'ended' && (
                  <button type="button" disabled={busy} onClick={() => void changeStatus('live')} className={BUTTON_PRIMARY}>
                    <Play className="h-4 w-4" /> Start party
                  </button>
                )}
                {party.status !== 'ended' && (
                  <button type="button" disabled={busy} onClick={() => void changeStatus('ended')} className={BUTTON_SECONDARY}>
                    <Square className="h-4 w-4" /> End party
                  </button>
                )}
              </div>
              {party.visibility === 'private' && (
                <p className="flex items-center gap-2 text-sm text-slate-300">
                  <Lock className="h-4 w-4 text-cinema-300" /> Invite code:{' '}
                  <span className="font-mono tracking-[0.2em] text-white">{party.invite_code}</span>
                </p>
              )}
            </section>
          )}
        </div>

        <div className="space-y-6">
          {!isMember && (
            <section className={`${CARD} space-y-4`}>
              <h2 className="font-bold text-white">Join this party</h2>
              {canJoin ? (
                <button type="button" disabled={busy} onClick={() => void handleJoin()} className={BUTTON_PRIMARY}>
                  <DoorOpen className="h-4 w-4" /> Join party
                </button>
              ) : (
                <p className="text-sm text-slate-400">
                  {party.status === 'ended'
                    ? 'This party has ended.'
                    : 'This party is private. Use the invite code on the Watch Parties page to join.'}
                </p>
              )}
            </section>
          )}

          <section className={`${CARD} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white">In the room</h2>
              <span className="text-xs text-slate-400">{members.length} joined</span>
            </div>
            <ul className="space-y-3">
              {members.map((member) => {
                const name = member.profile?.display_name ?? 'Cinema member';
                return (
                  <li key={member.userId} className="flex items-center gap-3">
                    <ProfileAvatar name={name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {name}
                        {member.userId === userId && <span className="text-slate-400"> (you)</span>}
                      </p>
                      <p className="text-xs capitalize text-slate-500">{member.role}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            {isMember && !isHost && (
              <button type="button" disabled={busy} onClick={() => void handleLeave()} className={BUTTON_GHOST}>
                Leave party
              </button>
            )}
          </section>

          {isMember ? (
            <PartyChat partyId={party.id} userId={userId} canPost={isMember} isHost={isHost} />
          ) : (
            <p className="text-sm text-slate-500">Join the room to see and send chat messages.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function WatchPartyRoomPage({ partyId }: { partyId: string }) {
  const { user, loading } = useAuth();

  return (
    <div className={`${PAGE_CONTAINER} space-y-8`}>
      {loading && <LoadingState />}
      {!loading && !user && (
        <SignedOutGate
          icon={<PartyPopper className="h-7 w-7 text-cinema-300" />}
          title="Sign in to enter this room"
          description="Watch parties and their chat are only available to signed-in members."
        />
      )}
      {!loading && user && <RoomView partyId={partyId} userId={user.id} />}
    </div>
  );
}
