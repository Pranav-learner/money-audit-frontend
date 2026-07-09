'use client';

import type { ReactNode } from 'react';
import { CommandPalette } from '@/features/search/command-palette';
import { OfflineBanner } from '@/shared/components/common/offline-banner';
import { AppSidebar, MobileSidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { NotificationDrawer } from './notification-drawer';
import { TopBar } from './top-bar';

/**
 * The authenticated application shell: fixed sidebar + top bar + scrollable content,
 * with the mobile off-canvas sidebar, notification drawer and bottom nav mounted once.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main-content" className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <MobileSidebar />
      <NotificationDrawer />
      <CommandPalette />
      <BottomNav />
      <OfflineBanner />
    </div>
  );
}
