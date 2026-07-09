'use client';

import { Check, GitPullRequestArrow, X } from 'lucide-react';
import { usePendingEditRequests, useRespondToEditRequest } from '@/features/edit-requests/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { formatCurrency } from '@/shared/utils/format';

/**
 * Collaborative approval workflow for expense edit-requests. Reusable anywhere approvals should
 * surface (group details, a dedicated inbox). Hides itself when there's nothing to approve.
 */
export function EditRequestsPanel({ compact = false }: { compact?: boolean }) {
  const query = usePendingEditRequests();
  const respond = useRespondToEditRequest();

  const requests = query.data ?? [];

  const act = async (id: string, action: 'approve' | 'reject') => {
    try {
      await respond.mutateAsync({ id, action });
      toast.success(action === 'approve' ? 'Change approved' : 'Change rejected');
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (!query.isLoading && requests.length === 0) {
    if (compact) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-2 text-sm text-muted-foreground">No pending edit requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <GitPullRequestArrow className="size-4 text-primary" aria-hidden />
        <CardTitle className="text-base">Pending approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {r.expenseTitle ?? 'Expense change'}
                    {r.newAmount != null && <span className="text-muted-foreground"> → {formatCurrency(r.newAmount)}</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.requestedByName ? `Requested by ${r.requestedByName}` : 'Edit requested'}
                    {r.note ? ` • ${r.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" onClick={() => act(r.id, 'approve')} disabled={respond.isPending}>
                    <Check />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(r.id, 'reject')} disabled={respond.isPending}>
                    <X />
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
