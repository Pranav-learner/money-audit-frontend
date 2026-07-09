'use client';

import { useState } from 'react';
import { useCreateGroup } from '@/features/groups/api';
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
import type { ApiError } from '@/lib/api';

export function CreateGroupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateGroup();
  const [name, setName] = useState('');

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Enter a group name');
      return;
    }
    try {
      await create.mutateAsync(name.trim());
      toast.success('Group created');
      setName('');
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to create group');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>Create a group to share expenses with multiple people.</DialogDescription>
        </DialogHeader>
        <FormItem>
          <FormLabel htmlFor="group-name" required>
            Group name
          </FormLabel>
          <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goa Trip" autoFocus />
        </FormItem>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            Create group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
