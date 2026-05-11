import api from '@/lib/api';

export interface DirectExpense {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  date: string;
}

export const getDirectExpenses = async (friendId: string): Promise<DirectExpense[]> => {
  const res = await api.get(`/direct-splits/${friendId}`);
  return res.data;
};

export const createDirectExpense = async (friendId: string, amount: number, description: string): Promise<void> => {
  await api.post(`/direct-splits`, { friendId, amount, description });
};

export const getNetBalance = async (friendId: string): Promise<number> => {
  const res = await api.get(`/direct-splits/${friendId}/balance`);
  return res.data;
};
