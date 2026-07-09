import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export interface InsightCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  loading?: boolean;
}

/** A small "insight" widget: an icon, a headline value and a supporting label. Reusable. */
export function InsightCard({ icon: Icon, label, value, hint, loading }: InsightCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-24" />
          ) : (
            <p className="truncate text-lg font-semibold text-foreground">{value}</p>
          )}
          {hint && !loading && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
