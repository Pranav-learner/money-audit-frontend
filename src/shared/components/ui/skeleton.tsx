import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

/** Shimmering placeholder used while content loads. */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
