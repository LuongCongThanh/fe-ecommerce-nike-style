'use client';

import { useEffect } from 'react';

/**
 * The "read a versioned JSON envelope from localStorage, tolerate missing/corrupt data, and hydrate a
 * client store exactly once — never at module scope, so SSR stays empty until a client effect runs"
 * pattern that `useCart.ts` and `useWishlist.ts` used to each hand-roll independently (~30 lines apiece,
 * kept in sync only by a comment — "giống useCart.ts", ADR-0006). One factory, called once per feature
 * at module scope, so a hydration-race or corrupt-JSON fix only needs to happen — and be tested — once.
 */
export function createPersistedListStore<T>(storageKey: string, version: number) {
  interface Envelope {
    version: number;
    items: T[];
  }

  function read(): T[] {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return [];
      const parsed = JSON.parse(raw) as Envelope;
      // A version bump means the shape changed — treat the old envelope as absent rather than trust it.
      if (parsed.version !== version) return [];
      return parsed.items;
    } catch {
      return [];
    }
  }

  function write(items: T[]): void {
    const envelope: Envelope = { version, items };
    localStorage.setItem(storageKey, JSON.stringify(envelope));
  }

  let hasHydrated = false;

  /** Runs `onHydrate` once per page load, on the first component that mounts using it — not once per mount. */
  function useHydrateOnce(onHydrate: () => void): void {
    useEffect(() => {
      if (hasHydrated) return;
      hasHydrated = true;
      onHydrate();
      // Deliberately `[]` — `hasHydrated` is the module-scoped guard; this must run at most once
      // regardless of how many times the owning component re-renders or remounts.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  }

  return { read, write, useHydrateOnce };
}
