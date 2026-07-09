import type { ReactNode } from 'react';
import { ProtectedLayout } from '@/shared/layouts/protected-layout';

/** All routes in the (main) group are authenticated and rendered inside the app shell. */
export default function MainLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
