export function CinemaLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <img src="/cinema-icon.png" alt="Cinema" className="h-9 w-9 shrink-0 drop-shadow-[0_6px_14px_rgba(37,99,235,0.45)]" />;
  }

  return (
    <span className="flex flex-col items-start gap-1.5">
      <img src="/cinema-wordmark.png" alt="Cinema" className="h-9 w-auto drop-shadow-[0_4px_12px_rgba(37,99,235,0.35)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cinema-300/80">
        Experience the world of stories
      </span>
    </span>
  );
}
