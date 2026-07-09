'use client';

import { useMemo, useState } from 'react';
import { useCreateGroupExpense, type GroupExpenseInput } from '@/features/groups/api';
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
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/shared/utils/format';
import type { ApiError } from '@/lib/api';

export interface GroupMember {
  userId: string;
  userName: string;
}

type SplitType = GroupExpenseInput['splitType'];

export interface GroupExpenseDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  groupId: string;
  members: GroupMember[];
  currentUserId: string;
}

export function GroupExpenseDialog({ open, onOpenChange, groupId, members, currentUserId }: GroupExpenseDialogProps) {
  const create = useCreateGroupExpense(groupId);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [paidById, setPaidById] = useState(currentUserId);
  const [included, setIncluded] = useState<Set<string>>(() => new Set(members.map((m) => m.userId)));
  const [shares, setShares] = useState<Record<string, string>>({});

  const total = Number(amount) || 0;
  const includedMembers = members.filter((m) => included.has(m.userId));

  const splits = useMemo(() => {
    if (includedMembers.length === 0) return [];
    if (splitType === 'EQUAL') {
      const each = Math.round((total / includedMembers.length) * 100) / 100;
      return includedMembers.map((m) => ({ userId: m.userId, amountOwed: each }));
    }
    if (splitType === 'PERCENTAGE') {
      return includedMembers.map((m) => ({
        userId: m.userId,
        amountOwed: Math.round(((Number(shares[m.userId]) || 0) / 100) * total * 100) / 100,
      }));
    }
    return includedMembers.map((m) => ({ userId: m.userId, amountOwed: Number(shares[m.userId]) || 0 }));
  }, [includedMembers, splitType, total, shares]);

  const allocated = splits.reduce((s, x) => s + x.amountOwed, 0);
  const balanced = splitType === 'EQUAL' || Math.abs(allocated - total) < 1;

  const toggle = (userId: string) => {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const reset = () => {
    setTitle('');
    setAmount('');
    setSplitType('EQUAL');
    setPaidById(currentUserId);
    setIncluded(new Set(members.map((m) => m.userId)));
    setShares({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = async () => {
    if (!title.trim() || !(total > 0)) {
      toast.error('Enter a title and a valid amount');
      return;
    }
    if (includedMembers.length === 0) {
      toast.error('Select at least one member');
      return;
    }
    if (!balanced) {
      toast.error(`Splits must add up to ${formatCurrency(total)}`);
      return;
    }
    try {
      await create.mutateAsync({ title: title.trim(), amount: total, splitType, paidById, splits });
      toast.success('Group expense added');
      handleOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to add expense');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add group expense</DialogTitle>
          <DialogDescription>Record a shared expense and how it splits across members.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormItem>
            <FormLabel required>Description</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hotel booking" />
          </FormItem>
          <div className="grid grid-cols-2 gap-3">
            <FormItem>
              <FormLabel required>Amount (₹)</FormLabel>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </FormItem>
            <FormItem>
              <FormLabel>Paid by</FormLabel>
              <Select value={paidById} onValueChange={setPaidById}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.userId === currentUserId ? 'You' : m.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Split</FormLabel>
            <Select value={splitType} onValueChange={(v) => setSplitType(v as SplitType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUAL">Equally</SelectItem>
                <SelectItem value="UNEQUAL">Custom amounts</SelectItem>
                <SelectItem value="PERCENTAGE">By percentage</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Members</p>
            <div className="space-y-1 rounded-lg border border-border p-2">
              {members.map((m) => {
                const isIn = included.has(m.userId);
                const split = splits.find((s) => s.userId === m.userId);
                return (
                  <div key={m.userId} className={cn('flex items-center gap-3 rounded-md px-2 py-1.5', isIn && 'bg-secondary/50')}>
                    <input
                      type="checkbox"
                      checked={isIn}
                      onChange={() => toggle(m.userId)}
                      aria-label={`Include ${m.userName}`}
                      className="size-4 accent-[var(--primary)]"
                    />
                    <span className="flex-1 truncate text-sm text-foreground">
                      {m.userId === currentUserId ? 'You' : m.userName}
                    </span>
                    {splitType === 'EQUAL' ? (
                      <span className="text-xs text-muted-foreground">{isIn ? formatCurrency(split?.amountOwed ?? 0) : '—'}</span>
                    ) : (
                      <Input
                        type="number"
                        value={shares[m.userId] ?? ''}
                        onChange={(e) => setShares((prev) => ({ ...prev, [m.userId]: e.target.value }))}
                        disabled={!isIn}
                        placeholder={splitType === 'PERCENTAGE' ? '%' : '₹'}
                        className="h-8 w-24"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {total > 0 && (
              <p className={cn('text-xs', balanced ? 'text-muted-foreground' : 'text-destructive')}>
                Allocated {formatCurrency(allocated)} of {formatCurrency(total)}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={create.isPending} disabled={!balanced}>
            Add expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
