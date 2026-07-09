import { RefreshCw, ServerCrash } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

/**
 * Full-panel state for a failed network/server request. Complements the more
 * generic `ErrorState` with copy specific to connectivity failures.
 */
export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <div
      role="alert"
      className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center', className)}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
        <ServerCrash className="size-7" aria-hidden />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-foreground">Can’t reach the server</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn’t complete this request. Check your connection and try again in a moment.
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw />
          Retry
        </Button>
      )}
    </div>
  );
}
