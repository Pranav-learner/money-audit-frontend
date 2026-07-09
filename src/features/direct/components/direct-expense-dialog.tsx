'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCreateDirectExpense } from '@/features/direct/api';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from '@/shared/components/ui/toast';
import { todayIso } from '@/shared/utils/format';
import type { ApiError } from '@/lib/api';

type SplitType = 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';

export interface DirectExpenseDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  friendId: string;
  friendName: string;
}

export function DirectExpenseDialog({ open, onOpenChange, friendId, friendName }: DirectExpenseDialogProps) {
  const { user } = useAuth();
  const create = useCreateDirectExpense();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [paidByMe, setPaidByMe] = useState(true);
  const [myShare, setMyShare] = useState('');
  const [otherShare, setOtherShare] = useState('');

  const reset = () => {
    setTitle('');
    setAmount('');
    setDate(todayIso());
    setSplitType('EQUAL');
    setPaidByMe(true);
    setMyShare('');
    setOtherShare('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = async () => {
    const total = Number(amount);
    if (!title.trim() || !(total > 0)) {
      toast.error('Enter a title and a valid amount');
      return;
    }
    try {
      await create.mutateAsync({
        friendId,
        title: title.trim(),
        totalAmount: total,
        expenseDate: date,
        splitType,
        paidByUserId: paidByMe ? (user?.id ?? '') : friendId,
        ...(splitType !== 'EQUAL' ? { myShare: Number(myShare) || 0, otherShare: Number(otherShare) || 0 } : {}),
      });
      toast.success('Expense added');
      handleOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to add expense');
    }
  };

  const shareLabel = splitType === 'PERCENTAGE' ? '%' : '₹';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Split an expense with {friendName}</DialogTitle>
          <DialogDescription>Record a shared expense and how it&apos;s split.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormItem>
            <FormLabel required>Description</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dinner" />
          </FormItem>
          <div className="grid grid-cols-2 gap-3">
            <FormItem>
              <FormLabel required>Amount (₹)</FormLabel>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </FormItem>
            <FormItem>
              <FormLabel required>Date</FormLabel>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FormItem>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormItem>
              <FormLabel>Paid by</FormLabel>
              <Select value={paidByMe ? 'me' : 'them'} onValueChange={(v) => setPaidByMe(v === 'me')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">You</SelectItem>
                  <SelectItem value="them">{friendName}</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            <FormItem>
              <FormLabel>Split</FormLabel>
              <Select value={splitType} onValueChange={(v) => setSplitType(v as SplitType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUAL">Equally</SelectItem>
                  <SelectItem value="UNEQUAL">Unequal amounts</SelectItem>
                  <SelectItem value="PERCENTAGE">By percentage</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          {splitType !== 'EQUAL' && (
            <div className="grid grid-cols-2 gap-3">
              <FormItem>
                <FormLabel>Your share ({shareLabel})</FormLabel>
                <Input type="number" value={myShare} onChange={(e) => setMyShare(e.target.value)} placeholder="0" />
              </FormItem>
              <FormItem>
                <FormLabel>Their share ({shareLabel})</FormLabel>
                <Input type="number" value={otherShare} onChange={(e) => setOtherShare(e.target.value)} placeholder="0" />
              </FormItem>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            Add expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
