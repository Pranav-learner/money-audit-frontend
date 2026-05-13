import api from '@/lib/api';

export interface Friend {
  friendshipId: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
}

export interface FriendRequest {
  friendshipId: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

export const getFriends = async (): Promise<Friend[]> => {
  const res = await api.get('/friends');
  return res.data;
};

export const getPendingRequests = async (): Promise<FriendRequest[]> => {
  const res = await api.get('/friends/requests');
  return res.data;
};

export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  await api.put(`/friends/${requestId}/accept`);
};

export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  await api.put(`/friends/${requestId}/reject`);
};

export const sendFriendRequest = async (phoneOrEmail: string): Promise<void> => {
  await api.post('/friends/requests', { phoneUrlEmail: phoneOrEmail });
};

export const searchUsers = async (query: string): Promise<any[]> => {
  const res = await api.get(`/users/search?query=${query}`);
  return res.data;
};

