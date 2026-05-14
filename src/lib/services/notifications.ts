import api from '@/lib/api';
import { FriendRequest } from './friends';
import { getGroupInvitations } from './groups';

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  date: string;
}

export interface Notification {
  id: string;
  type: 'FRIEND_REQUEST' | 'GROUP_INVITE' | 'EXPENSE_ADDED' | 'SETTLEMENT';
  title: string;
  message: string;
  date: string;
  read: boolean;
  data?: any;
}

export const getNotifications = async (): Promise<Notification[]> => {
  // Since we don't have a dedicated notifications endpoint yet, 
  // we'll aggregate from other services for now or return a mock list
  // that combines friend requests.
  try {
    const [friendRequests, groupInvites] = await Promise.all([
      api.get('/friends/requests'),
      getGroupInvitations()
    ]);

    const mappedFriendRequests: Notification[] = friendRequests.data.map((req: any) => ({
      id: req.friendshipId,
      type: 'FRIEND_REQUEST',
      title: 'New Friend Request',
      message: `${req.name} wants to be your friend`,
      date: req.since || new Date().toISOString(),
      read: false,
      data: req
    }));

    const mappedGroupInvites: Notification[] = groupInvites.map((inv: any) => ({
      id: inv.id,
      type: 'GROUP_INVITE',
      title: 'Group Invitation',
      message: `${inv.invitedBy} invited you to join "${inv.groupName}"`,
      date: inv.date,
      read: false,
      data: inv
    }));

    return [...mappedFriendRequests, ...mappedGroupInvites].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

export const markAsRead = async (id: string): Promise<void> => {
  // api.put(`/notifications/${id}/read`);
};
