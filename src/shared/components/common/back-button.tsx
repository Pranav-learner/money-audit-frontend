'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';

/** Navigates to the previous history entry. For error/404 secondary actions. */
export function BackButton({ label = 'Go back' }: { label?: string }) {
  const router = useRouter();
  return (
    <Button variant="ghost" onClick={() => router.back()}>
      <ArrowLeft />
      {label}
    </Button>
  );
}
