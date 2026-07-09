'use client';

import { ArrowRightLeft, HandCoins, Scale, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAllDirectExpenses } from '@/features/direct/api';
import { useFriends, type Friend } from '@/features/friends/api';
import { useFriendBalances } from '@/features/settlements/api';
import { SettleDialog } from '@/features/settlements/components/settle-dialog';
import { PageHeader } from '@/shared/components/common/page-header';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { BalancePill } from '@/shared/components/widgets/balance-card';
import { describeDirectBalance } from '@/shared/utils/balance';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { initialsOf } from '@/shared/utils/initials';

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Wallet; tone: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}

export function SettlementsPage() {
  const friendsQuery = useFriends();
  const friends = friendsQuery.data ?? [];
  const { balances, isLoading, totalOwed, totalLent, net } = useFriendBalances(friends);
  const historyQuery = useAllDirectExpenses();

  const [settleWith, setSettleWith] = useState<{ friend: Friend; amount: number } | null>(null);

  const pending = useMemo(() => balances.filter((b) => b.net !== 0).sort((a, b) => b.net - a.net), [balances]);
  const payments = useMemo(() => (historyQuery.data ?? []).filter((t) => t.type === 'PAYMENT'), [historyQuery.data]);

  const loading = friendsQuery.isLoading || isLoading;

  return (
    <div>
      <PageHeader title="Settlements" description="See who owes whom and settle up." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          <>
            <SummaryCard label="You owe" value={formatCurrency(totalOwed)} icon={Wallet} tone="text-destructive" />
            <SummaryCard label="You're owed" value={formatCurrency(totalLent)} icon={HandCoins} tone="text-success" />
            <SummaryCard label="Net balance" value={formatCurrency(Math.abs(net))} icon={Scale} tone={net >= 0 ? 'text-success' : 'text-destructive'} />
          </>
        )}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <Card>
              <EmptyState icon={Scale} title="You're all settled up" description="No outstanding balances with your friends." />
            </Card>
          ) : (
            <div className="space-y-2">
              {pending.map(({ friend, net: n }) => {
                const descriptor = describeDirectBalance(n, friend.name);
                const iOwe = n > 0;
                return (
                  <Card key={friend.friendshipId}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Avatar className="size-10">
                        <AvatarFallback>{initialsOf(friend.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{friend.name}</p>
                        <BalancePill descriptor={descriptor} />
                      </div>
                      {iOwe && (
                        <Button size="sm" onClick={() => setSettleWith({ friend, amount: n })}>
                          <ArrowRightLeft />
                          Settle
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : payments.length === 0 ? (
            <Card>
              <EmptyState icon={HandCoins} title="No settlements yet" description="Settlements you make will appear here." />
            </Card>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-success/12 text-success">
                      <ArrowRightLeft className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        Settlement{p.friendName ? ` with ${p.friendName}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-success">{formatCurrency(p.amount)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {settleWith && (
        <SettleDialog
          open={!!settleWith}
          onOpenChange={(o) => !o && setSettleWith(null)}
          toUserId={settleWith.friend.userId}
          counterpartyName={settleWith.friend.name}
          defaultAmount={settleWith.amount}
          allowManual
        />
      )}
    </div>
  );
}
