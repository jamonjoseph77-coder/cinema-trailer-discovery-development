import { useState } from 'react';
import { Play } from 'lucide-react';
import { chipClass } from '@/components/ui/styles';
import { formatDuration } from '@/lib/format';
import type { SeasonWithEpisodes } from '@/lib/types';

interface EpisodeListProps {
  titleId: string;
  seasons: SeasonWithEpisodes[];
  currentEpisodeId?: string | null;
}

export function EpisodeList({ titleId, seasons, currentEpisodeId = null }: EpisodeListProps) {
  const initialSeason = seasons.findIndex((season) => season.episodes.some((episode) => episode.id === currentEpisodeId));
  const [seasonIndex, setSeasonIndex] = useState(Math.max(0, initialSeason));
  const season = seasons[seasonIndex];

  if (!season) {
    return <p className="text-sm text-slate-400">Episodes will appear here once they are added.</p>;
  }

  return (
    <div className="space-y-4">
      {seasons.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Seasons">
          {seasons.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === seasonIndex}
              onClick={() => setSeasonIndex(index)}
              className={chipClass(index === seasonIndex)}
            >
              {item.name || `Season ${item.number}`}
            </button>
          ))}
        </div>
      )}

      {season.episodes.length === 0 ? (
        <p className="text-sm text-slate-400">No episodes have been added to this season yet.</p>
      ) : (
        <ol className="space-y-2">
          {season.episodes.map((episode) => {
            const available = episode.playback_url.trim() !== '';
            const active = episode.id === currentEpisodeId;
            const row = (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-700 text-sm font-extrabold text-slate-200">
                  {episode.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-100">{episode.title}</span>
                  <span className="block text-xs text-slate-400">
                    {available ? formatDuration(episode.duration_minutes) || 'Ready to watch' : 'Not available yet'}
                  </span>
                </span>
                {available && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cinema-600/20 text-cinema-300">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                )}
              </>
            );
            return (
              <li key={episode.id}>
                {available ? (
                  <a
                    href={`/watch/${titleId}?ep=${episode.id}`}
                    aria-current={active ? 'true' : undefined}
                    className={`flex items-center gap-4 rounded-xl border p-3 transition ${
                      active
                        ? 'border-cinema-400/60 bg-cinema-600/15'
                        : 'border-white/10 bg-ink-850/60 hover:border-cinema-400/40 hover:bg-ink-800'
                    }`}
                  >
                    {row}
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-ink-900/50 p-3 opacity-60">
                    {row}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
