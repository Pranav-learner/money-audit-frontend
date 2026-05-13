import api from '@/lib/api';

export interface DirectTransaction {
  id: string;
  description: string;
  amount: number;
  totalAmount?: number;
  splitType?: 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';
  myShare?: number;
  otherShare?: number;
  paidByUserId: string;
  date: string;
  type: 'EXPENSE' | 'PAYMENT';
  friendName?: string;
  friendId?: string;
}

export interface CreateDirectExpenseRequest {
  friendId: string;
  title: string;
  totalAmount: number;
  expenseDate: string;
  splitType: 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';
  paidByUserId: string;
  myShare?: number;
  otherShare?: number;
}

export const getDirectExpenses = async (friendId: string): Promise<DirectTransaction[]> => {
  const res = await api.get(`/direct/${friendId}`);
  return res.data;
};

export const getAllDirectExpenses = async (): Promise<DirectTransaction[]> => {
  const res = await api.get(`/direct/all`);
  return res.data;
};

export const createDirectExpense = async (data: CreateDirectExpenseRequest): Promise<void> => {
  await api.post(`/direct`, data);
};

export const createDirectPayment = async (friendId: string, amount: number, note: string): Promise<void> => {
  await api.post(`/direct/settle`, { toUserId: friendId, amount, note });
};

export const getNetBalance = async (friendId: string): Promise<number> => {
  const res = await api.get(`/direct/${friendId}/balance`);
  return res.data;
};
