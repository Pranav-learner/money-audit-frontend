'use client';

import { useEffect, useState } from 'react';

/** Returns true after the component has mounted — guards against hydration mismatches. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Intentional: flip the hydration guard once, after the first client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}
