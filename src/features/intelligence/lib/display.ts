import type { BadgeProps } from '@/shared/components/ui/badge';
import type { HealthBand } from '@/lib/services/health-score';
import type { Priority } from '@/lib/services/recommendations';
import type { Severity } from '@/lib/services/insights';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export function severityMeta(severity: Severity): { label: string; variant: BadgeVariant; dot: string } {
  switch (severity) {
    case 'HIGH':
      return { label: 'High', variant: 'destructive', dot: 'bg-destructive' };
    case 'MEDIUM':
      return { label: 'Medium', variant: 'warning', dot: 'bg-warning' };
    default:
      return { label: 'Low', variant: 'info', dot: 'bg-accent' };
  }
}

export function priorityMeta(priority: Priority): { label: string; variant: BadgeVariant } {
  switch (priority) {
    case 'CRITICAL':
      return { label: 'Critical', variant: 'destructive' };
    case 'HIGH':
      return { label: 'High', variant: 'warning' };
    case 'MEDIUM':
      return { label: 'Medium', variant: 'info' };
    default:
      return { label: 'Low', variant: 'secondary' };
  }
}

export function bandMeta(band: HealthBand): { label: string; color: string; variant: BadgeVariant } {
  switch (band) {
    case 'EXCELLENT':
      return { label: 'Excellent', color: '#22c55e', variant: 'success' };
    case 'GOOD':
      return { label: 'Good', color: '#2dd4a8', variant: 'success' };
    case 'FAIR':
      return { label: 'Fair', color: '#f59e0b', variant: 'warning' };
    case 'NEEDS_ATTENTION':
      return { label: 'Needs attention', color: '#f97316', variant: 'warning' };
    default:
      return { label: 'Critical', color: '#ef4444', variant: 'destructive' };
  }
}

/** Turn an ENUM_LIKE_NAME into "Enum like name". */
export function humanizeEnum(value?: string | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function confidenceLabel(confidence: number): string {
  const pct = Math.round((confidence <= 1 ? confidence * 100 : confidence));
  return `${pct}% confidence`;
}
