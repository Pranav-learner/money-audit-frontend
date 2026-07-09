'use client';

import { useEffect, useState } from 'react';
import { useSetBudget } from '@/features/budgets/api';
import type { Category } from '@/features/categories/api';
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
import type { ApiError } from '@/lib/api';

export interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  /** Provide to edit an existing budget (locks the category). */
  initial?: { categoryId: string; limit: number } | null;
}

export function BudgetFormDialog({ open, onOpenChange, categories, initial }: BudgetFormDialogProps) {
  const setBudget = useSetBudget();
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    // Seed local form state from props each time the dialog opens (intentional sync).
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoryId(initial?.categoryId ?? '');
      setLimit(initial?.limit ? String(initial.limit) : '');
    }
  }, [open, initial]);

  const isEdit = !!initial;

  const handleSubmit = async () => {
    if (!categoryId || !limit || Number(limit) <= 0) {
      toast.error('Select a category and enter a valid limit');
      return;
    }
    try {
      await setBudget.mutateAsync({ categoryId, limit: Number(limit) });
      toast.success(isEdit ? 'Budget updated' : 'Budget set');
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to save budget');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Update budget' : 'Set budget'}</DialogTitle>
          <DialogDescription>Set a monthly spending limit for a category.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormItem>
            <FormLabel required>Category</FormLabel>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isEdit}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {(c.icon || '📁') + ' ' + c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="budget-limit" required>
              Monthly limit (₹)
            </FormLabel>
            <Input
              id="budget-limit"
              type="number"
              inputMode="decimal"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0"
            />
          </FormItem>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={setBudget.isPending}>
            {isEdit ? 'Update budget' : 'Set budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
