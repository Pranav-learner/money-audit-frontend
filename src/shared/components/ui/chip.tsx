'use client';

import { X } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Show a remove (×) button and call this when clicked. */
  onRemove?: () => void;
  /** Render in a selected/active state. */
  active?: boolean;
}

/**
 * A compact, optionally-removable token — used for filters, tags and selections.
 * Distinct from Badge: interactive and dismissible.
 */
function Chip({ className, children, onRemove, active = false, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border bg-secondary text-secondary-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="-mr-1 rounded-full p-0.5 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  );
}

export { Chip };
