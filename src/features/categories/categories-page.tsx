'use client';

import { FolderTree, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCategories, useDeleteCategory, type Category } from '@/features/categories/api';
import { CategoryFormDialog } from '@/features/categories/components/category-form-dialog';
import { useExpenses } from '@/features/expenses/api';
import { CategoryPieChart } from '@/shared/components/charts/charts';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { ErrorState } from '@/shared/components/common/error-state';
import { Fab } from '@/shared/components/common/fab';
import { PageHeader } from '@/shared/components/common/page-header';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { CategoryAvatar } from '@/shared/components/widgets/category-avatar';
import { getCategoryColor } from '@/shared/utils/category-color';
import { currentMonthParam, formatCurrency } from '@/shared/utils/format';

interface CategoryStat {
  count: number;
  total: number;
}

export function CategoriesPage() {
  const categoriesQuery = useCategories();
  const expensesQuery = useExpenses(currentMonthParam());
  const deleteCategory = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const stats = useMemo(() => {
    const map: Record<string, CategoryStat> = {};
    for (const e of expensesQuery.data ?? []) {
      const s = (map[e.categoryId] ??= { count: 0, total: 0 });
      s.count += 1;
      s.total += e.amount;
    }
    return map;
  }, [expensesQuery.data]);

  const distribution = useMemo(
    () =>
      categories
        .map((c) => ({ name: c.name, value: stats[c.id]?.total ?? 0 }))
        .filter((d) => d.value > 0),
    [categories, stats],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organise your spending into categories."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus />
            <span className="hidden sm:inline">New category</span>
          </Button>
        }
      />

      {categoriesQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : categoriesQuery.isError ? (
        <ErrorState onRetry={() => categoriesQuery.refetch()} />
      ) : categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderTree}
            title="No categories found"
            description="Create categories to organise and analyse your spending."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus />
                New category
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {categories.map((category) => {
              const stat = stats[category.id] ?? { count: 0, total: 0 };
              return (
                <Card key={category.id} className="group transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <CategoryAvatar icon={category.icon} name={category.name} />
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {stat.count} expense{stat.count === 1 ? '' : 's'} this month
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${category.name}`}
                        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        onClick={() => setDeleteTarget(category)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-semibold text-foreground">{formatCurrency(stat.total)}</span>
                      <span
                        className="h-1.5 w-16 rounded-full"
                        style={{ background: getCategoryColor(category.name) }}
                        aria-hidden
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <ChartCard
            title="Category distribution"
            description="This month's spending by category"
            height={300}
            isEmpty={distribution.length === 0}
            emptyMessage="No spending recorded this month."
          >
            <CategoryPieChart data={distribution} />
          </ChartCard>
        </div>
      )}

      <Fab label="New category" onClick={() => setFormOpen(true)} />

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Expenses in this category won't be deleted, but they'll lose their category."
        confirmLabel="Delete"
        destructive
        loading={deleteCategory.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
