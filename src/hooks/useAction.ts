import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToast';

export function useAction(onSuccess: () => void) {
  const { notify } = useToast();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, action: () => Promise<void>, successMessage: string) => {
      setPendingKey(key);
      try {
        await action();
        notify(successMessage);
        onSuccess();
      } catch (error) {
        const duplicate = (error as { code?: string }).code === '23505';
        notify(
          duplicate ? 'That connection already exists.' : 'That did not work. Please try again.',
          'error',
        );
      } finally {
        setPendingKey(null);
      }
    },
    [notify, onSuccess],
  );

  return { pendingKey, run };
}
