'use client';

import { useEffect, useState } from 'react';

/** Reactively track a CSS media query (SSR-safe: false until mounted). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True on screens < 768px (Tailwind `md`). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
