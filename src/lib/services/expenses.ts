import api from '@/lib/api';

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  category: string;
  date: string;
  description: string;
}

function normalizeExpense(raw: any): Expense {
  if (!raw) return raw;
  return {
    id: raw.id,
    amount: Number(raw.amount ?? 0),
    categoryId: raw.categoryId ?? raw.category?.id ?? '',
    category: raw.category ?? raw.categoryName ?? '',
    date: raw.date ?? raw.expenseDate ?? '',
    description: raw.description ?? raw.title ?? 'Expense',
  };
}

export const getExpenses = async (month?: string): Promise<Expense[]> => {
  const url = month ? `/expenses?month=${month}` : '/expenses';
  const res = await api.get(url);
  const data = res.data;
  if (Array.isArray(data)) {
    return data.map(normalizeExpense);
  }
  return [];
};

export const createExpense = async (data: object): Promise<Expense> => {
  const res = await api.post('/expenses', data);
  return normalizeExpense(res.data);
};

export const updateExpense = async (id: string, data: object): Promise<Expense> => {
  const res = await api.put(`/expenses/${id}`, data);
  return normalizeExpense(res.data);
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};
