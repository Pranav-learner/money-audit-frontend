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
  paidById: string;
  date: string;
  splitType: string;
  receiptUrl?: string;
  splits: {
    userId: string;
    userName: string;
    amountOwed: number;
  }[];
}

export interface GroupInvitation {
  id: string;
  groupId?: string;
  groupName: string;
  invitedBy: string;
  date: string;
}

export interface GroupExpensePayload {
  title: string;
  amount: number;
  splitType?: 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';
  paidById: string;
  splits: { userId: string; amountOwed: number }[];
  receiptUrl?: string;
}

export const getGroups = async (): Promise<Group[]> => {
  const res = await api.get('/groups');
  return (res.data as Group[]).map((g) => ({
    ...g,
    members: g.members || [],
  }));
};

export const createGroup = async (name: string): Promise<Group> => {
  const res = await api.post('/groups', { name });
  return {
    ...res.data,
    members: res.data.members || []
  };
};

export const getGroupById = async (id: string): Promise<Group> => {
  const res = await api.get(`/groups/${id}`);
  return {
    ...res.data,
    members: res.data.members || []
  };
};

export const getGroupExpenses = async (id: string): Promise<GroupExpense[]> => {
  const res = await api.get(`/api/groups/${id}/expenses`);
  return res.data;
};

export const getGroupBalances = async (id: string): Promise<unknown[]> => {
  const res = await api.get(`/api/groups/${id}/balances`);
  return res.data;
};

export const addGroupMember = async (groupId: string, userId?: string, identifier?: string): Promise<void> => {
  await api.post(`/groups/${groupId}/members`, { userId, identifier });
};

export const inviteGroupMember = async (groupId: string, userId?: string, identifier?: string): Promise<void> => {
  await addGroupMember(groupId, userId, identifier);
};

export const getGroupInvitations = async (): Promise<GroupInvitation[]> => {
  const res = await api.get('/groups/invitations');
  return res.data;
};

export const acceptGroupInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`/groups/invitations/${invitationId}/accept`);
};

export const rejectGroupInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`/groups/invitations/${invitationId}/reject`);
};

export const createGroupExpense = async (groupId: string, data: GroupExpensePayload): Promise<void> => {
  const payload = {
    title: data.title,
    totalAmount: data.amount,
    expenseDate: new Date().toISOString().split('T')[0],
    splitType: data.splitType || 'EQUAL',
    paidById: data.paidById,
    splits: data.splits,
    receiptUrl: data.receiptUrl
  };
  await api.post(`/api/groups/${groupId}/expenses`, payload);
};

export const deleteGroup = async (id: string): Promise<void> => {
  await api.delete(`/groups/${id}`);
};
