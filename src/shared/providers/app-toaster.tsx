'use client';

import { Toaster } from 'react-hot-toast';

/**
 * App-wide toast surface, themed to the design tokens (works in light and dark).
 * Reuses the existing react-hot-toast dependency; import `toast` from
 * `@/shared/components/ui/toast` to raise notifications from anywhere.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          fontSize: '0.875rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        },
        success: { iconTheme: { primary: 'var(--primary)', secondary: 'var(--primary-foreground)' } },
        error: { iconTheme: { primary: 'var(--destructive)', secondary: 'var(--destructive-foreground)' } },
      }}
    />
  );
}
