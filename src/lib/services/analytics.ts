import api from '@/lib/api';

/**
 * Typed client for the backend Analytics API (`/api/analytics/*`). All aggregation happens on the
 * backend — the frontend only fetches and visualises. Never re-computes analytics locally.
 */

export interface TotalSavings {
  totalSavings: number;
}
export interface MonthlySavings {
  month: number;
  year: number;
  totalSaved: number;
}
export interface TrendItem {
  month: number;
  amount: number;
}
export interface BudgetUsage {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: string;
}
export interface FinancialSummary {
  totalIncomeSaved: number;
  totalSpent: number;
  netSavings: number;
  topCategory: string;
}
export interface CategoryDatum {
  name: string;
  value: number;
  color?: string;
}
export interface ExpenseTypeBreakdown {
  direct: number;
  group: number;
}
export interface BalanceOverview {
  youOwe: number;
  youAreOwed: number;
  netBalance: number;
}

export const getTotalSavings = async (): Promise<TotalSavings> => {
  const res = await api.get('/api/analytics/savings/total');
  return res.data;
};

export const getMonthlySavings = async (month: number, year: number): Promise<MonthlySavings> => {
  const res = await api.get('/api/analytics/savings/monthly', { params: { month, year } });
  return res.data;
};

export const getSavingsTrend = async (year: number): Promise<TrendItem[]> => {
  const res = await api.get('/api/analytics/savings/trend', { params: { year } });
  return res.data;
};

export const getBudgetUsage = async (month: number, year: number): Promise<BudgetUsage[]> => {
  const res = await api.get('/api/analytics/budget/usage', { params: { month, year } });
  return res.data;
};

export const getMonthlySummary = async (month: number, year: number): Promise<FinancialSummary> => {
  const res = await api.get('/api/analytics/monthly-summary', { params: { month, year } });
  return res.data;
};

export const getCategoryDistribution = async (
  month: number,
  year: number,
  period: 'MONTH' | 'WEEK' = 'MONTH',
): Promise<CategoryDatum[]> => {
  const res = await api.get('/api/analytics/category-distribution', { params: { month, year, period } });
  return res.data;
};

export const getSpendingTrend = async (year: number): Promise<TrendItem[]> => {
  const res = await api.get('/api/analytics/spending-trend', { params: { year } });
  return res.data;
};

export const getExpenseTypeBreakdown = async (month: number, year: number): Promise<ExpenseTypeBreakdown> => {
  const res = await api.get('/api/analytics/expense-type-breakdown', { params: { month, year } });
  return res.data;
};

export const getBalanceOverview = async (): Promise<BalanceOverview> => {
  const res = await api.get('/api/analytics/balance-overview');
  return res.data;
};
