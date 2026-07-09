'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
  type Friend,
  type FriendRequest,
} from '@/lib/services/friends';
import { queryKeys } from '@/shared/lib/query-keys';

export type { Friend, FriendRequest };

export function useFriends() {
  return useQuery({ queryKey: queryKeys.friends(), queryFn: getFriends });
}

export function useFriendRequests() {
  return useQuery({ queryKey: queryKeys.friendRequests(), queryFn: getPendingRequests });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (identifier: string) => sendFriendRequest(identifier),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
      action === 'accept' ? acceptFriendRequest(id) : rejectFriendRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });
}

export function useUserSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ['user-search', query],
    queryFn: () => searchUsers(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 30_000,
  });
}
