'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmReceipt,
  getReceipts,
  uploadReceipt,
  type ConfirmReceiptRequest,
  type ReceiptUploadResponse,
} from '@/lib/services/receipts';
import { queryKeys } from '@/shared/lib/query-keys';

export type { ReceiptUploadResponse, ConfirmReceiptRequest };

export function useReceipts() {
  return useQuery({ queryKey: queryKeys.receipts(), queryFn: getReceipts });
}

/** Upload a receipt image for OCR extraction (does NOT save an expense — the user confirms first). */
export function useUploadReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadReceipt(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.receipts() }),
  });
}

/** Confirm the (possibly edited) extracted values, which persists the expense. */
export function useConfirmReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfirmReceiptRequest }) => confirmReceipt(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.receipts() });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
