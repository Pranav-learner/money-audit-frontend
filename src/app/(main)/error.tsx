'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/components/common/error-state';
import { reportError } from '@/shared/lib/logger';

/** Segment error boundary — renders inside the app shell so navigation stays. */
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: '(main)', digest: error.digest });
  }, [error]);

  return (
    <ErrorState
      className="min-h-[60vh]"
      description="We couldn’t load this page. Please try again."
      onRetry={reset}
    />
  );
}
