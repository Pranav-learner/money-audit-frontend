import type { ReactNode } from 'react';
import { IntelligenceNav } from '@/features/intelligence/components/intelligence-nav';

export default function IntelligenceLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <IntelligenceNav />
      {children}
    </div>
  );
}
