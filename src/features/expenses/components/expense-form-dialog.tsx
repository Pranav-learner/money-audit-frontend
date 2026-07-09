'use client';

import { Controller } from 'react-hook-form';
import { z } from 'zod';
import type { Category } from '@/features/categories/api';
import { useCreateExpense, useUpdateExpense, type Expense } from '@/features/expenses/api';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from '@/shared/components/ui/toast';
import { useZodForm } from '@/shared/lib/use-zod-form';
import { todayIso } from '@/shared/utils/format';
import type { ApiError } from '@/lib/api';

const schema = z.object({
  amount: z.coerce.number().positive('Enter an amount greater than 0'),
  categoryId: z.string().min(1, 'Select a category'),
  date: z.string().min(1, 'Pick a date'),
  description: z.string().max(160).optional(),
});
type FormValues = z.infer<typeof schema>;

export interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  /** Provide to edit; omit to create. */
  expense?: Expense | null;
}

export function ExpenseFormDialog({ open, onOpenChange, categories, expense }: ExpenseFormDialogProps) {
  const isEdit = !!expense;
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const saving = create.isPending || update.isPending;

  const form = useZodForm(schema, {
    defaultValues: {
      amount: expense?.amount,
      categoryId: expense?.categoryId ?? '',
      date: expense?.date ?? todayIso(),
      description: expense?.description ?? '',
    },
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  // Re-seed the form whenever the dialog opens for a different expense.
  const onOpen = (next: boolean) => {
    if (next) {
      reset({
        amount: expense?.amount,
        categoryId: expense?.categoryId ?? '',
        date: expense?.date ?? todayIso(),
        description: expense?.description ?? '',
      });
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit(async (values: FormValues) => {
    const input = {
      amount: values.amount,
      categoryId: values.categoryId,
      date: values.date,
      description: values.description?.trim() || 'Expense',
    };
    try {
      if (isEdit && expense) {
        await update.mutateAsync({ id: expense.id, input });
        toast.success('Expense updated');
      } else {
        await create.mutateAsync(input);
        toast.success('Expense added');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to save expense');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit expense' : 'Add expense'}</DialogTitle>
          <DialogDescription>Record what you spent and where it went.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormItem>
            <FormLabel htmlFor="expense-amount" required>
              Amount (₹)
            </FormLabel>
            <Input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0"
              aria-invalid={!!errors.amount}
              {...register('amount')}
            />
            <FormMessage>{errors.amount?.message}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel required>Category</FormLabel>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="expense-category" aria-invalid={!!errors.categoryId}>
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
              )}
            />
            <FormMessage>{errors.categoryId?.message}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="expense-date" required>
              Date
            </FormLabel>
            <Input id="expense-date" type="date" aria-invalid={!!errors.date} {...register('date')} />
            <FormMessage>{errors.date?.message}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="expense-description">Description</FormLabel>
            <Input id="expense-description" placeholder="What was it for?" {...register('description')} />
            <FormMessage>{errors.description?.message}</FormMessage>
          </FormItem>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button id="expense-save" type="submit" loading={saving}>
              {isEdit ? 'Update' : 'Add expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
