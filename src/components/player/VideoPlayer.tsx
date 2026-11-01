import { useEffect, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import type Hls from 'hls.js';
import { AlertTriangle, Loader2, Radio } from 'lucide-react';
import { isHlsUrl } from '@/lib/media';

export interface PlaybackProgress {
  position: number;
  duration: number;
  completed: boolean;
}

interface VideoPlayerProps {
  src: string;
  title: string;
  subtitleUrl?: string;
  startAt?: number;
  poster?: string;
  isLive?: boolean;
  onProgress?: (progress: PlaybackProgress) => void;
}

interface QualityLevel {
  index: number;
  label: string;
}

type PlayerStatus = 'loading' | 'ready' | 'error';

const SAVE_INTERVAL_SECONDS = 10;
const MIN_SAVED_POSITION_SECONDS = 1;
const COMPLETE_RATIO = 0.95;
const PLAYBACK_ERROR = 'This video could not be played. The link may be offline, or the host may not allow playback in a browser.';

export function VideoPlayer({ src, title, subtitleUrl, startAt = 0, poster, isLive = false, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const startAtRef = useRef(startAt);
  const onProgressRef = useRef(onProgress);
  const lastSavedRef = useRef(0);
  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [errorText, setErrorText] = useState(PLAYBACK_ERROR);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [quality, setQuality] = useState(-1);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setStatus('loading');
    setLevels([]);
    setQuality(-1);
    lastSavedRef.current = 0;

    let hls: Hls | null = null;
    let cancelled = false;
    if (isHlsUrl(src)) {
      void import('hls.js').then(({ default: HlsLib }) => {
        if (cancelled) return;
        if (!HlsLib.isSupported()) {
          video.src = src;
          return;
        }
        hls = new HlsLib({ enableWorker: true });
        hlsRef.current = hls;
        hls.on(HlsLib.Events.MANIFEST_PARSED, (_event, data) => {
          setLevels(
            data.levels.map((level, index) => ({
              index,
              label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)} kbps`,
            })),
          );
        });
        hls.on(HlsLib.Events.ERROR, (_event, data) => {
          if (!data.fatal) return;
          setErrorText(PLAYBACK_ERROR);
          setStatus('error');
          hls?.destroy();
          hlsRef.current = null;
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      hls?.destroy();
      hlsRef.current = null;
      video.removeAttribute('src');
      video.load();
    };
  }, [src]);

  function reportProgress(video: HTMLVideoElement, completed: boolean) {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const position = video.currentTime;
    const finished = completed || (duration > 0 && position / duration >= COMPLETE_RATIO);
    if (position < MIN_SAVED_POSITION_SECONDS) return;
    onProgressRef.current?.({ position, duration, completed: finished });
  }

  function handleLoadedMetadata(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    const target = startAtRef.current;
    if (target > 0 && Number.isFinite(video.duration) && target < video.duration - 5) {
      video.currentTime = target;
    }
    setStatus('ready');
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    if (Math.abs(video.currentTime - lastSavedRef.current) < SAVE_INTERVAL_SECONDS) return;
    lastSavedRef.current = video.currentTime;
    reportProgress(video, false);
  }

  function handleQualityChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = Number(event.target.value);
    setQuality(next);
    if (hlsRef.current) hlsRef.current.currentLevel = next;
  }

  const hasQualityMenu = levels.length > 1;

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <video
          ref={videoRef}
          className="h-full w-full bg-black"
          controls
          playsInline
          preload="metadata"
          poster={poster || undefined}
          aria-label={title}
          crossOrigin={subtitleUrl ? 'anonymous' : undefined}
          onLoadedMetadata={handleLoadedMetadata}
          onPlaying={() => setStatus('ready')}
          onWaiting={() => setStatus('loading')}
          onTimeUpdate={handleTimeUpdate}
          onPause={(event) => reportProgress(event.currentTarget, false)}
          onEnded={(event) => reportProgress(event.currentTarget, true)}
          onError={() => {
            setErrorText(PLAYBACK_ERROR);
            setStatus('error');
          }}
        >
          {subtitleUrl && <track kind="subtitles" src={subtitleUrl} srcLang="en" label="Subtitles" />}
        </video>

        {status === 'loading' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-10 w-10 animate-spin text-cinema-300" aria-label="Loading video" />
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/95 p-6">
            <div className="max-w-md text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
              <p className="mt-4 text-base font-semibold text-white">Playback unavailable</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{errorText}</p>
            </div>
          </div>
        )}
      </div>

      {(hasQualityMenu || isLive) && (
        <div className="flex flex-wrap items-center gap-3">
          {isLive && (
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300">
              <Radio className="h-3.5 w-3.5" /> Live
            </span>
          )}
          {hasQualityMenu && (
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <span className="font-semibold">Quality</span>
              <select
                value={quality}
                onChange={handleQualityChange}
                className="rounded-lg border border-white/10 bg-ink-850 px-3 py-1.5 text-sm text-slate-100 focus:border-cinema-400 focus:outline-none"
              >
                <option value={-1}>Auto</option>
                {levels.map((level) => (
                  <option key={level.index} value={level.index}>
                    {level.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
