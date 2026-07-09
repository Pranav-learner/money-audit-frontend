'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoader } from '@/shared/components/common/page-loader';
import { DEFAULT_PREFERENCES } from '@/shared/lib/preferences';

/** Entry point: send the user to their preferred landing page (defaults to the dashboard). */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let landing = DEFAULT_PREFERENCES.defaultLanding;
    try {
      const raw = localStorage.getItem('ma.preferences.v1');
      if (raw) {
        const parsed = JSON.parse(raw) as { defaultLanding?: string };
        if (parsed.defaultLanding) landing = parsed.defaultLanding;
      }
    } catch {
      /* fall back to default */
    }
    router.replace(landing);
  }, [router]);

  return <PageLoader />;
}
