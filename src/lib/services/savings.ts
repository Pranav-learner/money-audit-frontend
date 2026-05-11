import api from '@/lib/api';

export interface Saving {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export const getSavings = async (): Promise<Saving[]> => {
  const res = await api.get('/savings');
  return res.data;
};

export const createSaving = async (data: any): Promise<Saving> => {
  const res = await api.post('/savings', data);
  return res.data;
};

export const updateSaving = async (id: string, data: any): Promise<Saving> => {
  const res = await api.put(`/savings/${id}`, data);
  return res.data;
};

export const deleteSaving = async (id: string): Promise<void> => {
  await api.delete(`/savings/${id}`);
};
