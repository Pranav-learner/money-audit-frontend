'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBudgets, setBudget, type Budget } from '@/lib/services/budgets';
import { queryKeys } from '@/shared/lib/query-keys';

export type { Budget };

export function useBudgets(month?: number, year?: number) {
  return useQuery({ queryKey: queryKeys.budgets(month, year), queryFn: () => getBudgets(month, year) });
}

/**
 * Create or update a category budget. The backend has no delete endpoint, so budgets are only
 * set/updated (this is respected in the UI).
 */
export function useSetBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, limit }: { categoryId: string; limit: number }) => setBudget(categoryId, limit),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
