import { Lock, Globe2 } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/components/ui/styles';
import { describeSchedule, PARTY_STATUS_LABEL, type WatchPartyWithTitle } from '@/lib/watchParties';

interface PartyCardProps {
  party: WatchPartyWithTitle;
  joined: boolean;
  joining: boolean;
  onJoin: (party: WatchPartyWithTitle) => void;
}

const STATUS_STYLE: Record<WatchPartyWithTitle['status'], string> = {
  scheduled: 'border-sky-400/40 bg-sky-500/15 text-sky-200',
  live: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
  ended: 'border-white/15 bg-white/10 text-slate-300',
};

export function PartyCard({ party, joined, joining, onJoin }: PartyCardProps) {
  const artwork = party.title?.backdrop_url || party.title?.poster_url || '';
  const VisibilityIcon = party.visibility === 'public' ? Globe2 : Lock;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-850/70 transition duration-300 hover:-translate-y-1 hover:border-cinema-400/40 hover:shadow-xl hover:shadow-black/40">
      <div className="relative aspect-video overflow-hidden bg-ink-900">
        <Artwork
          src={artwork}
          alt=""
          fallbackTitle={party.title?.title}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
        <span
          className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[party.status]}`}
        >
          {PARTY_STATUS_LABEL[party.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-bold text-white">{party.name}</h3>
          <p className="line-clamp-1 text-sm text-slate-400">{party.title?.title ?? 'Title unavailable'}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <VisibilityIcon className="h-3.5 w-3.5" />
          <span>{party.visibility === 'public' ? 'Public' : 'Private'}</span>
          <span aria-hidden="true">·</span>
          <span className="line-clamp-1">{describeSchedule(party)}</span>
        </div>
        <div className="mt-auto">
          {joined ? (
            <a href={`/watch-parties/${party.id}`} className={`${BUTTON_SECONDARY} w-full`}>
              Open room
            </a>
          ) : (
            <button
              type="button"
              disabled={joining}
              onClick={() => onJoin(party)}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {joining ? 'Joining...' : 'Join party'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
