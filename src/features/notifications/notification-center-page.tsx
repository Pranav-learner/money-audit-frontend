'use client';

import { BellOff, CheckCheck, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useDismissInsight,
  useMarkInsightRead,
  useNotificationCenter,
} from '@/features/notifications/api';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import type { AppNotification } from '@/features/notifications/types';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from '@/shared/components/ui/toast';

type Filter = 'all' | 'unread' | 'intelligence' | 'social';
const PAGE_SIZE = 12;

export function NotificationCenterPage() {
  const { items, unreadCount, isLoading, isError, refetch } = useNotificationCenter();
  const markRead = useMarkInsightRead();
  const dismiss = useDismissInsight();
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      if (filter === 'unread' && n.read) return false;
      if (filter === 'intelligence' && n.group !== 'intelligence') return false;
      if (filter === 'social' && n.group !== 'social') return false;
      if (q && !`${n.title} ${n.message} ${n.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, search]);

  const paged = filtered.slice(0, visible);

  const handleMarkRead = (n: AppNotification) => {
    if (n.source !== 'insight' || n.read) return;
    markRead.mutate(n.rawId);
  };

  const handleDismiss = (n: AppNotification) => {
    if (n.source !== 'insight') return;
    dismiss.mutate(n.rawId, { onError: () => toast.error('Could not dismiss') });
  };

  const handleAccept = async (n: AppNotification) => {
    setPendingId(n.id);
    try {
      await accept.mutateAsync(n);
      toast.success(n.source === 'friend_request' ? 'Friend request accepted' : 'Invitation accepted');
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

  const markAllRead = () => {
    const unread = items.filter((n) => n.source === 'insight' && !n.read);
    if (unread.length === 0) return;
    unread.forEach((n) => markRead.mutate(n.rawId));
    toast.success('All caught up');
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch} aria-label="Refresh notifications">
              <RefreshCw className="size-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="size-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => { setFilter(v as Filter); setVisible(PAGE_SIZE); }}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search notifications"
            aria-label="Search notifications"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BellOff}
            title={search || filter !== 'all' ? 'Nothing matches' : "You're all caught up"}
            description={
              search || filter !== 'all'
                ? 'Try a different filter or search term.'
                : 'New insights and requests will appear here as they arrive.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {paged.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
              onAccept={handleAccept}
              onDecline={handleDecline}
              actionPending={pendingId === n.id}
            />
          ))}
          {visible < filtered.length && (
            <div className="pt-2 text-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more ({filtered.length - visible})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
