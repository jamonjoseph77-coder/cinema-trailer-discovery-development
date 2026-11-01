const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-20 w-20 text-3xl',
} as const;

export function ProfileAvatar({ name, size = 'md' }: { name: string; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-cinema-500 to-cinema-800 font-extrabold uppercase text-white ring-1 ring-white/15 ${SIZES[size]}`}
    >
      {name.trim().charAt(0) || '?'}
    </span>
  );
}
