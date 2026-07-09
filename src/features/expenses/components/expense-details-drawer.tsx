'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/features/categories/api';
import type { Expense } from '@/features/expenses/api';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { CategoryAvatar } from '@/shared/components/widgets/category-avatar';
import { formatCurrency, formatDate } from '@/shared/utils/format';

export interface ExpenseDetailsDrawerProps {
  expense: Expense | null;
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ExpenseDetailsDrawer({ expense, category, open, onOpenChange, onEdit, onDelete }: ExpenseDetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Expense details</SheetTitle>
          <SheetDescription>Review this transaction.</SheetDescription>
        </SheetHeader>

        {expense && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-6 flex items-center gap-3">
              <CategoryAvatar icon={category?.icon} name={expense.category} size={52} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{expense.description}</p>
                <p className="text-sm text-muted-foreground">{expense.category}</p>
              </div>
              <span className="ml-auto text-lg font-semibold text-destructive">
                −{formatCurrency(expense.amount)}
              </span>
            </div>

            <div>
              <Row label="Amount" value={formatCurrency(expense.amount)} />
              <Row label="Category" value={expense.category || '—'} />
              <Row label="Date" value={formatDate(expense.date)} />
              <Row label="Description" value={expense.description || '—'} />
            </div>
          </div>
        )}

        <SheetFooter>
          {expense && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onEdit(expense)}>
                <Pencil />
                Edit
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => onDelete(expense)}>
                <Trash2 />
                Delete
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
