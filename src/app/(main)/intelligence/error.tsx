'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/components/common/error-state';
import { reportError } from '@/shared/lib/logger';

/** Error boundary scoped to the Intelligence section. */
export default function IntelligenceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: 'intelligence', digest: error.digest });
  }, [error]);

  return (
    <ErrorState
      className="min-h-[50vh]"
      title="Couldn’t load intelligence"
      description="Something went wrong while loading your insights. Please try again."
      onRetry={reset}
    />
  );
}
