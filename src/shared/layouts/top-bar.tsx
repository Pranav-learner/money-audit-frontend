'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useUiState } from '@/shared/providers/ui-state-provider';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

/** Sticky application top bar: mobile menu, breadcrumbs, search, theme, notifications, account. */
export function TopBar() {
  const { setMobileNavOpen, setNotificationsOpen, notificationCount } = useUiState();

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
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search"
            className="h-9 w-56 rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

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
