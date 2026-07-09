import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

/** App wordmark + logo. Links home. Collapses to just the mark in the mini sidebar. */
export function Brand({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <Link
      href="/dashboard"
      aria-label="Money Audit — home"
      className={cn('flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Wallet className="size-5" aria-hidden />
      </span>
      {!collapsed && <span className="text-base font-semibold tracking-tight text-foreground">Money Audit</span>}
    </Link>
  );
}
