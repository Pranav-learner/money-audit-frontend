'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useDismissInsight,
  useInsights,
  useMarkInsightRead,
} from '@/features/intelligence/api';
import { acceptFriendRequest, getPendingRequests, rejectFriendRequest } from '@/lib/services/friends';
import { acceptGroupInvitation, getGroupInvitations, rejectGroupInvitation } from '@/lib/services/groups';
import { getNotifications } from '@/lib/services/notifications';
import { fromInsight } from './lib';
import type { AppNotification } from './types';

const INVITES_KEY = ['notifications', 'invitations'] as const;
const BACKEND_NOTIFS_KEY = ['notifications', 'backend'] as const;

/** Pending friend requests + group invitations, normalized to the unified shape. */
async function fetchInvitationNotifications(): Promise<AppNotification[]> {
  const [requests, invites] = await Promise.all([
    getPendingRequests().catch(() => []),
    getGroupInvitations().catch(() => []),
  ]);

  const friendItems: AppNotification[] = requests.map((r) => ({
    id: `friend:${r.friendshipId}`,
    rawId: r.friendshipId,
    source: 'friend_request',
    group: 'social',
    category: 'Friend request',
    title: 'New friend request',
    message: `${r.name} wants to connect with you.`,
    createdAt: '',
    read: false,
    tone: 'info',
    href: '/friends',
    actionable: true,
  }));

  const groupItems: AppNotification[] = invites.map((inv) => ({
    id: `group:${inv.id}`,
    rawId: inv.id,
    source: 'group_invite',
    group: 'social',
    category: 'Group invite',
    title: 'Group invitation',
    message: `${inv.invitedBy ?? 'Someone'} invited you to join "${inv.groupName ?? 'a group'}".`,
    createdAt: inv.date ?? '',
    read: false,
    tone: 'info',
    href: '/groups',
    actionable: true,
  }));

  return [...friendItems, ...groupItems];
}

export function useInvitationNotifications() {
  return useQuery({ queryKey: INVITES_KEY, queryFn: fetchInvitationNotifications, staleTime: 30_000 });
}

export function useBackendNotifications() {
  return useQuery({
    queryKey: BACKEND_NOTIFS_KEY,
    queryFn: () => getNotifications().catch(() => []),
    staleTime: 30_000,
  });
}

/** Accept a friend request or group invitation. */
export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (n: AppNotification) =>
      n.source === 'friend_request' ? acceptFriendRequest(n.rawId) : acceptGroupInvitation(n.rawId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITES_KEY });
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/** Decline a friend request or group invitation. */
export function useDeclineInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (n: AppNotification) =>
      n.source === 'friend_request' ? rejectFriendRequest(n.rawId) : rejectGroupInvitation(n.rawId),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVITES_KEY }),
  });
}

export interface NotificationCenter {
  items: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Aggregates every exposed notification feed (Backend In-App Notifications +
 * Financial Intelligence insights + pending invitations) into one sorted,
 * normalized list.
 */
export function useNotificationCenter(): NotificationCenter {
  const insightsQuery = useInsights();
  const invitesQuery = useInvitationNotifications();
  const backendQuery = useBackendNotifications();

  const items = useMemo(() => {
    const insightItems = (insightsQuery.data ?? [])
      .filter((i) => !i.dismissed)
      .map(fromInsight);
    const inviteItems = invitesQuery.data ?? [];
    const backendItems: AppNotification[] = (backendQuery.data ?? []).map((b) => ({
      id: `backend:${b.id}`,
      rawId: b.id,
      source: 'insight' as const,
      group: 'intelligence' as const,
      category: b.type,
      title: b.title,
      message: b.body,
      createdAt: b.createdAt ?? '',
      read: b.read,
      tone: b.type.toLowerCase().includes('risk') ? 'warning' as const : 'info' as const,
      href: '/intelligence/insights',
      actionable: false,
    }));

    return [...inviteItems, ...backendItems, ...insightItems].sort((a, b) => {
      if (!a.createdAt) return -1;
      if (!b.createdAt) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [insightsQuery.data, invitesQuery.data, backendQuery.data]);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  return {
    items,
    unreadCount,
    isLoading: insightsQuery.isLoading || invitesQuery.isLoading || backendQuery.isLoading,
    isError: insightsQuery.isError || invitesQuery.isError || backendQuery.isError,
    refetch: () => {
      insightsQuery.refetch();
      invitesQuery.refetch();
      backendQuery.refetch();
    },
  };
}

/** Re-exported insight mutations so the notification UI has one import surface. */
export { useMarkInsightRead, useDismissInsight };
