'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useUiState } from '@/shared/providers/ui-state-provider';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

/** Sticky application top bar: mobile menu, breadcrumbs, search, theme, notifications, account. */
export function TopBar() {
  const { setMobileNavOpen, setNotificationsOpen, setCommandOpen, notificationCount } = useUiState();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu />
      </Button>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          aria-label="Search (Ctrl+K)"
          className="hidden h-9 w-56 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search"
          onClick={() => setCommandOpen(true)}
        >
          <Search />
        </Button>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          aria-label={notificationCount > 0 ? `Notifications, ${notificationCount} unread` : 'Notifications'}
          onClick={() => setNotificationsOpen(true)}
          className="relative"
        >
          <Bell />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
