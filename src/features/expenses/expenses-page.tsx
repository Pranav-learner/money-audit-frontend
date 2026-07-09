'use client';

import { Plus, Receipt, ScanLine, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCategories } from '@/features/categories/api';
import { useDeleteExpense, useExpenses, type Expense } from '@/features/expenses/api';
import { ExpenseDetailsDrawer } from '@/features/expenses/components/expense-details-drawer';
import { ExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog';
import { ExpenseList } from '@/features/expenses/components/expense-list';
import { ReceiptUploadDialog } from '@/features/expenses/components/receipt-upload-dialog';
import { ErrorState } from '@/shared/components/common/error-state';
import { Fab } from '@/shared/components/common/fab';
import { PageHeader } from '@/shared/components/common/page-header';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { currentMonthParam, formatCurrency } from '@/shared/utils/format';

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
const PAGE_SIZE = 10;

export function ExpensesPage() {
  const [month, setMonth] = useState(currentMonthParam());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortKey>('date-desc');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const expensesQuery = useExpenses(month);
  const categoriesQuery = useCategories();
  const deleteExpense = useDeleteExpense();

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (expensesQuery.data ?? []).filter((e) => {
      const matchesSearch =
        !q ||
        e.description?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        String(e.amount).includes(q);
      const matchesCategory = categoryFilter === 'all' || e.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    const sorted = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return a.date.localeCompare(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return b.date.localeCompare(a.date);
      }
    });
    return sorted;
  }, [expensesQuery.data, search, categoryFilter, sortBy]);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (expense: Expense) => {
    setDetailsOpen(false);
    setEditing(expense);
    setFormOpen(true);
  };
  const openDetails = (expense: Expense) => {
    setSelected(expense);
    setDetailsOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense.mutateAsync(deleteTarget.id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      setDetailsOpen(false);
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track and manage your spending."
        actions={
          <>
            <Button variant="outline" onClick={() => setReceiptOpen(true)}>
              <ScanLine />
              <span className="hidden sm:inline">Scan receipt</span>
            </Button>
            <Button id="add-expense-btn" onClick={openAdd}>
              <Plus />
              <span className="hidden sm:inline">Add expense</span>
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search description, category or amount…"
              className="pl-9"
              aria-label="Search expenses"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex lg:w-auto">
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Month"
              className="lg:w-40"
            />
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger aria-label="Filter by category" className="lg:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {(c.icon || '📁') + ' ' + c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger aria-label="Sort" className="lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="amount-desc">Highest amount</SelectItem>
                <SelectItem value="amount-asc">Lowest amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary line */}
      {!expensesQuery.isLoading && !expensesQuery.isError && (
        <div className="mb-3 flex items-center justify-between px-1 text-sm">
          <span className="text-muted-foreground">{filtered.length} expense(s)</span>
          <span className="font-semibold text-foreground">Total: {formatCurrency(total)}</span>
        </div>
      )}

      {/* States */}
      {expensesQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : expensesQuery.isError ? (
        <ErrorState onRetry={() => expensesQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Add your first expense or scan a receipt to get started."
            action={
              <Button onClick={openAdd}>
                <Plus />
                Add expense
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <ExpenseList
            expenses={pageItems}
            categoryById={categoryById}
            onSelect={openDetails}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {pageCount}
              </span>
              <Button variant="outline" size="sm" disabled={safePage >= pageCount} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Fab label="Add expense" onClick={openAdd} />

      {/* Dialogs & drawers */}
      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} categories={categories} expense={editing} />
      <ReceiptUploadDialog open={receiptOpen} onOpenChange={setReceiptOpen} categories={categories} />
      <ExpenseDetailsDrawer
        expense={selected}
        category={selected ? categoryById[selected.categoryId] : undefined}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete expense?"
        description="This permanently removes the expense. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteExpense.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
