'use client';

import { useState } from 'react';
import { useCreateCategory } from '@/features/categories/api';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormItem, FormHint, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { toast } from '@/shared/components/ui/toast';
import { cn } from '@/shared/utils/cn';
import type { ApiError } from '@/lib/api';

const ICON_CHOICES = ['🍔', '🛒', '🏠', '🚗', '💡', '🎬', '✈️', '🏥', '📚', '💳', '🎁', '☕', '👕', '📱', '💰'];

export interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryFormDialog({ open, onOpenChange }: CategoryFormDialogProps) {
  const create = useCreateCategory();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_CHOICES[0]);

  const reset = () => {
    setName('');
    setIcon(ICON_CHOICES[0]);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Enter a category name');
      return;
    }
    try {
      await create.mutateAsync({ name: name.trim(), icon });
      toast.success('Category created');
      handleOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to create category');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>Create a category to organise your expenses.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormItem>
            <FormLabel htmlFor="category-name" required>
              Name
            </FormLabel>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              maxLength={40}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Icon</FormLabel>
            <div className="flex flex-wrap gap-2">
              {ICON_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setIcon(choice)}
                  aria-label={`Icon ${choice}`}
                  aria-pressed={icon === choice}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg border text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    icon === choice ? 'border-primary bg-primary/12' : 'border-border hover:bg-secondary',
                  )}
                >
                  {choice}
                </button>
              ))}
            </div>
            <FormHint>Pick an emoji to represent this category.</FormHint>
          </FormItem>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={create.isPending}>
            Create category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
