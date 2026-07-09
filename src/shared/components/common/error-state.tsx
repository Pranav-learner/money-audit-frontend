'use client';

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Inline error surface for a failed data fetch, with an optional retry. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this section. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      className={className}
      icon={AlertTriangle}
      title={title}
      description={description}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw />
            Try again
          </Button>
        )
      }
    />
  );
}

/** Offline indicator for when the network is unavailable. */
export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="You’re offline"
      description="Check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

/** Icon kept exported for consumers that want the offline glyph directly. */
export { WifiOff };
