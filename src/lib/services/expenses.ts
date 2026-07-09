import api from '@/lib/api';

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  category: string;
  date: string;
  description: string;
}

export const getExpenses = async (month?: string): Promise<Expense[]> => {
  const url = month ? `/expenses?month=${month}` : '/expenses';
  const res = await api.get(url);
  return res.data;
};

export const createExpense = async (data: object): Promise<Expense> => {
  const res = await api.post('/expenses', data);
  return res.data;
};

export const updateExpense = async (id: string, data: object): Promise<Expense> => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};
