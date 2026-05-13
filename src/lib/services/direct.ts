import api from '@/lib/api';

export interface DirectTransaction {
  id: string;
  description: string;
  amount: number;
  paidByUserId: string;
  date: string;
  type: 'EXPENSE' | 'PAYMENT';
}

export const getDirectExpenses = async (friendId: string): Promise<DirectTransaction[]> => {
  const res = await api.get(`/direct/${friendId}`);
  return res.data;
};

export const createDirectExpense = async (friendId: string, amount: number, description: string): Promise<void> => {
  const payload = {
    friendId,
    title: description,
    totalAmount: amount,
    expenseDate: new Date().toISOString().split('T')[0],
    splitType: 'EQUAL'
  };
  await api.post(`/direct`, payload);
};

export const createDirectPayment = async (friendId: string, amount: number, note: string): Promise<void> => {
  await api.post(`/direct/settle`, { toUserId: friendId, amount, note });
};

export const getNetBalance = async (friendId: string): Promise<number> => {
  const res = await api.get(`/direct/${friendId}/balance`);
  return res.data;
};
