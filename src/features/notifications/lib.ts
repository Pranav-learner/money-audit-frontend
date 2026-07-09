import type { FinancialInsight } from '@/lib/services/insights';
import type { AppNotification } from './types';

/** Resolve the most relevant page for an insight, for deep-linking on click. */
export function insightHref(insight: FinancialInsight): string {
  if (insight.riskType) return '/intelligence/risk';
  const key = `${insight.insightType ?? ''} ${insight.category ?? ''}`.toUpperCase();
  if (key.includes('HEALTH')) return '/intelligence/health';
  if (key.includes('RECOMMEND')) return '/intelligence/recommendations';
  if (key.includes('FORECAST')) return '/intelligence/forecast';
  if (key.includes('GOAL')) return '/intelligence/goals';
  if (key.includes('BUDGET')) return '/budgets';
  if (key.includes('SAVING')) return '/savings';
  return '/intelligence/insights';
}

/** Short category label for an insight, used by the filter + item badge. */
export function insightCategory(insight: FinancialInsight): string {
  if (insight.riskType) return 'Risk';
  const key = `${insight.insightType ?? ''} ${insight.category ?? ''}`.toUpperCase();
  if (key.includes('HEALTH')) return 'Health';
  if (key.includes('RECOMMEND')) return 'Recommendation';
  if (key.includes('FORECAST')) return 'Forecast';
  if (key.includes('GOAL')) return 'Goal';
  if (key.includes('BUDGET')) return 'Budget';
  return 'Insight';
}

const SEVERITY_TONE = { HIGH: 'destructive', MEDIUM: 'warning', LOW: 'info' } as const;

/** Normalize a Financial Intelligence insight into the unified feed shape. */
export function fromInsight(insight: FinancialInsight): AppNotification {
  return {
    id: `insight:${insight.id}`,
    rawId: insight.id,
    source: 'insight',
    group: 'intelligence',
    category: insightCategory(insight),
    title: insight.title,
    message: insight.description,
    actionSuggestion: insight.actionSuggestion ?? undefined,
    createdAt: insight.createdAt,
    read: insight.viewed,
    tone: SEVERITY_TONE[insight.severity] ?? 'default',
    href: insightHref(insight),
    actionable: false,
  };
}
