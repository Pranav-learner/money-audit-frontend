'use client';

import { Check, Search, UserPlus, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useFriendRequests, useFriends, useRespondToRequest } from '@/features/friends/api';
import { AddFriendDialog } from '@/features/friends/components/add-friend-dialog';
import { ErrorState } from '@/shared/components/common/error-state';
import { Fab } from '@/shared/components/common/fab';
import { PageHeader } from '@/shared/components/common/page-header';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from '@/shared/components/ui/toast';
import { initialsOf } from '@/shared/utils/initials';

export function FriendsPage() {
  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const respond = useRespondToRequest();

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');

  const friends = useMemo(() => friendsQuery.data ?? [], [friendsQuery.data]);
  const requests = requestsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(
      (f) => f.name?.toLowerCase().includes(q) || f.phone?.includes(q) || f.email?.toLowerCase().includes(q),
    );
  }, [friends, search]);

  const handleRespond = async (id: string, action: 'accept' | 'reject') => {
    try {
      await respond.mutateAsync({ id, action });
      toast.success(action === 'accept' ? 'Friend added' : 'Request declined');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div>
      <PageHeader
        title="Friends"
        description="Manage friends and split expenses one-on-one."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus />
            <span className="hidden sm:inline">Add friend</span>
          </Button>
        }
      />

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {requests.length > 0 && <Badge className="ml-2">{requests.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search friends…" className="pl-9" aria-label="Search friends" />
          </div>

          {friendsQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : friendsQuery.isError ? (
            <ErrorState onRetry={() => friendsQuery.refetch()} />
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title={friends.length === 0 ? 'No friends yet' : 'No matches'}
                description={friends.length === 0 ? 'Add a friend to start splitting expenses.' : 'Try a different search.'}
                action={
                  friends.length === 0 ? (
                    <Button onClick={() => setAddOpen(true)}>
                      <UserPlus />
                      Add friend
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((f) => (
                <Link key={f.friendshipId} href={`/friends/${f.userId}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Avatar className="size-11">
                        <AvatarFallback>{initialsOf(f.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{f.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{f.phone || f.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requestsQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : requests.length === 0 ? (
            <Card>
              <EmptyState icon={UserPlus} title="No pending requests" description="Friend requests will appear here." />
            </Card>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <Card key={r.friendshipId}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar className="size-11">
                      <AvatarFallback>{initialsOf(r.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{r.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.phone || r.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleRespond(r.friendshipId, 'accept')} disabled={respond.isPending}>
                        <Check />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRespond(r.friendshipId, 'reject')} disabled={respond.isPending}>
                        <X />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Fab label="Add friend" onClick={() => setAddOpen(true)} icon={UserPlus} />
      <AddFriendDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
