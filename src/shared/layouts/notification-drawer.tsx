'use client';

import { ArrowRight, BellOff, Check, Lightbulb, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDismissInsight, useInsightSummary, useMarkInsightRead, useUnreadInsights } from '@/features/intelligence/api';
import { humanizeEnum, severityMeta } from '@/features/intelligence/lib/display';
import { Badge } from '@/shared/components/ui/badge';
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
import { useUiState } from '@/shared/providers/ui-state-provider';
import { formatShortDate } from '@/shared/utils/format';

/**
 * Notification drawer, fed by the backend Financial Intelligence insight engine.
 * It surfaces *unread* insights only — these are produced by the backend; the
 * frontend never invents notifications, it only presents and acknowledges them.
 */
export function NotificationDrawer() {
  const { notificationsOpen, setNotificationsOpen, setNotificationCount } = useUiState();

  const summary = useInsightSummary();
  const unread = useUnreadInsights();
  const markRead = useMarkInsightRead();
  const dismiss = useDismissInsight();

  const count = summary.data?.unreadCount ?? 0;

  // Keep the top-bar badge in sync with the backend's unread count.
  useEffect(() => {
    setNotificationCount(count);
  }, [count, setNotificationCount]);

  const items = unread.data ?? [];

  return (
    <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Financial insights that need your attention.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-2 overflow-y-auto p-4 custom-scrollbar">
          {unread.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : items.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="You're all caught up"
              description="New insights from your finances will show up here as soon as they arrive."
            />
          ) : (
            items.map((insight) => {
              const sev = severityMeta(insight.severity);
              return (
                <div key={insight.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 size-2 shrink-0 rounded-full ${sev.dot}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={sev.variant}>{sev.label}</Badge>
                        {insight.category && <span className="truncate text-xs text-muted-foreground">{humanizeEnum(insight.category)}</span>}
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{insight.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{insight.description}</p>
                      {insight.actionSuggestion && (
                        <p className="mt-1 flex items-start gap-1.5 text-xs text-primary">
                          <Lightbulb className="mt-0.5 size-3 shrink-0" aria-hidden />
                          {insight.actionSuggestion}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[0.7rem] text-muted-foreground">{formatShortDate(insight.createdAt)}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs"
                            onClick={() => markRead.mutate(insight.id)}
                          >
                            <Check className="size-3" />
                            Mark read
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Dismiss"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => dismiss.mutate(insight.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-border p-4">
          <Button variant="outline" className="w-full" asChild onClick={() => setNotificationsOpen(false)}>
            <Link href="/intelligence/insights">
              View all insights
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
