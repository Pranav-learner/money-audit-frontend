import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories');
  return res.data;
};
export const createCategory = async (name: string, icon: string): Promise<Category> => {
  const res = await api.post('/categories', { name, icon });
  return res.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
