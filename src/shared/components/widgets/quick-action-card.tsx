import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/** A compact action tile for the dashboard "Quick Actions" row. Reusable elsewhere. */
export function QuickActionCard({ icon: Icon, label, description, onClick, href, className }: QuickActionCardProps) {
  const classes = cn(
    'flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    className,
  );
  const inner = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}
