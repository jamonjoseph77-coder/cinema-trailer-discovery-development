import type { ReactNode } from 'react';
import type { Profile } from '@/lib/types';
import { ProfileAvatar } from '@/components/social/ProfileAvatar';

export function PersonRow({ profile, children }: { profile: Profile | null; children?: ReactNode }) {
  const name = profile?.display_name ?? 'Cinema member';
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-850/70 p-4 transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <ProfileAvatar name={name} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{name}</p>
          {profile && <p className="truncate text-sm text-slate-400">@{profile.username}</p>}
          {profile?.bio && <p className="mt-1 line-clamp-1 text-sm text-slate-300">{profile.bio}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </li>
  );
}
