'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePreferences } from './preferences-provider';

/**
 * Bridges the "Animations" preference into Framer Motion. When the user turns
 * animations off we force reduced motion; otherwise we defer to the OS
 * `prefers-reduced-motion` setting for accessibility.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  return <MotionConfig reducedMotion={preferences.animations ? 'user' : 'always'}>{children}</MotionConfig>;
}
