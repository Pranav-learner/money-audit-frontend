'use client';

import { motion } from 'framer-motion';
import { Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteGoal, useGoals } from '@/features/intelligence/api';
import { GoalDetailDrawer } from '@/features/intelligence/components/goal-detail-drawer';
import { GoalFormDialog } from '@/features/intelligence/components/goal-form-dialog';
import { humanizeEnum } from '@/features/intelligence/lib/display';
import type { Goal } from '@/lib/services/goals';
import { ErrorState } from '@/shared/components/common/error-state';
import { Fab } from '@/shared/components/common/fab';
import { PageHeader } from '@/shared/components/common/page-header';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { formatCurrency, formatDate } from '@/shared/utils/format';

export function GoalsPage() {
  const goalsQuery = useGoals();
  const deleteGoal = useDeleteGoal();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [selected, setSelected] = useState<Goal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const goals = goalsQuery.data ?? [];

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openDetail = (goal: Goal) => {
    setSelected(goal);
    setDetailOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGoal.mutateAsync(deleteTarget.id);
      toast.success('Goal deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div>
      <PageHeader
        title="Goals"
        description="Plan and track your financial goals with AI guidance."
        actions={
          <Button onClick={openAdd}>
            <Plus />
            <span className="hidden sm:inline">New goal</span>
          </Button>
        }
      />

      {goalsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : goalsQuery.isError ? (
        <ErrorState onRetry={() => goalsQuery.refetch()} />
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Create a goal — like a vacation or emergency fund — and get a personalized plan."
            action={
              <Button onClick={openAdd}>
                <Plus />
                New goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="group h-full">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => openDetail(goal)} className="text-left">
                      <p className="font-medium text-foreground">{goal.title}</p>
                      <Badge variant="secondary" className="mt-1">
                        {humanizeEnum(goal.goalType)}
                      </Badge>
                    </button>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" aria-label="Edit goal" className="size-8" onClick={() => { setEditing(goal); setFormOpen(true); }}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete goal" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(goal)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <button type="button" onClick={() => openDetail(goal)} className="mt-auto space-y-2 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-muted-foreground">of {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <Progress value={goal.progressPercent} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{goal.progressPercent}% funded</span>
                      {goal.monthlyContributionRequired != null && <span>{formatCurrency(goal.monthlyContributionRequired)}/mo</span>}
                    </div>
                    {goal.projectedCompletionDate && (
                      <p className="text-xs text-muted-foreground">Projected: {formatDate(goal.projectedCompletionDate)}</p>
                    )}
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Fab label="New goal" onClick={openAdd} />
      <GoalFormDialog open={formOpen} onOpenChange={setFormOpen} goal={editing} />
      <GoalDetailDrawer goalId={selected?.id ?? null} goalTitle={selected?.title ?? 'Goal'} open={detailOpen} onOpenChange={setDetailOpen} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This permanently removes the goal and its plan."
        confirmLabel="Delete"
        destructive
        loading={deleteGoal.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
