'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addGroupMember,
  createGroup,
  createGroupExpense,
  deleteGroup,
  getGroupBalances,
  getGroupById,
  getGroupExpenses,
  getGroups,
  type Group,
  type GroupExpense,
} from '@/lib/services/groups';
import { queryKeys } from '@/shared/lib/query-keys';

export type { Group, GroupExpense };

/** A member's net balance within a group, as returned by `/api/groups/{id}/balances`. */
export interface GroupBalance {
  userId: string;
  userName: string;
  netBalance: number;
}

export interface GroupExpenseInput {
  title: string;
  amount: number;
  splitType: 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';
  paidById: string;
  splits: { userId: string; amountOwed: number }[];
  receiptUrl?: string;
}

export function useGroups() {
  return useQuery({ queryKey: queryKeys.groups(), queryFn: getGroups });
}

export function useGroup(id: string) {
  return useQuery({ queryKey: queryKeys.group(id), queryFn: () => getGroupById(id), enabled: !!id });
}

export function useGroupExpenses(id: string) {
  return useQuery({ queryKey: queryKeys.groupExpenses(id), queryFn: () => getGroupExpenses(id), enabled: !!id });
}

export function useGroupBalances(id: string) {
  return useQuery({
    queryKey: queryKeys.groupBalances(id),
    queryFn: () => getGroupBalances(id) as Promise<GroupBalance[]>,
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createGroup(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groups() }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.groups() }),
  });
}

export function useAddGroupMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (identifier: string) => addGroupMember(groupId, undefined, identifier),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groupBalances(groupId) });
    },
  });
}

export function useCreateGroupExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupExpenseInput) => createGroupExpense(groupId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groupExpenses(groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groupBalances(groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groups() });
    },
  });
}
