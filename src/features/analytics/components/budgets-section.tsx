'use client';

import { AlertTriangle, Target, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { useBudgetUsage } from '@/features/analytics/api';
import { LazyBarChart } from '@/features/analytics/components/lazy-charts';
import type { Period } from '@/features/analytics/time-range';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { InsightCard } from '@/shared/components/widgets/insight-card';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency } from '@/shared/utils/format';

function statusMeta(status: string) {
  if (status === 'OVER_BUDGET') return { variant: 'destructive' as const, bar: 'bg-destructive' };
  if (status === 'NEAR_LIMIT') return { variant: 'warning' as const, bar: 'bg-warning' };
  return { variant: 'success' as const, bar: 'bg-primary' };
}

export function BudgetsSection({ period }: { period: Period }) {
  const query = useBudgetUsage(period.month, period.year);
  const data = useMemo(() => query.data ?? [], [query.data]);

  const totals = useMemo(
    () => data.reduce((acc, b) => ({ budget: acc.budget + b.budget, spent: acc.spent + b.spent }), { budget: 0, spent: 0 }),
    [data],
  );
  const exceeded = data.filter((b) => b.status === 'OVER_BUDGET').length;
  const bar = useMemo(() => data.map((b) => ({ label: b.category, value: b.spent })), [data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total budget" value={formatCurrency(totals.budget)} icon={Target} loading={query.isLoading} />
        <StatCard label="Spent" value={formatCurrency(totals.spent)} icon={Wallet} loading={query.isLoading} />
        <StatCard label="Remaining" value={formatCurrency(Math.max(0, totals.budget - totals.spent))} icon={Target} loading={query.isLoading} />
        <InsightCard icon={AlertTriangle} label="Exceeded" value={String(exceeded)} hint="categories over budget" loading={query.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget usage</CardTitle>
          </CardHeader>
          <CardContent>
            {query.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data.length === 0 ? (
              <EmptyState icon={Target} title="No budgets" description="Set budgets to track usage here." />
            ) : (
              <ul className="space-y-4">
                {data.map((b) => {
                  const meta = statusMeta(b.status);
                  return (
                    <li key={b.category}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{b.category}</span>
                        <Badge variant={meta.variant}>{b.percentageUsed}%</Badge>
                      </div>
                      <Progress value={Math.min(b.percentageUsed, 100)} indicatorClassName={meta.bar} />
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(b.spent)} spent</span>
                        <span>{formatCurrency(b.remaining)} left</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <ChartCard title="Spend by category" description="Compared to budget" loading={query.isLoading} isEmpty={bar.length === 0}>
          <LazyBarChart data={bar} />
        </ChartCard>
      </div>
    </div>
  );
}
