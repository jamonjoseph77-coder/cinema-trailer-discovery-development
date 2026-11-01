import { useContext } from 'react';
import { LibraryContext, type LibraryContextValue } from '@/contexts/LibraryContext';

export function useLibrary(): LibraryContextValue {
  const value = useContext(LibraryContext);
  if (!value) throw new Error('useLibrary must be used inside LibraryProvider');
  return value;
}
