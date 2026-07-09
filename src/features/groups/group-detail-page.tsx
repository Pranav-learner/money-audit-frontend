'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRightLeft, Plus, Receipt, UserPlus, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { EditRequestsPanel } from '@/features/edit-requests/components/edit-requests-panel';
import { useGroup, useGroupBalances, useGroupExpenses } from '@/features/groups/api';
import { AddMemberDialog } from '@/features/groups/components/add-member-dialog';
import { GroupExpenseDialog } from '@/features/groups/components/group-expense-dialog';
import { SettleDialog } from '@/features/settlements/components/settle-dialog';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { BalanceCard } from '@/shared/components/widgets/balance-card';
import { describeGroupBalance, toneTextClass } from '@/shared/utils/balance';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { initialsOf } from '@/shared/utils/initials';

export function GroupDetailPage({ groupId }: { groupId: string }) {
  const { user } = useAuth();
  const groupQuery = useGroup(groupId);
  const balancesQuery = useGroupBalances(groupId);
  const expensesQuery = useGroupExpenses(groupId);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const currentUserId = user?.id ?? '';
  const balances = useMemo(() => balancesQuery.data ?? [], [balancesQuery.data]);
  const members = useMemo(() => balances.map((b) => ({ userId: b.userId, userName: b.userName })), [balances]);
  const myBalance = balances.find((b) => b.userId === currentUserId)?.netBalance ?? 0;
  const topCreditor = useMemo(
    () => balances.filter((b) => b.userId !== currentUserId && b.netBalance > 0).sort((a, b) => b.netBalance - a.netBalance)[0],
    [balances, currentUserId],
  );
  const iOwe = myBalance < 0;
  const expenses = expensesQuery.data ?? [];

  const myDescriptor = describeGroupBalance(myBalance, 'You', true);

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground">
        <Link href="/groups">
          <ArrowLeft />
          Groups
        </Link>
      </Button>

      <PageHeader
        title={groupQuery.data?.name ?? 'Group'}
        description={`${members.length} members • ${formatCurrency(groupQuery.data?.totalExpenses ?? 0)} total`}
        actions={
          <>
            <Button variant="outline" onClick={() => setMemberOpen(true)}>
              <UserPlus />
              <span className="hidden sm:inline">Add member</span>
            </Button>
            <Button onClick={() => setExpenseOpen(true)}>
              <Plus />
              <span className="hidden sm:inline">Add expense</span>
            </Button>
          </>
        }
      />

      {groupQuery.isError ? (
        <ErrorState onRetry={() => groupQuery.refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: balance + members */}
          <div className="space-y-4">
            {balancesQuery.isLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <BalanceCard
                title="Your balance"
                descriptor={myDescriptor}
                action={
                  iOwe && topCreditor ? (
                    <Button size="sm" onClick={() => setSettleOpen(true)}>
                      <ArrowRightLeft />
                      Settle
                    </Button>
                  ) : undefined
                }
              />
            )}

            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <Users2 className="size-4 text-muted-foreground" aria-hidden />
                <CardTitle className="text-base">Members</CardTitle>
              </CardHeader>
              <CardContent>
                {balancesQuery.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <EmptyState icon={UserPlus} title="No members yet" description="Add members to start splitting." />
                ) : (
                  <ul className="space-y-1">
                    {balances.map((b) => {
                      const d = describeGroupBalance(b.netBalance, b.userName, b.userId === currentUserId);
                      return (
                        <li key={b.userId} className="flex items-center gap-3 py-1.5">
                          <Avatar className="size-8">
                            <AvatarFallback>{initialsOf(b.userName)}</AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate text-sm text-foreground">
                            {b.userId === currentUserId ? 'You' : b.userName}
                          </span>
                          <span className={`text-xs font-medium ${toneTextClass(d.tone)}`}>
                            {d.tone === 'neutral' ? 'settled' : formatCurrency(d.amount)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <EditRequestsPanel compact />
          </div>

          {/* Right: expense timeline */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Expense timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : expensesQuery.isError ? (
                <ErrorState onRetry={() => expensesQuery.refetch()} />
              ) : expenses.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No expenses yet"
                  description="Add the first shared expense for this group."
                  action={
                    <Button onClick={() => setExpenseOpen(true)}>
                      <Plus />
                      Add expense
                    </Button>
                  }
                />
              ) : (
                <ol className="relative space-y-4 border-l border-border pl-5">
                  {expenses.map((e) => (
                    <motion.li
                      key={e.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative"
                    >
                      <span className="absolute -left-[26px] top-1 flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary" aria-hidden />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.paidBy} paid • {formatDate(e.date)} • {e.splits?.length ?? 0}-way {e.splitType?.toLowerCase()}
                          </p>
                        </div>
                        <span className="whitespace-nowrap text-sm font-semibold text-foreground">{formatCurrency(e.amount)}</span>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <GroupExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} groupId={groupId} members={members} currentUserId={currentUserId} />
      <AddMemberDialog open={memberOpen} onOpenChange={setMemberOpen} groupId={groupId} />
      {topCreditor && (
        <SettleDialog
          open={settleOpen}
          onOpenChange={setSettleOpen}
          toUserId={topCreditor.userId}
          counterpartyName={topCreditor.userName}
          defaultAmount={Math.abs(myBalance)}
          groupId={groupId}
        />
      )}
    </div>
  );
}
