'use client';

import { motion } from 'framer-motion';
import { Activity, PiggyBank, Receipt } from 'lucide-react';
import { useRecentActivity } from '@/features/dashboard/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { formatCurrency, formatDate } from '@/shared/utils/format';

function meta(type: string) {
  if (type === 'saving') return { Icon: PiggyBank, cls: 'bg-success/12 text-success', sign: '+' };
  return { Icon: Receipt, cls: 'bg-secondary text-muted-foreground', sign: '−' };
}

/** Unified, newest-first activity feed sourced from the backend recent-activity endpoint. */
export function ActivityTimeline() {
  const query = useRecentActivity();
  const items = query.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Activity className="size-4 text-primary" aria-hidden />
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Activity} title="No recent activity" description="Your latest transactions will appear here." />
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {items.map((item) => {
              const { Icon, cls, sign } = meta(item.type);
              return (
                <motion.li key={item.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="relative">
                  <span className="absolute -left-[27px] top-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-primary" aria-hidden />
                  <div className="flex items-center gap-3">
                    <span className={cn('flex size-9 items-center justify-center rounded-lg', cls)}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                    <span className={cn('text-sm font-semibold', item.type === 'saving' ? 'text-success' : 'text-foreground')}>
                      {sign}
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
