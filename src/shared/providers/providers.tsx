'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { AppToaster } from './app-toaster';
import { MotionProvider } from './motion-provider';
import { PreferencesProvider } from './preferences-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { UiStateProvider } from './ui-state-provider';

/**
 * Single composition root for every app-wide provider, in dependency order:
 * theme → server-state (Query) → auth → preferences → ephemeral UI state →
 * motion → tooltips, plus the toast surface. Rendered once in the root layout
 * so features never wire providers themselves.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>
          <PreferencesProvider>
            <UiStateProvider>
              <MotionProvider>
                <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
                <AppToaster />
              </MotionProvider>
            </UiStateProvider>
          </PreferencesProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
