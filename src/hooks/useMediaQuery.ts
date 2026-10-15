import { useSyncExternalStore } from 'react';

/** Live match for a media query. Server snapshot is false, so first paint is the calm layout. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
/** Below this width the two-sided route no longer has room for its cards, so cards stack instead. */
export const useNarrow = () => useMediaQuery('(max-width: 980px)');
/** A mouse or trackpad that can hover. Touch screens get the calmer layout. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');
