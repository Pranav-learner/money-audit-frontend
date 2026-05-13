import api from '@/lib/api';

export interface Group {
  id: string;
  name: string;
  members: string[];
  totalExpenses: number;
  createdAt: string;
}

export interface GroupExpense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string;
  splitType: string;
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

export const getGroupExpenses = async (id: string): Promise<GroupExpense[]> => {
  const res = await api.get(`/groups/${id}/expenses`);
  return res.data;
};

export const getGroupBalances = async (id: string): Promise<any[]> => {
  const res = await api.get(`/groups/${id}/balances`);
  return res.data;
};

export const addGroupMember = async (groupId: string, userId: string): Promise<void> => {
  await api.post(`/groups/${groupId}/members`, { userId });
};

export const createGroupExpense = async (groupId: string, data: any): Promise<void> => {
  const payload = {
    title: data.title,
    totalAmount: data.amount,
    expenseDate: new Date().toISOString().split('T')[0],
    splitType: 'EQUAL'
  };
  await api.post(`/groups/${groupId}/expenses`, payload);
};

export const deleteGroup = async (id: string): Promise<void> => {
  await api.delete(`/groups/${id}`);
};
