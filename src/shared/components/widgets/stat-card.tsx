import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/cn';

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Optional secondary line under the value. */
  hint?: string;
  /** Optional trend chip (e.g. +12% vs last month). Positive = good/green. */
  trend?: { label: string; positive?: boolean };
  loading?: boolean;
  className?: string;
}

/** Reusable summary/stat card — the primary dashboard metric widget. */
export function StatCard({ label, value, icon: Icon, hint, trend, loading, className }: StatCardProps) {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <p className="truncate text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          )}
          {trend && !loading && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                trend.positive ? 'text-success' : 'text-destructive',
              )}
            >
              {trend.positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {trend.label}
            </span>
          )}
          {hint && !trend && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}
