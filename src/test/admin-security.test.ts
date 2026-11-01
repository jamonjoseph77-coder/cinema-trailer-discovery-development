import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase', () => ({ supabase: { rpc } }));

import { checkIsAdmin } from '@/lib/library';

describe('Owner-controlled administrator access', () => {
  beforeEach(() => rpc.mockReset());

  it('does not grant admin access to an ordinary account', async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await checkIsAdmin()).toBe(false);
    expect(rpc).toHaveBeenCalledExactlyOnceWith('is_cinema_admin');
  });

  it('recognizes an administrator assigned through privileged management', async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    expect(await checkIsAdmin()).toBe(true);
    expect(rpc).toHaveBeenCalledExactlyOnceWith('is_cinema_admin');
  });

  it('does not grant admin access when verification fails', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('Unavailable') });
    await expect(checkIsAdmin()).rejects.toThrow('Unavailable');
  });
});