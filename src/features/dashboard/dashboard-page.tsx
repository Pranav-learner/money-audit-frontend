'use client';

import { AlertTriangle, ArrowRight, PiggyBank, Plus, Receipt, ScanLine, Target, TrendingDown, Wallet } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBudgets } from '@/features/budgets/api';
import { useCategories } from '@/features/categories/api';
import { useDashboardCharts, useDashboardSummary } from '@/features/dashboard/api';
import { IntelligenceSummary } from '@/features/dashboard/components/intelligence-summary';
import { SplitSummary } from '@/features/dashboard/components/split-summary';
import { useExpenses } from '@/features/expenses/api';
import { ExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog';
import { ReceiptUploadDialog } from '@/features/expenses/components/receipt-upload-dialog';
import { useReceipts } from '@/features/receipts/api';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { PageHeader } from '@/shared/components/common/page-header';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { CategoryAvatar } from '@/shared/components/widgets/category-avatar';
import { QuickActionCard } from '@/shared/components/widgets/quick-action-card';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency, formatDate, todayIso } from '@/shared/utils/format';

// Charts are lazily loaded so their (recharts) bundle isn't in the initial dashboard payload.
const chartFallback = () => <Skeleton className="size-full" />;
const MoneyBarChart = dynamic(() => import('@/shared/components/charts/charts').then((m) => ({ default: m.MoneyBarChart })), {
  ssr: false,
  loading: chartFallback,
});
const MoneyAreaChart = dynamic(() => import('@/shared/components/charts/charts').then((m) => ({ default: m.MoneyAreaChart })), {
  ssr: false,
  loading: chartFallback,
});
const CategoryPieChart = dynamic(() => import('@/shared/components/charts/charts').then((m) => ({ default: m.CategoryPieChart })), {
  ssr: false,
  loading: chartFallback,
});

interface MonthPoint {
  month: string;
  amount: number;
}
interface DatePoint {
  date: string;
  amount: number;
}
interface NamePoint {
  name: string;
  value: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const summaryQuery = useDashboardSummary();
  const chartsQuery = useDashboardCharts();
  const expensesQuery = useExpenses(new Date().toISOString().slice(0, 7));
  const budgetsQuery = useBudgets();
  const receiptsQuery = useReceipts();
  const categoriesQuery = useCategories();

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const summary = summaryQuery.data;
  const expenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);
  const categoryById = useMemo(
    () => Object.fromEntries((categoriesQuery.data ?? []).map((c) => [c.id, c])),
    [categoriesQuery.data],
  );

  const todaySpending = useMemo(() => {
    const today = todayIso();
    return expenses.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const monthly = ((chartsQuery.data?.spendingOverview as MonthPoint[]) ?? []).map((d) => ({ label: d.month, value: d.amount }));
  const trend = ((chartsQuery.data?.expenseTrend as DatePoint[]) ?? []).map((d) => ({ label: d.date, value: d.amount }));
  const distribution = ((chartsQuery.data?.categoryDistribution as NamePoint[]) ?? []).filter((d) => d.value > 0);

  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [expenses],
  );
  const budgetAlerts = (budgetsQuery.data ?? []).filter((b) => b.status !== 'NORMAL').slice(0, 4);
  const recentReceipts = (receiptsQuery.data ?? []).slice(0, 4);

  const budgetUsagePct =
    summary && summary.totalBudget > 0 ? Math.round((summary.totalBudgetSpent / summary.totalBudget) * 100) : 0;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here's your financial snapshot for this month." />

      {/* Summary widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's spending" value={formatCurrency(todaySpending)} icon={TrendingDown} loading={expensesQuery.isLoading} />
        <StatCard
          label="This month"
          value={formatCurrency(summary?.monthlyExpenses ?? 0)}
          icon={Wallet}
          loading={summaryQuery.isLoading}
          hint={summary?.expenseTrend ? `${summary.expenseTrend} vs last month` : undefined}
        />
        <StatCard label="Total savings" value={formatCurrency(summary?.totalSavings ?? 0)} icon={PiggyBank} loading={summaryQuery.isLoading} />
        <StatCard
          label="Budget used"
          value={`${budgetUsagePct}%`}
          icon={Target}
          loading={summaryQuery.isLoading}
          hint={summary ? `${formatCurrency(summary.totalBudgetSpent)} of ${formatCurrency(summary.totalBudget)}` : undefined}
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard icon={Plus} label="Add expense" description="Log a transaction" onClick={() => setExpenseOpen(true)} />
        <QuickActionCard icon={ScanLine} label="Scan receipt" description="Extract with OCR" onClick={() => setReceiptOpen(true)} />
        <QuickActionCard icon={Target} label="Set budget" description="Plan your month" href="/budgets" />
        <QuickActionCard icon={PiggyBank} label="Add saving" description="Record income" href="/savings" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly spending" description="Your spending across the year" loading={chartsQuery.isLoading} isEmpty={monthly.length === 0}>
            <MoneyBarChart data={monthly} />
          </ChartCard>
        </div>
        <ChartCard title="Category distribution" description="Where your money goes" loading={chartsQuery.isLoading} isEmpty={distribution.length === 0}>
          <CategoryPieChart data={distribution} />
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="Spending trend" description="Recent spending over time" height={240} loading={chartsQuery.isLoading} isEmpty={trend.length === 0}>
          <MoneyAreaChart data={trend} />
        </ChartCard>
      </div>

      {/* Recent expenses + side widgets */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent expenses</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/expenses">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {expensesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentExpenses.length === 0 ? (
              <EmptyState icon={Receipt} title="No expenses yet" description="Add your first expense to see it here." />
            ) : (
              <ul className="divide-y divide-border">
                {recentExpenses.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    <CategoryAvatar icon={categoryById[e.categoryId]?.icon} name={e.category} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{e.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.category} • {formatDate(e.date)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-destructive">−{formatCurrency(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Budget alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetAlerts.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">All budgets are on track. 🎉</p>
              ) : (
                <ul className="space-y-2">
                  {budgetAlerts.map((b) => (
                    <li key={b.category} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className={`size-4 shrink-0 ${b.status === 'OVER_BUDGET' ? 'text-destructive' : 'text-warning'}`} aria-hidden />
                      <span className="flex-1 truncate text-foreground">{b.category}</span>
                      <Badge variant={b.status === 'OVER_BUDGET' ? 'destructive' : 'warning'}>{b.percentageUsed}%</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Recent OCR uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent receipts</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReceipts.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">No receipts scanned yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentReceipts.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 text-sm">
                      <ScanLine className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="flex-1 truncate text-foreground">{r.merchant || 'Receipt'}</span>
                      <span className="font-medium text-foreground">{formatCurrency(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Intelligence snapshot */}
      <IntelligenceSummary />

      {/* Splitwise / social summary */}
      <SplitSummary />

      <ExpenseFormDialog open={expenseOpen} onOpenChange={setExpenseOpen} categories={categoriesQuery.data ?? []} />
      <ReceiptUploadDialog open={receiptOpen} onOpenChange={setReceiptOpen} categories={categoriesQuery.data ?? []} />
    </div>
  );
}
