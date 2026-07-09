'use client';

import { ArrowLeft, ArrowRightLeft, Plus, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useFriends } from '@/features/friends/api';
import { DirectExpenseDialog } from '@/features/direct/components/direct-expense-dialog';
import { useDirectExpenses, useNetBalance } from '@/features/direct/api';
import { SettleDialog } from '@/features/settlements/components/settle-dialog';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { BalanceCard } from '@/shared/components/widgets/balance-card';
import { describeDirectBalance } from '@/shared/utils/balance';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { initialsOf } from '@/shared/utils/initials';

export function FriendProfilePage({ friendId }: { friendId: string }) {
  const friendsQuery = useFriends();
  const balanceQuery = useNetBalance(friendId);
  const txQuery = useDirectExpenses(friendId);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const friend = useMemo(() => (friendsQuery.data ?? []).find((f) => f.userId === friendId), [friendsQuery.data, friendId]);
  const transactions = txQuery.data ?? [];
  const friendName = friend?.name ?? transactions[0]?.friendName ?? 'Friend';
  const net = balanceQuery.data ?? 0;
  const descriptor = describeDirectBalance(net, friendName);
  const iOwe = net > 0;

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground">
        <Link href="/friends">
          <ArrowLeft />
          Friends
        </Link>
      </Button>

      <PageHeader
        title={friendName}
        description={friend?.phone || friend?.email || 'Direct expenses & settlements'}
        actions={
          <>
            <Button variant="outline" onClick={() => setSettleOpen(true)}>
              <ArrowRightLeft />
              <span className="hidden sm:inline">Settle up</span>
            </Button>
            <Button onClick={() => setExpenseOpen(true)}>
              <Plus />
              <span className="hidden sm:inline">Add expense</span>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {balanceQuery.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <BalanceCard
              title="Your balance"
              descriptor={descriptor}
              action={
                <Avatar className="size-12">
                  <AvatarFallback>{initialsOf(friendName)}</AvatarFallback>
                </Avatar>
              }
            />
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {txQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : txQuery.isError ? (
              <ErrorState onRetry={() => txQuery.refetch()} />
            ) : transactions.length === 0 ? (
              <EmptyState icon={Receipt} title="No transactions yet" description={`Add a shared expense with ${friendName}.`} />
            ) : (
              <ul className="divide-y divide-border">
                {transactions.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`flex size-9 items-center justify-center rounded-lg ${t.type === 'PAYMENT' ? 'bg-success/12 text-success' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {t.type === 'PAYMENT' ? <ArrowRightLeft className="size-4" /> : <Receipt className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{t.title || (t.type === 'PAYMENT' ? 'Settlement' : 'Expense')}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(t.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <DirectExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} friendId={friendId} friendName={friendName} />
      <SettleDialog
        open={settleOpen}
        onOpenChange={setSettleOpen}
        toUserId={friendId}
        counterpartyName={friendName}
        defaultAmount={iOwe ? net : 0}
        allowManual
      />
    </div>
  );
}
