'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/shared/components/common/page-loader';
import { AppShell } from './app-shell';

/**
 * Guards every authenticated route: restores the session, redirects unauthenticated
 * users to /login, and renders the app shell around the page once authorized.
 */
export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  if (isLoading) return <PageLoader label="Restoring your session" />;
  if (!token) return null;

  return <AppShell>{children}</AppShell>;
}
