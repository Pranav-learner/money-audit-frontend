'use client';

import { Sparkles, Target } from 'lucide-react';
import { useGoalForecast, useGoalPlan } from '@/features/intelligence/api';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/shared/utils/format';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function GoalDetailDrawer({
  goalId,
  goalTitle,
  open,
  onOpenChange,
}: {
  goalId: string | null;
  goalTitle: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const planQuery = useGoalPlan(open && goalId ? goalId : '');
  const forecastQuery = useGoalForecast(open && goalId ? goalId : '');
  const plan = planQuery.data;
  const forecast = forecastQuery.data;
  const probability = Math.round((forecast?.successProbability ?? plan?.successProbability ?? 0) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{goalTitle}</SheetTitle>
          <SheetDescription>Your AI-generated plan to reach this goal.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {planQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Chance of success</span>
                  <Badge variant={plan?.feasible ? 'success' : 'warning'}>{plan?.feasible ? 'On track' : 'At risk'}</Badge>
                </div>
                <Progress value={probability} indicatorClassName={probability >= 60 ? 'bg-success' : probability >= 30 ? 'bg-warning' : 'bg-destructive'} />
                <p className="mt-1 text-right text-xs text-muted-foreground">{probability}%</p>
              </div>

              {plan?.summary && (
                <div className="flex items-start gap-2 rounded-lg bg-primary/8 p-3 text-sm text-foreground">
                  <Target className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {plan.summary}
                </div>
              )}

              <div>
                <Row label="Required monthly saving" value={formatCurrency(plan?.requiredMonthlySaving ?? 0)} />
                <Row label="Your current capacity" value={formatCurrency(plan?.currentMonthlyCapacity ?? 0)} />
                <Row label="Months remaining" value={String(plan?.monthsRemaining ?? '—')} />
                <Row label="Projected completion" value={plan?.projectedCompletionDate ? formatDate(plan.projectedCompletionDate) : '—'} />
                {plan?.alternativeTargetDate && <Row label="Realistic target" value={formatDate(plan.alternativeTargetDate)} />}
              </div>

              {(plan?.recommendedActions?.length ?? 0) > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                    AI planning suggestions
                  </p>
                  <ul className="space-y-2">
                    {plan!.recommendedActions.map((a, i) => (
                      <li key={i} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                        <span className="text-foreground">{a.label}</span>
                        <span className="font-medium text-success">{formatCurrency(a.monthlyAmount)}/mo</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(forecast?.recommendations?.length ?? 0) > 0 && (
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {forecast!.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
