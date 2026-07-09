'use client';

import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useSendFriendRequest, useUserSearch } from '@/features/friends/api';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Spinner } from '@/shared/components/ui/spinner';
import { toast } from '@/shared/components/ui/toast';
import { initialsOf } from '@/shared/utils/initials';
import type { ApiError } from '@/lib/api';

interface SearchResult {
  id?: string;
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export function AddFriendDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [query, setQuery] = useState('');
  const search = useUserSearch(query, open);
  const send = useSendFriendRequest();

  const results = (search.data ?? []) as SearchResult[];

  const sendTo = async (identifier: string) => {
    if (!identifier) return;
    try {
      await send.mutateAsync(identifier);
      toast.success('Friend request sent');
      onOpenChange(false);
      setQuery('');
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Could not send request');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a friend</DialogTitle>
          <DialogDescription>Search by name, phone or email, then send a request.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, phone or email…"
            className="pl-9"
            aria-label="Search users"
            autoFocus
          />
        </div>

        <div className="min-h-24">
          {query.trim().length < 2 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Type at least 2 characters to search.</p>
          ) : search.isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((r, i) => (
                <li key={r.userId ?? r.id ?? i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary">
                  <Avatar className="size-9">
                    <AvatarFallback>{initialsOf(r.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r.name ?? 'Unknown'}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.phone || r.email}</p>
                  </div>
                  <Button size="sm" variant="outline" loading={send.isPending} onClick={() => sendTo(r.phone || r.email || '')}>
                    <UserPlus />
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">No users found.</p>
              <Button variant="link" onClick={() => sendTo(query.trim())} loading={send.isPending}>
                Send request to “{query.trim()}”
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
