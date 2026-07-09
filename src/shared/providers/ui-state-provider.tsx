'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const SIDEBAR_STORAGE_KEY = 'ui.sidebar.collapsed';

interface UiState {
  /** Desktop sidebar collapsed to icons-only. */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Mobile off-canvas sidebar visibility. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  /** Notification drawer visibility. */
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;

  /** Global command palette / search visibility. */
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  /** Unread notification badge count (surfaced in the top nav). */
  notificationCount: number;
  setNotificationCount: (count: number) => void;

  /** App-wide loading flag for route transitions / blocking work. */
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

const UiStateContext = createContext<UiState | undefined>(undefined);

/**
 * Client-only global UI state (sidebar, drawers, notification count, global loading).
 * Server state lives in TanStack Query; auth lives in AuthContext — this is purely
 * ephemeral chrome state, with the sidebar preference persisted to localStorage.
 */
export function UiStateProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    // Restore the persisted preference on mount (localStorage is client-only, so it
    // can't be read during SSR — this one-time sync is intentional).
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored != null) setSidebarCollapsedState(stored === 'true');
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo<UiState>(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      notificationsOpen,
      setNotificationsOpen,
      commandOpen,
      setCommandOpen,
      notificationCount,
      setNotificationCount,
      globalLoading,
      setGlobalLoading,
    }),
    [sidebarCollapsed, toggleSidebar, setSidebarCollapsed, mobileNavOpen, notificationsOpen, commandOpen, notificationCount, globalLoading],
  );

  return <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>;
}

export function useUiState(): UiState {
  const ctx = useContext(UiStateContext);
  if (!ctx) throw new Error('useUiState must be used within UiStateProvider');
  return ctx;
}
