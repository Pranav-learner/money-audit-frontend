'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDirectExpense,
  createDirectPayment,
  getAllDirectExpenses,
  getDirectExpenses,
  getNetBalance,
  type CreateDirectExpenseRequest,
  type DirectTransaction,
} from '@/lib/services/direct';
import { queryKeys } from '@/shared/lib/query-keys';

export type { DirectTransaction, CreateDirectExpenseRequest };

export function useAllDirectExpenses() {
  return useQuery({ queryKey: queryKeys.directAll(), queryFn: getAllDirectExpenses });
}

export function useDirectExpenses(friendId: string) {
  return useQuery({
    queryKey: queryKeys.directFor(friendId),
    queryFn: () => getDirectExpenses(friendId),
    enabled: !!friendId,
  });
}

export function useNetBalance(friendId: string) {
  return useQuery({
    queryKey: queryKeys.netBalance(friendId),
    queryFn: () => getNetBalance(friendId),
    enabled: !!friendId,
  });
}

function invalidateDirect(qc: ReturnType<typeof useQueryClient>, friendId: string) {
  qc.invalidateQueries({ queryKey: queryKeys.directFor(friendId) });
  qc.invalidateQueries({ queryKey: queryKeys.netBalance(friendId) });
  qc.invalidateQueries({ queryKey: queryKeys.directAll() });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCreateDirectExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDirectExpenseRequest) => createDirectExpense(data),
    onSuccess: (_r, data) => invalidateDirect(qc, data.friendId),
  });
}

export function useCreateDirectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ friendId, amount, note }: { friendId: string; amount: number; note: string }) =>
      createDirectPayment(friendId, amount, note),
    onSuccess: (_r, vars) => invalidateDirect(qc, vars.friendId),
  });
}
