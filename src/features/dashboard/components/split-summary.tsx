'use client';

import { ArrowRight, HandCoins, Scale, Users2, Wallet } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import { useFriends } from '@/features/friends/api';
import { useGroups } from '@/features/groups/api';
import { useFriendBalances } from '@/features/settlements/api';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { BalancePill } from '@/shared/components/widgets/balance-card';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { describeDirectBalance } from '@/shared/utils/balance';
import { formatCurrency } from '@/shared/utils/format';

const CategoryPieChart = dynamic(
  () => import('@/shared/components/charts/charts').then((m) => ({ default: m.CategoryPieChart })),
  { ssr: false, loading: () => <Skeleton className="size-full" /> },
);

export function SplitSummary() {
  const friendsQuery = useFriends();
  const friends = friendsQuery.data ?? [];
  const { balances, isLoading, totalOwed, totalLent } = useFriendBalances(friends);
  const groupsQuery = useGroups();
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  const loading = friendsQuery.isLoading || isLoading;
  const pending = balances.filter((b) => b.net !== 0);
  const topOutstanding = useMemo(
    () => [...balances].filter((b) => b.net > 0).sort((a, b) => b.net - a.net)[0],
    [balances],
  );
  const debtDistribution = useMemo(
    () => balances.filter((b) => b.net > 0).map((b) => ({ name: b.friend.name, value: b.net })),
    [balances],
  );
  const topGroups = useMemo(
    () => [...groups].sort((a, b) => (b.totalExpenses ?? 0) - (a.totalExpenses ?? 0)).slice(0, 3),
    [groups],
  );

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Split &amp; shared</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settlements">
            Settle up <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="You owe" value={formatCurrency(totalOwed)} icon={Wallet} loading={loading} />
        <StatCard label="You're owed" value={formatCurrency(totalLent)} icon={HandCoins} loading={loading} />
        <StatCard label="Active groups" value={String(groups.length)} icon={Users2} loading={groupsQuery.isLoading} />
        <StatCard label="Pending settlements" value={String(pending.length)} icon={Scale} loading={loading} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Top outstanding + quick settle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top outstanding balance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : topOutstanding ? (
                <div className="flex items-center justify-between gap-3">
                  <BalancePill descriptor={describeDirectBalance(topOutstanding.net, topOutstanding.friend.name)} />
                  <Button size="sm" asChild>
                    <Link href={`/friends/${topOutstanding.friend.userId}`}>Settle up</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You have no outstanding balances. 🎉</p>
              )}
            </CardContent>
          </Card>

          {/* Recent group activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active groups</CardTitle>
            </CardHeader>
            <CardContent>
              {groupsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : topGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No groups yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {topGroups.map((g) => (
                    <li key={g.id}>
                      <Link href={`/groups/${g.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                          <Users2 className="size-4" aria-hidden />
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-foreground">{g.name}</span>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(g.totalExpenses ?? 0)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <ChartCard title="Debt distribution" description="Who you owe" height={260} loading={loading} isEmpty={debtDistribution.length === 0} emptyMessage="You don't owe anyone right now.">
          <CategoryPieChart data={debtDistribution} />
        </ChartCard>
      </div>
    </section>
  );
}
