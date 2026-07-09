import type { ReactNode } from 'react';
import { PublicLayout } from '@/shared/layouts/public-layout';

/** Public (unauthenticated) routes: login, register. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
