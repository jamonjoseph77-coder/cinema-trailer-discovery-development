export function TmdbAttribution({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-slate-600 ${className}`}>
      Title information and artwork courtesy of{' '}
      <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-slate-400 hover:underline">
        TMDB
      </a>
      . This product uses the TMDB API but is not endorsed or certified by TMDB. Trailers are hosted by YouTube.
    </p>
  );
}
