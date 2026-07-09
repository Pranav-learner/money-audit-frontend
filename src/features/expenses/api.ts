'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
  type Expense,
} from '@/lib/services/expenses';
import { queryKeys } from '@/shared/lib/query-keys';

export type { Expense };

/** Form-shaped expense input; mapped to the backend payload here so pages don't duplicate it. */
export interface ExpenseInput {
  amount: number;
  categoryId: string;
  date: string;
  description: string;
}

function toPayload(input: ExpenseInput) {
  return {
    amount: input.amount,
    categoryId: input.categoryId,
    expenseDate: input.date,
    description: input.description,
    title: input.description,
  };
}

function invalidateFinance(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['expenses'] });
  qc.invalidateQueries({ queryKey: ['budgets'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useExpenses(month: string) {
  return useQuery({ queryKey: queryKeys.expenses(month), queryFn: () => getExpenses(month) });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseInput) => createExpense(toPayload(input)),
    onSuccess: () => invalidateFinance(qc),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpenseInput }) => updateExpense(id, toPayload(input)),
    onSuccess: () => invalidateFinance(qc),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => invalidateFinance(qc),
  });
}
