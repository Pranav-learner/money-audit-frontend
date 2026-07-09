'use client';

import { useState } from 'react';
import { useAddGroupMember } from '@/features/groups/api';
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
import type { ApiError } from '@/lib/api';

export function AddMemberDialog({
  open,
  onOpenChange,
  groupId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  groupId: string;
}) {
  const addMember = useAddGroupMember(groupId);
  const [identifier, setIdentifier] = useState('');

  const submit = async () => {
    if (!identifier.trim()) {
      toast.error('Enter a phone or email');
      return;
    }
    try {
      await addMember.mutateAsync(identifier.trim());
      toast.success('Member added');
      setIdentifier('');
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to add member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Add someone to this group by phone or email.</DialogDescription>
        </DialogHeader>
        <FormItem>
          <FormLabel required>Phone or email</FormLabel>
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="phone or email" autoFocus />
          <FormHint>They must be a registered Money Audit user.</FormHint>
        </FormItem>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={addMember.isPending}>
            Add member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
