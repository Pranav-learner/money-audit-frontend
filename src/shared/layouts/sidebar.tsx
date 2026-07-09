'use client';

import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/shared/providers/preferences-provider';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useUiState } from '@/shared/providers/ui-state-provider';
import { cn } from '@/shared/utils/cn';
import { Brand } from './brand';
import { PRIMARY_NAV, isActiveRoute } from './nav-config';

function initials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** The navigation link list, shared by the desktop sidebar and the mobile sheet. */
function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 custom-scrollbar">
      {PRIMARY_NAV.map(({ label, href, icon: Icon }) => {
        const active = isActiveRoute(pathname, href);
        const link = (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              collapsed && 'justify-center px-2',
              active
                ? 'bg-primary/12 text-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground',
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );

        return collapsed ? (
          <Tooltip key={href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ) : (
          link
        );
      })}
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
        <Avatar className="size-8">
          <AvatarFallback>{initials(user?.name)}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name ?? 'Guest'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
          </div>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={logout} className="text-muted-foreground hover:text-destructive">
            <LogOut />
          </Button>
        )}
      </div>
    </div>
  );
}

/** Fixed, collapsible desktop sidebar. */
export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUiState();
  const { preferences, hydrated } = usePreferences();

  // Apply the "sidebar behaviour" preference. `remember` keeps whatever the
  // user last toggled; `expanded`/`collapsed` force a state on load.
  useEffect(() => {
    if (!hydrated) return;
    if (preferences.sidebarBehavior === 'expanded') setSidebarCollapsed(false);
    else if (preferences.sidebarBehavior === 'collapsed') setSidebarCollapsed(true);
  }, [hydrated, preferences.sidebarBehavior, setSidebarCollapsed]);

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex',
        sidebarCollapsed ? 'w-[76px]' : 'w-[260px]',
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4', sidebarCollapsed && 'justify-center px-2')}>
        <Brand collapsed={sidebarCollapsed} />
      </div>

      <SidebarNav collapsed={sidebarCollapsed} />

      <div className="px-3 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn('w-full justify-start gap-3 text-muted-foreground', sidebarCollapsed && 'justify-center px-2')}
        >
          {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </Button>
      </div>

      <SidebarFooter collapsed={sidebarCollapsed} />
    </aside>
  );
}

/** Off-canvas sidebar for mobile, opened from the top bar menu button. */
export function MobileSidebar() {
  const { mobileNavOpen, setMobileNavOpen } = useUiState();

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Brand />
        </div>
        <SidebarNav collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
        <SidebarFooter collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
