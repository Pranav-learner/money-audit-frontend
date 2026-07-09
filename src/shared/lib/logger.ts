/**
 * Production-safe logging seam.
 *
 * In development we surface errors/events to the console. In production these
 * are no-ops by default — wire an observability provider (Sentry, LogRocket, …)
 * into the marked hooks below to ship them. Keeping the calls behind this module
 * means feature code never talks to a vendor SDK directly.
 */

const isDev = process.env.NODE_ENV !== 'production';

/** Report a caught error, optionally with structured context. */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (isDev) {
    console.error('[error]', error, context ?? {});
    return;
  }
  // Production seam: forward to your error tracker here, e.g.
  //   if (typeof window !== 'undefined') Sentry.captureException(error, { extra: context });
}

/** Log a named, non-error analytics/telemetry event. */
export function logEvent(name: string, data?: Record<string, unknown>): void {
  if (isDev) {
    console.log('[event]', name, data ?? {});
    return;
  }
  // Production seam: forward to your analytics provider here, e.g.
  //   if (typeof window !== 'undefined') analytics.track(name, data);
}

export const logger = { reportError, logEvent } as const;
export type Logger = typeof logger;
