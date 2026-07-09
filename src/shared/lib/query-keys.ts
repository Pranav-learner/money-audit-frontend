/**
 * Central registry of TanStack Query keys so caches invalidate consistently across features.
 * Never inline query keys in components — reference these.
 */
export const queryKeys = {
  expenses: (month?: string) => ['expenses', month ?? 'all'] as const,
  categories: () => ['categories'] as const,
  budgets: (month?: number, year?: number) => ['budgets', month ?? null, year ?? null] as const,
  savings: () => ['savings'] as const,
  receipts: () => ['receipts'] as const,
  dashboard: {
    summary: () => ['dashboard', 'summary'] as const,
    charts: () => ['dashboard', 'charts'] as const,
    recent: () => ['dashboard', 'recent'] as const,
  },
  // ── Social / Splitwise ──────────────────────────────────────────────
  friends: () => ['friends'] as const,
  friendRequests: () => ['friends', 'requests'] as const,
  directAll: () => ['direct', 'all'] as const,
  directFor: (friendId: string) => ['direct', friendId] as const,
  netBalance: (friendId: string) => ['direct', friendId, 'balance'] as const,
  groups: () => ['groups'] as const,
  group: (id: string) => ['groups', id] as const,
  groupExpenses: (id: string) => ['groups', id, 'expenses'] as const,
  groupBalances: (id: string) => ['groups', id, 'balances'] as const,
  editRequests: () => ['edit-requests'] as const,
} as const;

