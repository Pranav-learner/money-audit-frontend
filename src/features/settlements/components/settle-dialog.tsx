'use client';

import { CreditCard, HandCoins } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettlement } from '@/features/settlements/use-settlement';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormItem, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { toast } from '@/shared/components/ui/toast';
import { formatCurrency } from '@/shared/utils/format';

export interface SettleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toUserId: string;
  counterpartyName: string;
  defaultAmount: number;
  groupId?: string;
  /** Manual "mark as settled" is only available for direct balances (backend supports it). */
  allowManual?: boolean;
}

export function SettleDialog({
  open,
  onOpenChange,
  toUserId,
  counterpartyName,
  defaultAmount,
  groupId,
  allowManual = false,
}: SettleDialogProps) {
  const { user } = useAuth();
  const { settleManual, settleWithRazorpay, processing } = useSettlement();
  const [amount, setAmount] = useState(String(defaultAmount || ''));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setAmount(String(defaultAmount || ''));
  }, [open, defaultAmount]);

  const amt = Number(amount);
  const valid = amt > 0;
  const prefill = { name: user?.name, email: user?.email, contact: user?.phone };

  const onPay = async () => {
    if (!valid) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await settleWithRazorpay(
        { toUserId, amount: amt, groupId, note: `Settlement with ${counterpartyName}`, prefill },
        {
          onSuccess: () => {
            toast.success('Payment successful — balances updated');
            onOpenChange(false);
          },
          onFailure: (message) => toast.error(message ?? 'Payment failed. Please retry.'),
        },
      );
    } catch (error) {
      toast.error((error as Error)?.message ?? 'Could not start the payment');
    }
  };

  const onManual = async () => {
    if (!valid) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await settleManual({ toUserId, amount: amt, note: 'Settled up' });
      toast.success('Marked as settled');
      onOpenChange(false);
    } catch {
      toast.error('Failed to record settlement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle up with {counterpartyName}</DialogTitle>
          <DialogDescription>Pay securely via Razorpay{allowManual ? ', or record a manual settlement.' : '.'}</DialogDescription>
        </DialogHeader>

        <FormItem>
          <FormLabel htmlFor="settle-amount" required>
            Amount (₹)
          </FormLabel>
          <Input id="settle-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {valid && <p className="text-xs text-muted-foreground">You&apos;re settling {formatCurrency(amt)}.</p>}
        </FormItem>

        <DialogFooter className="flex-col sm:flex-col sm:items-stretch">
          <Button onClick={onPay} loading={processing} className="w-full">
            <CreditCard />
            Pay with Razorpay
          </Button>
          {allowManual && (
            <Button variant="outline" onClick={onManual} disabled={processing} className="w-full">
              <HandCoins />
              Mark as settled
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
