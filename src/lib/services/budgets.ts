import api from '@/lib/api';

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  month: number;
  year: number;
}

export const getBudgets = async (month?: number, year?: number): Promise<Budget[]> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  const res = await api.get(`/budgets?${params.toString()}`);
  return res.data;
};

export const setBudget = async (categoryId: string, limit: number): Promise<void> => {
  await api.post('/budgets', { categoryId, limitAmount: limit });
};
