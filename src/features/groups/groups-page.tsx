'use client';

import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useDeleteGroup, useGroups, type Group } from '@/features/groups/api';
import { CreateGroupDialog } from '@/features/groups/components/create-group-dialog';
import { ErrorState } from '@/shared/components/common/error-state';
import { Fab } from '@/shared/components/common/fab';
import { PageHeader } from '@/shared/components/common/page-header';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { formatCurrency } from '@/shared/utils/format';

type SortKey = 'name' | 'spend' | 'members';

export function GroupsPage() {
  const groupsQuery = useGroups();
  const deleteGroup = useDeleteGroup();

  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = groups.filter((g) => g.name?.toLowerCase().includes(q));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'spend') return (b.totalExpenses ?? 0) - (a.totalExpenses ?? 0);
      if (sortBy === 'members') return (b.members?.length ?? 0) - (a.members?.length ?? 0);
      return a.name.localeCompare(b.name);
    });
  }, [groups, search, sortBy]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGroup.mutateAsync(deleteTarget.id);
      toast.success('Group deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete group');
    }
  };

  return (
    <div>
      <PageHeader
        title="Groups"
        description="Split expenses with multiple people."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            <span className="hidden sm:inline">New group</span>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups…" className="pl-9" aria-label="Search groups" />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger aria-label="Sort groups" className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="spend">Total spend</SelectItem>
            <SelectItem value="members">Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {groupsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : groupsQuery.isError ? (
        <ErrorState onRetry={() => groupsQuery.refetch()} />
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users2}
            title={groups.length === 0 ? 'No groups yet' : 'No matches'}
            description={groups.length === 0 ? 'Create a group to start splitting shared expenses.' : 'Try a different search.'}
            action={
              groups.length === 0 ? (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus />
                  New group
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/groups/${g.id}`} className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <Users2 className="size-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.members?.length ?? 0} members</p>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${g.name}`}
                      className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={() => setDeleteTarget(g)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Link href={`/groups/${g.id}`} className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total spend</span>
                    <span className="font-semibold text-foreground">{formatCurrency(g.totalExpenses ?? 0)}</span>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Fab label="New group" onClick={() => setCreateOpen(true)} />
      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This permanently deletes the group and its shared expenses."
        confirmLabel="Delete"
        destructive
        loading={deleteGroup.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
