import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`;

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(MOBILE_QUERY);
      mql.addEventListener('change', callback);
      return () => {
        mql.removeEventListener('change', callback);
      };
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
