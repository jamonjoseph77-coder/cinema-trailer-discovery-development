import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/useToast';
import { BUTTON_PRIMARY, BUTTON_GHOST, CARD, INPUT, LABEL } from '@/components/ui/styles';
import { isHttpUrl } from '@/lib/media';
import { deleteEpisode, deleteSeason, saveEpisode, saveSeason } from '@/lib/library';
import type { SeasonWithEpisodes } from '@/lib/types';

interface SeasonManagerProps {
  titleId: string;
  seasons: SeasonWithEpisodes[];
  onChanged: () => void;
}

function nextNumber(numbers: number[]): number {
  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
}

export function SeasonManager({ titleId, seasons, onChanged }: SeasonManagerProps) {
  const { notify } = useToast();
  const [seasonNumber, setSeasonNumber] = useState(String(nextNumber(seasons.map((s) => s.number))));
  const [seasonName, setSeasonName] = useState('');
  const [episodeSeason, setEpisodeSeason] = useState(seasons[0]?.id ?? '');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeMinutes, setEpisodeMinutes] = useState('');
  const [episodeUrl, setEpisodeUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>, success: string) {
    setError(null);
    setBusy(true);
    try {
      await action();
      notify(success);
      onChanged();
    } catch {
      setError('That change could not be saved. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  function handleAddSeason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = Number(seasonNumber);
    if (!Number.isInteger(number) || number < 1) {
      setError('Season number must be 1 or higher.');
      return;
    }
    void run(async () => {
      await saveSeason({ title_id: titleId, number, name: seasonName.trim() });
      setSeasonName('');
      setSeasonNumber(String(number + 1));
    }, 'Season added.');
  }

  function handleAddEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = Number(episodeNumber);
    const minutes = episodeMinutes.trim() === '' ? null : Number(episodeMinutes);
    if (!episodeSeason) {
      setError('Add a season before adding episodes.');
      return;
    }
    if (!Number.isInteger(number) || number < 1 || !episodeTitle.trim()) {
      setError('Each episode needs a title and a number of 1 or higher.');
      return;
    }
    if (minutes !== null && (!Number.isInteger(minutes) || minutes < 0)) {
      setError('Runtime must be a whole number of minutes.');
      return;
    }
    if (!isHttpUrl(episodeUrl)) {
      setError('The playback link must start with http:// or https://.');
      return;
    }
    void run(async () => {
      await saveEpisode({
        season_id: episodeSeason,
        number,
        title: episodeTitle.trim(),
        synopsis: '',
        duration_minutes: minutes,
        playback_url: episodeUrl.trim(),
        thumbnail_url: '',
      });
      setEpisodeTitle('');
      setEpisodeUrl('');
      setEpisodeMinutes('');
      setEpisodeNumber(String(number + 1));
    }, 'Episode added.');
  }

  function confirmDelete(message: string, action: () => Promise<void>, success: string) {
    if (window.confirm(message)) void run(action, success);
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleAddSeason} className={`${CARD} space-y-4`}>
          <p className="text-sm font-semibold text-white">Add a season</p>
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3">
            <div>
              <label htmlFor="season-number" className={LABEL}>No.</label>
              <input id="season-number" inputMode="numeric" className={INPUT} value={seasonNumber} onChange={(e) => setSeasonNumber(e.target.value)} />
            </div>
            <div>
              <label htmlFor="season-name" className={LABEL}>Name (optional)</label>
              <input id="season-name" className={INPUT} value={seasonName} onChange={(e) => setSeasonName(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={busy} className={BUTTON_PRIMARY}>Add season</button>
        </form>

        <form onSubmit={handleAddEpisode} className={`${CARD} space-y-4`}>
          <p className="text-sm font-semibold text-white">Add an episode</p>
          {seasons.length === 0 ? (
            <p className="text-sm text-slate-400">Add a season first.</p>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
                <div>
                  <label htmlFor="episode-season" className={LABEL}>Season</label>
                  <select id="episode-season" className={INPUT} value={episodeSeason} onChange={(e) => setEpisodeSeason(e.target.value)}>
                    {seasons.map((season) => <option key={season.id} value={season.id}>Season {season.number}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="episode-number" className={LABEL}>No.</label>
                  <input id="episode-number" inputMode="numeric" className={INPUT} value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="episode-title" className={LABEL}>Episode title</label>
                <input id="episode-title" className={INPUT} value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <div>
                  <label htmlFor="episode-minutes" className={LABEL}>Minutes</label>
                  <input id="episode-minutes" inputMode="numeric" className={INPUT} value={episodeMinutes} onChange={(e) => setEpisodeMinutes(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="episode-url" className={LABEL}>Playback link</label>
                  <input id="episode-url" type="url" className={INPUT} value={episodeUrl} onChange={(e) => setEpisodeUrl(e.target.value)} />
                </div>
              </div>
              <button type="submit" disabled={busy} className={BUTTON_PRIMARY}>Add episode</button>
            </>
          )}
        </form>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="space-y-4">
        {seasons.length === 0 && <p className="text-sm text-slate-400">No seasons yet.</p>}
        {seasons.map((season) => (
          <div key={season.id} className={`${CARD} space-y-4`}>
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-white">Season {season.number}{season.name ? `: ${season.name}` : ''}</p>
              <button
                type="button"
                className={`${BUTTON_GHOST} text-rose-300 hover:text-rose-200`}
                onClick={() => confirmDelete(`Delete season ${season.number} and all of its episodes?`, () => deleteSeason(season.id), 'Season deleted.')}
              >
                Delete season
              </button>
            </div>
            {season.episodes.length === 0 ? (
              <p className="text-sm text-slate-400">No episodes in this season.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {season.episodes.map((episode) => (
                  <li key={episode.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-100">{episode.number}. {episode.title}</p>
                      <p className="text-xs text-slate-500">{episode.playback_url ? 'Playback link set' : 'No playback link yet'}</p>
                    </div>
                    <button
                      type="button"
                      className={`${BUTTON_GHOST} text-rose-300 hover:text-rose-200`}
                      onClick={() => confirmDelete(`Delete episode ${episode.number}?`, () => deleteEpisode(episode.id), 'Episode deleted.')}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
