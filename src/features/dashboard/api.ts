'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDashboardCharts,
  getDashboardSummary,
  getRecentActivity,
} from '@/lib/services/dashboard';
import { queryKeys } from '@/shared/lib/query-keys';

export function useDashboardSummary() {
  return useQuery({ queryKey: queryKeys.dashboard.summary(), queryFn: getDashboardSummary });
}

export function useDashboardCharts() {
  return useQuery({ queryKey: queryKeys.dashboard.charts(), queryFn: getDashboardCharts });
}

export function useRecentActivity() {
  return useQuery({ queryKey: queryKeys.dashboard.recent(), queryFn: getRecentActivity });
}
