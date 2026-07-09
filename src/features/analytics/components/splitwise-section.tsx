'use client';

import { HandCoins, Scale, Users2, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { useBalanceOverview, useExpenseTypeBreakdown } from '@/features/analytics/api';
import { LazyPieChart } from '@/features/analytics/components/lazy-charts';
import type { Period } from '@/features/analytics/time-range';
import { useFriends } from '@/features/friends/api';
import { useGroups } from '@/features/groups/api';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { InsightCard } from '@/shared/components/widgets/insight-card';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency } from '@/shared/utils/format';

export function SplitwiseSection({ period }: { period: Period }) {
  const balanceQuery = useBalanceOverview();
  const typeQuery = useExpenseTypeBreakdown(period.month, period.year);
  const groupsQuery = useGroups();
  const friendsQuery = useFriends();

  const balance = balanceQuery.data;
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const topGroup = useMemo(() => [...groups].sort((a, b) => (b.totalExpenses ?? 0) - (a.totalExpenses ?? 0))[0], [groups]);

  const debtData = useMemo(() => {
    if (!balance) return [];
    return [
      { name: 'You owe', value: balance.youOwe },
      { name: "You're owed", value: balance.youAreOwed },
    ].filter((d) => d.value > 0);
  }, [balance]);

  const typeData = useMemo(() => {
    const t = typeQuery.data;
    if (!t) return [];
    return [
      { name: 'Personal', value: t.direct },
      { name: 'Split', value: t.group },
    ].filter((d) => d.value > 0);
  }, [typeQuery.data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="You owe" value={formatCurrency(balance?.youOwe ?? 0)} icon={Wallet} loading={balanceQuery.isLoading} />
        <StatCard label="You're owed" value={formatCurrency(balance?.youAreOwed ?? 0)} icon={HandCoins} loading={balanceQuery.isLoading} />
        <StatCard label="Net balance" value={formatCurrency(Math.abs(balance?.netBalance ?? 0))} icon={Scale} loading={balanceQuery.isLoading} />
        <InsightCard icon={Users2} label="Most active group" value={topGroup?.name ?? '—'} hint={topGroup ? formatCurrency(topGroup.totalExpenses ?? 0) : `${friendsQuery.data?.length ?? 0} friends`} loading={groupsQuery.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Debt distribution" description="Owed vs owed to you" loading={balanceQuery.isLoading} isEmpty={debtData.length === 0} emptyMessage="You're all settled up.">
          <LazyPieChart data={debtData} />
        </ChartCard>
        <ChartCard title="Personal vs split" description="This month's spending split" loading={typeQuery.isLoading} isEmpty={typeData.length === 0}>
          <LazyPieChart data={typeData} />
        </ChartCard>
      </div>
    </div>
  );
}
