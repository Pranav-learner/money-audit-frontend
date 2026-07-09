'use client';

import { useEffect, useState } from 'react';
import { useCreateGoal, useUpdateGoal } from '@/features/intelligence/api';
import type { Goal, GoalType } from '@/lib/services/goals';
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
import { humanizeEnum } from '@/features/intelligence/lib/display';
import type { ApiError } from '@/lib/api';

const GOAL_TYPES: GoalType[] = ['EMERGENCY_FUND', 'VACATION', 'VEHICLE', 'EDUCATION', 'HOUSE', 'GADGET', 'INVESTMENT', 'CUSTOM'];

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goal?: Goal | null;
}) {
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const isEdit = !!goal;

  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('CUSTOM');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(goal?.title ?? '');
      setGoalType(goal?.goalType ?? 'CUSTOM');
      setTargetAmount(goal?.targetAmount ? String(goal.targetAmount) : '');
      setCurrentAmount(goal?.currentAmount ? String(goal.currentAmount) : '');
      setTargetDate(goal?.targetDate ?? '');
    }
  }, [open, goal]);

  const submit = async () => {
    if (!title.trim() || !(Number(targetAmount) > 0) || !targetDate) {
      toast.error('Fill in a title, target amount and date');
      return;
    }
    const data = {
      title: title.trim(),
      goalType,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : undefined,
      targetDate,
    };
    try {
      if (isEdit && goal) {
        await update.mutateAsync({ id: goal.id, data });
        toast.success('Goal updated');
      } else {
        await create.mutateAsync(data);
        toast.success('Goal created');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to save goal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit goal' : 'New goal'}</DialogTitle>
          <DialogDescription>Set a savings target and the engine will build a plan.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormItem>
            <FormLabel required>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New MacBook" />
          </FormItem>
          <div className="grid grid-cols-2 gap-3">
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={goalType} onValueChange={(v) => setGoalType(v as GoalType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {humanizeEnum(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            <FormItem>
              <FormLabel required>Target date</FormLabel>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </FormItem>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormItem>
              <FormLabel required>Target amount (₹)</FormLabel>
              <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0" />
            </FormItem>
            <FormItem>
              <FormLabel>Saved so far (₹)</FormLabel>
              <Input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" />
            </FormItem>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={create.isPending || update.isPending}>
            {isEdit ? 'Update goal' : 'Create goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
