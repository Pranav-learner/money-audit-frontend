import type { ReactNode } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/shared/utils/format';
import { toneTextClass, type BalanceDescriptor } from '@/shared/utils/balance';

/** Inline coloured balance label + amount ("You owe Rahul ₹1,200"). */
export function BalancePill({ descriptor, className }: { descriptor: BalanceDescriptor; className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 text-sm', className)}>
      <span className="text-muted-foreground">{descriptor.label}</span>
      <span className={cn('font-semibold', toneTextClass(descriptor.tone))}>
        {descriptor.tone === 'neutral' ? '✓' : formatCurrency(descriptor.amount)}
      </span>
    </span>
  );
}

/** Prominent net-balance summary card. */
export function BalanceCard({
  title,
  descriptor,
  action,
}: {
  title: string;
  descriptor: BalanceDescriptor;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className={cn('mt-1 text-2xl font-semibold', toneTextClass(descriptor.tone))}>
            {descriptor.tone === 'neutral' ? 'Settled up' : formatCurrency(descriptor.amount)}
          </p>
          <p className="text-xs text-muted-foreground">{descriptor.label}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
