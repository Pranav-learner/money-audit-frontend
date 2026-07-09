'use client';

import { ArrowRight, BellOff } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useDismissInsight,
  useMarkInsightRead,
  useNotificationCenter,
} from '@/features/notifications/api';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import type { AppNotification } from '@/features/notifications/types';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { useUiState } from '@/shared/providers/ui-state-provider';

const DRAWER_LIMIT = 8;

/**
 * Quick-glance notification drawer, fed by the unified notification feed
 * (Financial Intelligence insights + pending invitations). Keeps the top-bar
 * bell badge in sync with the aggregated unread count. The full experience,
 * with filters/search/pagination, lives on the /notifications page.
 */
export function NotificationDrawer() {
  const { notificationsOpen, setNotificationsOpen, setNotificationCount } = useUiState();
  const { items, unreadCount, isLoading, refetch } = useNotificationCenter();
  const markRead = useMarkInsightRead();
  const dismiss = useDismissInsight();
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setNotificationCount(unreadCount);
  }, [unreadCount, setNotificationCount]);

  const shown = items.slice(0, DRAWER_LIMIT);

  const handleAccept = async (n: AppNotification) => {
    setPendingId(n.id);
    try {
      await accept.mutateAsync(n);
      toast.success('Accepted');
    } catch {
      toast.error('Action failed');
    } finally {
      setPendingId(null);
    }
  };

  const handleDecline = async (n: AppNotification) => {
    setPendingId(n.id);
    try {
      await decline.mutateAsync(n);
      toast.success('Declined');
    } catch {
      toast.error('Action failed');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Sheet open={notificationsOpen} onOpenChange={(o) => { setNotificationsOpen(o); if (o) refetch(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>{unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-2 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : shown.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="You're all caught up"
              description="New insights and requests will appear here as soon as they arrive."
            />
          ) : (
            shown.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                compact
                actionPending={pendingId === n.id}
                onMarkRead={(x) => x.source === 'insight' && !x.read && markRead.mutate(x.rawId)}
                onDismiss={(x) => x.source === 'insight' && dismiss.mutate(x.rawId)}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onNavigate={() => setNotificationsOpen(false)}
              />
            ))
          )}
        </div>

        <div className="border-t border-border p-4">
          <Button variant="outline" className="w-full" asChild onClick={() => setNotificationsOpen(false)}>
            <Link href="/notifications">
              View all notifications
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
