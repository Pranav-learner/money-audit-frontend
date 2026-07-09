'use client';

import { z } from 'zod';
import { useCreateSaving, useUpdateSaving, type Saving } from '@/features/savings/api';
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
import { toast } from '@/shared/components/ui/toast';
import { useZodForm } from '@/shared/lib/use-zod-form';
import { todayIso } from '@/shared/utils/format';
import type { ApiError } from '@/lib/api';

const schema = z.object({
  amount: z.coerce.number().positive('Enter an amount greater than 0'),
  savingDate: z.string().min(1, 'Pick a date'),
  title: z.string().max(80).optional(),
});
type FormValues = z.infer<typeof schema>;

export interface SavingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: Saving | null;
}

export function SavingFormDialog({ open, onOpenChange, saving }: SavingFormDialogProps) {
  const isEdit = !!saving;
  const create = useCreateSaving();
  const update = useUpdateSaving();
  const busy = create.isPending || update.isPending;

  const form = useZodForm(schema, {
    defaultValues: {
      amount: saving?.amount,
      savingDate: saving?.savingDate ?? todayIso(),
      title: saving?.title ?? '',
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      reset({ amount: saving?.amount, savingDate: saving?.savingDate ?? todayIso(), title: saving?.title ?? '' });
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit(async (values: FormValues) => {
    const input = { amount: values.amount, savingDate: values.savingDate, title: values.title?.trim() || 'Saving' };
    try {
      if (isEdit && saving) {
        await update.mutateAsync({ id: saving.id, input });
        toast.success('Entry updated');
      } else {
        await create.mutateAsync(input);
        toast.success('Entry added');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to save entry');
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit entry' : 'Add saving / income'}</DialogTitle>
          <DialogDescription>Record money you saved or earned.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormItem>
            <FormLabel htmlFor="saving-amount" required>
              Amount (₹)
            </FormLabel>
            <Input id="saving-amount" type="number" step="0.01" placeholder="0" aria-invalid={!!errors.amount} {...register('amount')} />
            <FormMessage>{errors.amount?.message}</FormMessage>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="saving-date" required>
              Date
            </FormLabel>
            <Input id="saving-date" type="date" aria-invalid={!!errors.savingDate} {...register('savingDate')} />
            <FormMessage>{errors.savingDate?.message}</FormMessage>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="saving-title">Title</FormLabel>
            <Input id="saving-title" placeholder="e.g. Salary, Emergency fund" {...register('title')} />
            <FormMessage>{errors.title?.message}</FormMessage>
          </FormItem>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              {isEdit ? 'Update' : 'Add entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
