import api from '@/lib/api';

export interface Budget {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: string;
}

export const getBudgets = async (month?: number, year?: number): Promise<Budget[]> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  const res = await api.get(`/budgets?${params.toString()}`);
  return res.data;
};

export const setBudget = async (categoryId: string, limit: number): Promise<void> => {
  const now = new Date();
  await api.post('/budgets', { 
    categoryId, 
    limitAmount: limit,
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });
};
