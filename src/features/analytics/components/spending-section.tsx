'use client';

import { CalendarDays, Layers, TrendingDown, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { useCategoryDistribution, useMonthlySummary, useSpendingTrend } from '@/features/analytics/api';
import { LazyBarChart, LazyPieChart } from '@/features/analytics/components/lazy-charts';
import { monthShort, type Period } from '@/features/analytics/time-range';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { InsightCard } from '@/shared/components/widgets/insight-card';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency } from '@/shared/utils/format';

export function SpendingSection({ period }: { period: Period }) {
  const trendQuery = useSpendingTrend(period.year);
  const distQuery = useCategoryDistribution(period.month, period.year);
  const summaryQuery = useMonthlySummary(period.month, period.year);

  const trend = useMemo(() => (trendQuery.data ?? []).map((t) => ({ label: monthShort(t.month), value: t.amount })), [trendQuery.data]);
  const distribution = useMemo(() => (distQuery.data ?? []).map((d) => ({ name: d.name, value: d.value })), [distQuery.data]);

  const withValues = trend.filter((t) => t.value > 0);
  const highest = withValues.reduce<{ label: string; value: number } | null>((m, t) => (!m || t.value > m.value ? t : m), null);
  const avg = withValues.length ? withValues.reduce((s, t) => s + t.value, 0) / withValues.length : 0;
  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Spent this month" value={formatCurrency(summary?.totalSpent ?? 0)} icon={TrendingDown} loading={summaryQuery.isLoading} />
        <InsightCard icon={Trophy} label="Top category" value={summary?.topCategory || '—'} loading={summaryQuery.isLoading} />
        <InsightCard icon={Layers} label="Net this month" value={formatCurrency(summary?.netSavings ?? 0)} loading={summaryQuery.isLoading} />
        <InsightCard icon={CalendarDays} label="Highest month" value={highest ? formatCurrency(highest.value) : '—'} hint={highest?.label} loading={trendQuery.isLoading} />
        <InsightCard icon={TrendingDown} label="Average monthly" value={formatCurrency(avg)} loading={trendQuery.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title={`Monthly spending ${period.year}`} description="Spend across the year" loading={trendQuery.isLoading} isEmpty={trend.length === 0}>
            <LazyBarChart data={trend} />
          </ChartCard>
        </div>
        <ChartCard title="Category breakdown" description="This month" loading={distQuery.isLoading} isEmpty={distribution.length === 0}>
          <LazyPieChart data={distribution} />
        </ChartCard>
      </div>
    </div>
  );
}
