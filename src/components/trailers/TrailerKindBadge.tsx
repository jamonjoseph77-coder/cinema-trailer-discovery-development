import { trailerLabel, type Trailer } from '@/lib/trailers';

const TONE: Record<Trailer['kind'], string> = {
  trailer: 'bg-cinema-600 text-white',
  teaser: 'bg-amber-400 text-ink-950',
  clip: 'bg-white/90 text-ink-950',
  featurette: 'bg-white/90 text-ink-950',
  behind_the_scenes: 'bg-white/90 text-ink-950',
};

export function TrailerKindBadge({ trailer, className = '' }: { trailer: Trailer; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${TONE[trailer.kind]} ${className}`}>
      {trailerLabel(trailer)}
    </span>
  );
}
