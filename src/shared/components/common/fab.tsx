'use client';

import { Plus, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface FabProps {
  onClick: () => void;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

/** Mobile floating action button (hidden on desktop, where a header button is used). */
export function Fab({ onClick, label, icon: Icon = Plus, className }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'fixed bottom-20 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden',
        className,
      )}
    >
      <Icon className="size-6" aria-hidden />
    </button>
  );
}
