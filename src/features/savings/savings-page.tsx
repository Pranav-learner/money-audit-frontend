'use client';

import { format, parseISO } from 'date-fns';
import { Pencil, PiggyBank, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDeleteSaving, useSavings, type Saving } from '@/features/savings/api';
import { SavingFormDialog } from '@/features/savings/components/saving-form-dialog';
import { MoneyAreaChart } from '@/shared/components/charts/charts';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { ErrorState } from '@/shared/components/common/error-state';
import { Fab } from '@/shared/components/common/fab';
import { PageHeader } from '@/shared/components/common/page-header';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { formatCurrency, formatDate } from '@/shared/utils/format';

export function SavingsPage() {
  const savingsQuery = useSavings();
  const deleteSaving = useDeleteSaving();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Saving | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Saving | null>(null);

  const savings = useMemo(() => savingsQuery.data ?? [], [savingsQuery.data]);
  const total = savings.reduce((sum, s) => sum + s.amount, 0);

  const trend = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const s of savings) {
      const key = (s.savingDate || '').slice(0, 7);
      if (key) byMonth.set(key, (byMonth.get(key) ?? 0) + s.amount);
    }
    return [...byMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({ label: format(parseISO(`${key}-01`), 'MMM'), value }));
  }, [savings]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Saving) => {
    setEditing(s);
    setFormOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSaving.mutateAsync(deleteTarget.id);
      toast.success('Entry deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div>
      <PageHeader
        title="Savings & Income"
        description="Track your income and savings over time."
        actions={
          <Button onClick={openAdd}>
            <Plus />
            <span className="hidden sm:inline">Add entry</span>
          </Button>
        }
      />

      {savingsQuery.isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      ) : savingsQuery.isError ? (
        <ErrorState onRetry={() => savingsQuery.refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Total saved" value={formatCurrency(total)} icon={PiggyBank} />
            <StatCard label="Entries" value={String(savings.length)} icon={TrendingUp} />
          </div>

          <ChartCard
            title="Monthly savings trend"
            description="How your savings have accumulated"
            height={280}
            isEmpty={trend.length === 0}
            emptyMessage="Add entries to see your savings trend."
          >
            <MoneyAreaChart data={trend} />
          </ChartCard>

          {savings.length === 0 ? (
            <Card>
              <EmptyState
                icon={PiggyBank}
                title="No savings yet"
                description="Add your first saving or income entry to start tracking."
                action={
                  <Button onClick={openAdd}>
                    <Plus />
                    Add entry
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-2">
              {[...savings]
                .sort((a, b) => (b.savingDate || '').localeCompare(a.savingDate || ''))
                .map((s) => (
                  <Card key={s.id} className="group">
                    <CardContent className="flex items-center gap-3 p-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/12 text-success">
                        <PiggyBank className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(s.savingDate)}</p>
                      </div>
                      <span className="text-sm font-semibold text-success">+{formatCurrency(s.amount)}</span>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" aria-label="Edit entry" className="size-8" onClick={() => openEdit(s)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete entry"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      <Fab label="Add entry" onClick={openAdd} />

      <SavingFormDialog open={formOpen} onOpenChange={setFormOpen} saving={editing} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete entry?"
        description="This permanently removes this savings/income entry."
        confirmLabel="Delete"
        destructive
        loading={deleteSaving.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
