import { Share2 } from 'lucide-react';
import { BUTTON_SECONDARY } from '@/components/ui/styles';
import { useToast } from '@/hooks/useToast';
import { tmdbHref, type TmdbItem } from '@/lib/tmdb';
import type { Trailer } from '@/lib/trailers';

export function trailerShareUrl(item: TmdbItem, trailer: Trailer): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}${tmdbHref(item)}?trailer=${trailer.key}`;
}

export function ShareTrailerButton({ item, trailer, compact = false }: { item: TmdbItem; trailer: Trailer; compact?: boolean }) {
  const { notify } = useToast();

  async function share() {
    const url = trailerShareUrl(item, trailer);
    const shareData = { title: `${item.title} — ${trailer.name}`, text: `Watch the ${item.title} trailer on Cinema`, url };
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      notify('Trailer link copied. Share it anywhere.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notify('We could not share that link just now. Please try again.', 'error');
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={share}
        aria-label={`Share the ${item.title} trailer`}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-ink-950/70 text-slate-200 backdrop-blur transition hover:border-cinema-400/50 hover:text-white"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button type="button" onClick={share} className={BUTTON_SECONDARY}>
      <Share2 className="h-4 w-4" aria-hidden="true" /> Share trailer
    </button>
  );
}
