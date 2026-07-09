'use client';

import { Percent, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { useMonthlySavings, useMonthlySummary, useSavingsTrend, useTotalSavings } from '@/features/analytics/api';
import { LazyAreaChart } from '@/features/analytics/components/lazy-charts';
import { monthShort, type Period } from '@/features/analytics/time-range';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { InsightCard } from '@/shared/components/widgets/insight-card';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency } from '@/shared/utils/format';

export function SavingsSection({ period }: { period: Period }) {
  const totalQuery = useTotalSavings();
  const trendQuery = useSavingsTrend(period.year);
  const monthlyQuery = useMonthlySavings(period.month, period.year);
  const summaryQuery = useMonthlySummary(period.month, period.year);

  const trend = useMemo(() => (trendQuery.data ?? []).map((t) => ({ label: monthShort(t.month), value: t.amount })), [trendQuery.data]);

  const summary = summaryQuery.data;
  const ratioDenominator = (summary?.totalIncomeSaved ?? 0) + (summary?.totalSpent ?? 0);
  const savingsRatio = ratioDenominator > 0 ? Math.round(((summary?.totalIncomeSaved ?? 0) / ratioDenominator) * 100) : 0;

  const raw = useMemo(() => trendQuery.data ?? [], [trendQuery.data]);
  const growth = useMemo(() => {
    const idx = raw.findIndex((t) => t.month === period.month);
    if (idx <= 0) return null;
    const prev = raw[idx - 1]?.amount ?? 0;
    const curr = raw[idx]?.amount ?? 0;
    if (prev <= 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [raw, period.month]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total saved" value={formatCurrency(totalQuery.data?.totalSavings ?? 0)} icon={PiggyBank} loading={totalQuery.isLoading} />
        <StatCard label="Saved this month" value={formatCurrency(monthlyQuery.data?.totalSaved ?? 0)} icon={Wallet} loading={monthlyQuery.isLoading} />
        <InsightCard icon={Percent} label="Savings ratio" value={`${savingsRatio}%`} hint="Saved vs total inflow" loading={summaryQuery.isLoading} />
        <InsightCard icon={TrendingUp} label="Monthly growth" value={growth == null ? '—' : `${growth > 0 ? '+' : ''}${growth}%`} loading={trendQuery.isLoading} />
      </div>

      <ChartCard title={`Savings trend ${period.year}`} description="Contributions across the year" loading={trendQuery.isLoading} isEmpty={trend.length === 0}>
        <LazyAreaChart data={trend} />
      </ChartCard>
    </div>
  );
}
