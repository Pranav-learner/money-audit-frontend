'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSaving, deleteSaving, getSavings, updateSaving, type Saving } from '@/lib/services/savings';
import { queryKeys } from '@/shared/lib/query-keys';

export type { Saving };

export interface SavingInput {
  amount: number;
  savingDate: string;
  title: string;
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.savings() });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useSavings() {
  return useQuery({ queryKey: queryKeys.savings(), queryFn: getSavings });
}

export function useCreateSaving() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (input: SavingInput) => createSaving(input), onSuccess: () => invalidate(qc) });
}

export function useUpdateSaving() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SavingInput }) => updateSaving(id, input),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteSaving() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteSaving(id), onSuccess: () => invalidate(qc) });
}
