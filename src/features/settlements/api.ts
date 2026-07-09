'use client';

import { useQueries } from '@tanstack/react-query';
import type { Friend } from '@/features/friends/api';
import { getNetBalance } from '@/lib/services/direct';
import { queryKeys } from '@/shared/lib/query-keys';

export interface FriendBalance {
  friend: Friend;
  net: number;
}

/**
 * Fetches each friend's net direct balance in parallel (TanStack `useQueries`), so the settlements
 * dashboard can aggregate what you owe and are owed without an N+1 waterfall.
 */
export function useFriendBalances(friends: Friend[]) {
  const results = useQueries({
    queries: friends.map((f) => ({
      queryKey: queryKeys.netBalance(f.userId),
      queryFn: () => getNetBalance(f.userId),
      enabled: !!f.userId,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const balances: FriendBalance[] = friends.map((f, i) => ({ friend: f, net: results[i]?.data ?? 0 }));

  const totalOwed = balances.filter((b) => b.net > 0).reduce((s, b) => s + b.net, 0);
  const totalLent = balances.filter((b) => b.net < 0).reduce((s, b) => s - b.net, 0);

  return { balances, isLoading, totalOwed, totalLent, net: totalLent - totalOwed };
}
