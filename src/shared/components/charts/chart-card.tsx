import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

export interface ChartCardProps {
  title: string;
  description?: string;
  /** Right-aligned header content (filters, legend, actions). */
  action?: ReactNode;
  loading?: boolean;
  /** Show the empty state instead of the chart. */
  isEmpty?: boolean;
  emptyMessage?: string;
  /** Chart height in px. */
  height?: number;
  children: ReactNode;
}

/** Card shell for a chart, with built-in loading skeleton and empty state. */
export function ChartCard({
  title,
  description,
  action,
  loading,
  isEmpty,
  emptyMessage = 'No data to display yet.',
  height = 280,
  children,
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton style={{ height }} className="w-full" />
        ) : isEmpty ? (
          <div style={{ minHeight: height }} className="flex items-center justify-center">
            <EmptyState icon={BarChart3} title="Nothing to chart" description={emptyMessage} />
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
