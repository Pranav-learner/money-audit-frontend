'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = 'ma.profile.v1';
const EVENT = 'ma:profile-updated';

/**
 * Locally-persisted profile overrides. The backend exposes `/api/auth/me`
 * (read-only) but has no profile-update or avatar endpoint, so display-name,
 * phone and avatar edits are stored on this device and merged over the
 * authenticated user. A window event keeps every hook instance in sync.
 */
export interface ProfileOverride {
  name?: string;
  phone?: string;
  avatarDataUrl?: string;
}

function readOverride(): ProfileOverride {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as ProfileOverride;
  } catch {
    return {};
  }
}

export function useProfile() {
  const { user } = useAuth();
  const [override, setOverride] = useState<ProfileOverride>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverride(readOverride());
    const sync = () => setOverride(readOverride());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const save = useCallback((patch: ProfileOverride) => {
    const next = { ...readOverride(), ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    setOverride(next);
  }, []);

  const clearAvatar = useCallback(() => {
    const next = { ...readOverride() };
    delete next.avatarDataUrl;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    setOverride(next);
  }, []);

  return {
    /** Effective values (backend user merged with local overrides). */
    name: override.name ?? user?.name ?? '',
    email: user?.email ?? '',
    phone: override.phone ?? user?.phone ?? '',
    avatarDataUrl: override.avatarDataUrl,
    id: user?.id ?? '',
    /** Whether any local override is currently applied. */
    hasOverride: Boolean(override.name || override.phone || override.avatarDataUrl),
    save,
    clearAvatar,
  };
}
