'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/shared/components/ui/skeleton';

const fallback = () => <Skeleton className="size-full" />;

/** Lazily-loaded chart components — keeps recharts out of the initial analytics bundle. */
export const LazyBarChart = dynamic(
  () => import('@/shared/components/charts/charts').then((m) => ({ default: m.MoneyBarChart })),
  { ssr: false, loading: fallback },
);
export const LazyAreaChart = dynamic(
  () => import('@/shared/components/charts/charts').then((m) => ({ default: m.MoneyAreaChart })),
  { ssr: false, loading: fallback },
);
export const LazyPieChart = dynamic(
  () => import('@/shared/components/charts/charts').then((m) => ({ default: m.CategoryPieChart })),
  { ssr: false, loading: fallback },
);
