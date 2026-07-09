'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  DEFAULT_PREFERENCES,
  toFormatConfig,
  type Preferences,
} from '@/shared/lib/preferences';
import { setFormatConfig } from '@/shared/utils/format';

const STORAGE_KEY = 'ma.preferences.v1';

interface PreferencesContextValue {
  preferences: Preferences;
  /** Shallow-merge a partial update (nested `notifications` is deep-merged). */
  update: (patch: DeepPartial<Preferences>) => void;
  reset: () => void;
  /** True once the persisted preferences have been read on the client. */
  hydrated: boolean;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

function mergePreferences(base: Preferences, patch: DeepPartial<Preferences>): Preferences {
  return {
    ...base,
    ...patch,
    notifications: { ...base.notifications, ...(patch.notifications ?? {}) },
  } as Preferences;
}

function readStored(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return mergePreferences(DEFAULT_PREFERENCES, JSON.parse(raw));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Client-persisted user preferences (currency/locale/date formats, notification
 * toggles, and application behaviour). No backend endpoint exists for these, so
 * they live in localStorage. Side effects (format config + document attributes)
 * are applied here so the whole app reflects changes immediately.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const firstApply = useRef(true);

  // Hydrate from localStorage on mount (client-only).
  useEffect(() => {
    const stored = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferences(stored);
    setHydrated(true);
  }, []);

  // Apply side effects whenever preferences change.
  useEffect(() => {
    setFormatConfig(toFormatConfig(preferences));

    const root = document.documentElement;
    root.dataset.compact = preferences.compactMode ? 'true' : 'false';
    root.dataset.animations = preferences.animations ? 'on' : 'off';

    // Persist (skip the very first apply which corresponds to the default state
    // before hydration to avoid clobbering stored values with defaults).
    if (firstApply.current) {
      firstApply.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      /* storage may be unavailable (private mode) — non-fatal */
    }
  }, [preferences]);

  const update = useCallback((patch: DeepPartial<Preferences>) => {
    setPreferences((prev) => mergePreferences(prev, patch));
  }, []);

  const reset = useCallback(() => setPreferences(DEFAULT_PREFERENCES), []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, update, reset, hydrated }),
    [preferences, update, reset, hydrated],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
