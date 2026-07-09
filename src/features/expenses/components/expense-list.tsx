'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/features/categories/api';
import type { Expense } from '@/features/expenses/api';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { CategoryAvatar } from '@/shared/components/widgets/category-avatar';
import { formatCurrency, formatDate } from '@/shared/utils/format';

export interface ExpenseListProps {
  expenses: Expense[];
  categoryById: Record<string, Category>;
  onSelect: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function RowActions({ expense, onEdit, onDelete }: { expense: Expense; onEdit: (e: Expense) => void; onDelete: (e: Expense) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Expense actions" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(expense)}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={() => onDelete(expense)}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Responsive expense list: a table on desktop, tappable cards on mobile. */
export function ExpenseList({ expenses, categoryById, onSelect, onEdit, onDelete }: ExpenseListProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden rounded-xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="cursor-pointer" onClick={() => onSelect(expense)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CategoryAvatar icon={categoryById[expense.categoryId]?.icon} name={expense.category} size={36} />
                    <span className="font-medium text-foreground">{expense.description}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{expense.category}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
                <TableCell className="text-right font-semibold text-destructive">
                  −{formatCurrency(expense.amount)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActions expense={expense} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {expenses.map((expense) => (
          <motion.button
            key={expense.id}
            type="button"
            onClick={() => onSelect(expense)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"
          >
            <CategoryAvatar icon={categoryById[expense.categoryId]?.icon} name={expense.category} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{expense.description}</p>
              <p className="text-xs text-muted-foreground">
                {expense.category} • {formatDate(expense.date)}
              </p>
            </div>
            <span className="text-sm font-semibold text-destructive">−{formatCurrency(expense.amount)}</span>
          </motion.button>
        ))}
      </div>
    </>
  );
}
