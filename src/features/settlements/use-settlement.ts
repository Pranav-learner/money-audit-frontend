'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useRazorpay, type RazorpayResponse } from '@/features/payments/use-razorpay';
import { createDirectPayment } from '@/lib/services/direct';
import { createRazorpayOrder, getRazorpayKey, verifyRazorpayPayment } from '@/lib/services/payments';

export interface SettleTarget {
  toUserId: string;
  amount: number;
  note?: string;
  groupId?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface SettleCallbacks {
  onSuccess?: () => void;
  onFailure?: (message?: string) => void;
  onDismiss?: () => void;
}

/**
 * Orchestrates settlements: a manual "mark settled" (direct only, via `/direct/settle`) and the
 * full Razorpay pay flow (create order → checkout → verify), invalidating balances on success.
 */
export function useSettlement() {
  const qc = useQueryClient();
  const { openCheckout } = useRazorpay();
  const [processing, setProcessing] = useState(false);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['direct'] });
    qc.invalidateQueries({ queryKey: ['groups'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  }, [qc]);

  const settleManual = useCallback(
    async (target: SettleTarget) => {
      setProcessing(true);
      try {
        await createDirectPayment(target.toUserId, target.amount, target.note ?? 'Settled up');
        invalidate();
      } finally {
        setProcessing(false);
      }
    },
    [invalidate],
  );

  const settleWithRazorpay = useCallback(
    async (target: SettleTarget, callbacks: SettleCallbacks) => {
      setProcessing(true);
      try {
        const [keyId, orderId] = await Promise.all([getRazorpayKey(), createRazorpayOrder(target.amount)]);
        await openCheckout({
          keyId,
          orderId,
          amount: target.amount,
          description: target.note ?? 'Settlement',
          prefill: target.prefill,
          onSuccess: async (response: RazorpayResponse) => {
            try {
              await verifyRazorpayPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: target.amount,
                toUserId: target.toUserId,
                groupId: target.groupId,
                note: target.note,
              });
              invalidate();
              callbacks.onSuccess?.();
            } catch {
              callbacks.onFailure?.('Payment verification failed');
            } finally {
              setProcessing(false);
            }
          },
          onFailure: () => {
            setProcessing(false);
            callbacks.onFailure?.('Payment failed');
          },
          onDismiss: () => {
            setProcessing(false);
            callbacks.onDismiss?.();
          },
        });
      } catch (error) {
        setProcessing(false);
        throw error;
      }
    },
    [invalidate, openCheckout],
  );

  return { settleManual, settleWithRazorpay, processing };
}
