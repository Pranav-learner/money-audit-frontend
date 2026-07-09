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
} as const;
