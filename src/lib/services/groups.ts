import api from '@/lib/api';

export interface Group {
  id: string;
  name: string;
  members: string[];
  totalExpenses: number;
  createdAt: string;
}

export const getGroups = async (): Promise<Group[]> => {
  const res = await api.get('/groups');
  return res.data;
};

export const createGroup = async (name: string): Promise<Group> => {
  const res = await api.post('/groups', { name });
  return res.data;
};

export const getGroupById = async (id: string): Promise<Group> => {
  const res = await api.get(`/groups/${id}`);
  return res.data;
};

export const getGroupExpenses = async (id: string): Promise<any[]> => {
  const res = await api.get(`/expenses/group/${id}`);
  return res.data;
};

export const getGroupBalances = async (id: string): Promise<any[]> => {
  const res = await api.get(`/groups/${id}/balances`); // Check if this exists
  return res.data;
};

export const addGroupMember = async (groupId: string, userId: string): Promise<void> => {
  await api.post(`/groups/${groupId}/members`, { userId });
};

export const createGroupExpense = async (groupId: string, data: any): Promise<void> => {
  await api.post(`/expenses/group/${groupId}`, data);
};
export const deleteGroup = async (id: string): Promise<void> => {
  await api.delete(`/groups/${id}`);
};
