'use client';
import { useMemo } from 'react';
import { CollectionReference, Query, DocumentData } from 'firebase/firestore';

/**
 * Hook to properly memoize Firestore queries/refs for use with useCollection
 * This prevents infinite re-renders by marking the query as memoized
 */
export function useMemoFirebase<T extends CollectionReference<DocumentData> | Query<DocumentData> | null | undefined>(
  query: T,
  deps: React.DependencyList
): T & { __memo?: boolean } {
  return useMemo(() => {
    if (query) {
      (query as any).__memo = true;
    }
    return query as T & { __memo?: boolean };
  }, deps);
}
