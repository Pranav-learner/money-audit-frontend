'use client';

import { AlertTriangle, RefreshCw, RotateCw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { reportError } from '@/shared/lib/logger';

/**
 * Catastrophic error boundary. Replaces the root layout entirely, so it must
 * render its own `<html>`/`<body>`. Kept minimal and self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: 'global-error', digest: error.digest });
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
            <AlertTriangle className="size-7" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              A critical error stopped the app from loading. Try again, or reload the page.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>
              <RefreshCw />
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCw />
              Reload
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
