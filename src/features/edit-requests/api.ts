'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveEditRequest,
  createEditRequest,
  getPendingEditRequests,
  rejectEditRequest,
  type EditRequest,
} from '@/lib/services/edit-requests';
import { queryKeys } from '@/shared/lib/query-keys';

export type { EditRequest };

export function usePendingEditRequests() {
  return useQuery({ queryKey: queryKeys.editRequests(), queryFn: getPendingEditRequests });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.editRequests() });
  qc.invalidateQueries({ queryKey: ['groups'] });
}

export function useRespondToEditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      action === 'approve' ? approveEditRequest(id) : rejectEditRequest(id),
    onSuccess: () => invalidate(qc),
  });
}

export function useCreateEditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, newAmount, note }: { expenseId: string; newAmount: number; note?: string }) =>
      createEditRequest(expenseId, { newAmount, note }),
    onSuccess: () => invalidate(qc),
  });
}
