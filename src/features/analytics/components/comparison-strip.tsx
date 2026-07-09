'use client';

import { PiggyBank, TrendingDown } from 'lucide-react';
import { useMonthlySummary } from '@/features/analytics/api';
import { previousPeriod, type Period } from '@/features/analytics/time-range';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency } from '@/shared/utils/format';

function pctDelta(cur?: number, prev?: number): number | null {
  if (prev == null || prev <= 0 || cur == null) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

/** Comparison mode: current month vs previous month for spending and savings. */
export function ComparisonStrip({ period }: { period: Period }) {
  const prev = previousPeriod(period);
  const curQuery = useMonthlySummary(period.month, period.year);
  const prevQuery = useMonthlySummary(prev.month, prev.year);

  const loading = curQuery.isLoading || prevQuery.isLoading;
  const spentDelta = pctDelta(curQuery.data?.totalSpent, prevQuery.data?.totalSpent);
  const savedDelta = pctDelta(curQuery.data?.totalIncomeSaved, prevQuery.data?.totalIncomeSaved);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Spending vs last month"
        value={formatCurrency(curQuery.data?.totalSpent ?? 0)}
        icon={TrendingDown}
        loading={loading}
        trend={spentDelta == null ? undefined : { label: `${Math.abs(spentDelta)}%`, positive: spentDelta <= 0 }}
      />
      <StatCard
        label="Savings vs last month"
        value={formatCurrency(curQuery.data?.totalIncomeSaved ?? 0)}
        icon={PiggyBank}
        loading={loading}
        trend={savedDelta == null ? undefined : { label: `${Math.abs(savedDelta)}%`, positive: savedDelta >= 0 }}
      />
    </div>
  );
}
