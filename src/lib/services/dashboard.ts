import api from '@/lib/api';

export interface DashboardSummary {
  totalBalance: number;
  monthlyExpenses: number;
  totalSavings: number;
  balanceTrend: string;
  expenseTrend: string;
  savingsTrend: string;
  totalBudget: number;
  totalBudgetSpent: number;
  budgetRemainingPct: number;
}

export interface DashboardCharts {
  spendingOverview: unknown;
  categoryDistribution: unknown;
  expenseTrend: unknown;
  budgetUsage?: unknown;
}

export interface RecentActivity {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'expense' | 'saving';
  icon: string;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get('/dashboard/summary');
  return res.data;
};

export const getDashboardCharts = async (): Promise<DashboardCharts> => {
  const res = await api.get('/dashboard/charts');
  return res.data;
};

export const getRecentActivity = async (): Promise<RecentActivity[]> => {
  const res = await api.get('/dashboard/recent-activity');
  return res.data;
};
