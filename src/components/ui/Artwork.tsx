import { useState } from 'react';
import { Clapperboard } from 'lucide-react';

interface ArtworkProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function Artwork({ src, alt, className = '', fallbackTitle }: ArtworkProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-950 p-4 text-center ${className}`}
      >
        <Clapperboard className="h-8 w-8 text-cinema-400/70" aria-hidden="true" />
        {fallbackTitle && <span className="line-clamp-2 text-xs font-semibold text-slate-400">{fallbackTitle}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  );
}
