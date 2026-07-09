'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getBalanceOverview,
  getBudgetUsage,
  getCategoryDistribution,
  getExpenseTypeBreakdown,
  getMonthlySavings,
  getMonthlySummary,
  getSavingsTrend,
  getSpendingTrend,
  getTotalSavings,
} from '@/lib/services/analytics';

const key = (...parts: (string | number)[]) => ['analytics', ...parts] as const;
const STALE = 2 * 60_000;

export function useTotalSavings() {
  return useQuery({ queryKey: key('savings-total'), queryFn: getTotalSavings, staleTime: STALE });
}

export function useSavingsTrend(year: number) {
  return useQuery({ queryKey: key('savings-trend', year), queryFn: () => getSavingsTrend(year), staleTime: STALE });
}

export function useMonthlySavings(month: number, year: number) {
  return useQuery({ queryKey: key('savings-monthly', month, year), queryFn: () => getMonthlySavings(month, year), staleTime: STALE });
}

export function useSpendingTrend(year: number) {
  return useQuery({ queryKey: key('spending-trend', year), queryFn: () => getSpendingTrend(year), staleTime: STALE });
}

export function useBudgetUsage(month: number, year: number) {
  return useQuery({ queryKey: key('budget-usage', month, year), queryFn: () => getBudgetUsage(month, year), staleTime: STALE });
}

export function useMonthlySummary(month: number, year: number) {
  return useQuery({ queryKey: key('monthly-summary', month, year), queryFn: () => getMonthlySummary(month, year), staleTime: STALE });
}

export function useCategoryDistribution(month: number, year: number, period: 'MONTH' | 'WEEK' = 'MONTH') {
  return useQuery({
    queryKey: key('category-distribution', month, year, period),
    queryFn: () => getCategoryDistribution(month, year, period),
    staleTime: STALE,
  });
}

export function useExpenseTypeBreakdown(month: number, year: number) {
  return useQuery({ queryKey: key('expense-type', month, year), queryFn: () => getExpenseTypeBreakdown(month, year), staleTime: STALE });
}

export function useBalanceOverview() {
  return useQuery({ queryKey: key('balance-overview'), queryFn: getBalanceOverview, staleTime: STALE });
}
