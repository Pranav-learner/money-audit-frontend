'use client';

import { AlertTriangle, Pencil, Plus, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useBudgets, type Budget } from '@/features/budgets/api';
import { BudgetFormDialog } from '@/features/budgets/components/budget-form-dialog';
import { useCategories } from '@/features/categories/api';
import { ErrorState } from '@/shared/components/common/error-state';
import { Fab } from '@/shared/components/common/fab';
import { PageHeader } from '@/shared/components/common/page-header';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatCurrency } from '@/shared/utils/format';

function statusVariant(status: string): 'success' | 'warning' | 'destructive' {
  if (status === 'OVER_BUDGET') return 'destructive';
  if (status === 'NEAR_LIMIT') return 'warning';
  return 'success';
}
function statusLabel(status: string): string {
  if (status === 'OVER_BUDGET') return 'Exceeded';
  if (status === 'NEAR_LIMIT') return 'Warning';
  return 'On track';
}
function indicatorClass(status: string): string {
  if (status === 'OVER_BUDGET') return 'bg-destructive';
  if (status === 'NEAR_LIMIT') return 'bg-warning';
  return 'bg-primary';
}

export function BudgetsPage() {
  const budgetsQuery = useBudgets();
  const categoriesQuery = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ categoryId: string; limit: number } | null>(null);

  const budgets = useMemo(() => budgetsQuery.data ?? [], [budgetsQuery.data]);
  const categoryIdByName = useMemo(
    () => Object.fromEntries((categoriesQuery.data ?? []).map((c) => [c.name, c.id])),
    [categoriesQuery.data],
  );

  const totals = useMemo(
    () =>
      budgets.reduce(
        (acc, b) => ({ budget: acc.budget + b.budget, spent: acc.spent + b.spent }),
        { budget: 0, spent: 0 },
      ),
    [budgets],
  );
  const alerts = budgets.filter((b) => b.status !== 'NORMAL');

  const openSet = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b: Budget) => {
    const categoryId = categoryIdByName[b.category];
    if (!categoryId) return;
    setEditing({ categoryId, limit: b.budget });
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Set monthly limits and track your spending against them."
        actions={
          <Button onClick={openSet}>
            <Plus />
            <span className="hidden sm:inline">Set budget</span>
          </Button>
        }
      />

      {budgetsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : budgetsQuery.isError ? (
        <ErrorState onRetry={() => budgetsQuery.refetch()} />
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No budgets yet"
            description="Set a monthly limit for a category to start tracking your budget."
            action={
              <Button onClick={openSet}>
                <Plus />
                Set budget
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total budget" value={formatCurrency(totals.budget)} icon={Target} />
            <StatCard label="Spent" value={formatCurrency(totals.spent)} icon={Target} />
            <StatCard label="Remaining" value={formatCurrency(Math.max(0, totals.budget - totals.spent))} icon={Target} />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
              <div className="text-sm">
                <p className="font-medium text-foreground">Budget alerts</p>
                <p className="text-muted-foreground">
                  {alerts.map((a) => a.category).join(', ')} {alerts.length === 1 ? 'is' : 'are'} near or over the limit.
                </p>
              </div>
            </div>
          )}

          {/* Budget cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {budgets.map((b) => (
              <Card key={b.category} className="group">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{b.category}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(b.status)}>{b.percentageUsed}%</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${b.category} budget`}
                        className="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => openEdit(b)}
                        disabled={!categoryIdByName[b.category]}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(b.percentageUsed, 100)}
                    indicatorClassName={indicatorClass(b.status)}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="font-semibold text-foreground">{formatCurrency(b.spent)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{statusLabel(b.status)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Limit</p>
                      <p className="font-semibold text-muted-foreground">{formatCurrency(b.budget)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Fab label="Set budget" onClick={openSet} />

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categoriesQuery.data ?? []}
        initial={editing}
      />
    </div>
  );
}
