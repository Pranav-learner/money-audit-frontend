'use client';

import { BellOff } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useUiState } from '@/shared/providers/ui-state-provider';

/**
 * Reusable notification drawer (UI only — not wired to any API yet, per Milestone 1).
 * A future milestone will feed it live notifications via TanStack Query.
 */
export function NotificationDrawer() {
  const { notificationsOpen, setNotificationsOpen } = useUiState();

  return (
    <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Alerts, reminders and financial insights appear here.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <EmptyState
            icon={BellOff}
            title="You're all caught up"
            description="New notifications will show up here as soon as they arrive."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
