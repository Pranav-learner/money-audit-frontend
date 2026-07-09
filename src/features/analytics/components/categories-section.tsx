'use client';

import { PieChart, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { useCategoryDistribution } from '@/features/analytics/api';
import { LazyBarChart, LazyPieChart } from '@/features/analytics/components/lazy-charts';
import type { Period } from '@/features/analytics/time-range';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { InsightCard } from '@/shared/components/widgets/insight-card';
import { formatCurrency } from '@/shared/utils/format';

export function CategoriesSection({ period }: { period: Period }) {
  const distQuery = useCategoryDistribution(period.month, period.year);
  const data = useMemo(() => distQuery.data ?? [], [distQuery.data]);

  const pie = useMemo(() => data.map((d) => ({ name: d.name, value: d.value })), [data]);
  const bar = useMemo(() => [...data].sort((a, b) => b.value - a.value).map((d) => ({ label: d.name, value: d.value })), [data]);
  const total = data.reduce((s, d) => s + d.value, 0);
  const top = bar[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <InsightCard icon={Trophy} label="Most expensive" value={top?.label ?? '—'} hint={top ? formatCurrency(top.value) : undefined} loading={distQuery.isLoading} />
        <InsightCard icon={PieChart} label="Categories" value={String(data.length)} loading={distQuery.isLoading} />
        <InsightCard icon={PieChart} label="Total spend" value={formatCurrency(total)} loading={distQuery.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Distribution" description="Share by category" loading={distQuery.isLoading} isEmpty={pie.length === 0}>
          <LazyPieChart data={pie} />
        </ChartCard>
        <ChartCard title="Comparison" description="Spend per category" loading={distQuery.isLoading} isEmpty={bar.length === 0}>
          <LazyBarChart data={bar} />
        </ChartCard>
      </div>
    </div>
  );
}
