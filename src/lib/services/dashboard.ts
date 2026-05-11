import api from '@/lib/api';

export interface DashboardSummary {
  totalBalance: number;
  monthlyExpenses: number;
  totalSavings: number;
  budgetUsedPct: number;
  trends: any;
}

export interface DashboardCharts {
  spendingOverview: any;
  categoryDistribution: any;
  expenseTrend: any;
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
