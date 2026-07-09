import { describe, expect, it } from 'vitest';
import type { FinancialInsight } from '@/lib/services/insights';
import { fromInsight, insightCategory, insightHref } from './lib';

function insight(partial: Partial<FinancialInsight> = {}): FinancialInsight {
  return {
    id: 'i1',
    title: 'Spending up',
    description: 'You spent more this week.',
    insightType: 'SPENDING_TREND',
    severity: 'MEDIUM',
    confidence: 0.8,
    createdAt: '2026-07-01T10:00:00Z',
    viewed: false,
    dismissed: false,
    ...partial,
  } as FinancialInsight;
}

describe('insightHref', () => {
  it('routes risks to the risk page', () => {
    expect(insightHref(insight({ riskType: 'DEBT' }))).toBe('/intelligence/risk');
  });
  it('routes by insight type keyword', () => {
    expect(insightHref(insight({ insightType: 'HEALTH_SCORE' }))).toBe('/intelligence/health');
    expect(insightHref(insight({ insightType: 'RECOMMENDATION_NEW' }))).toBe('/intelligence/recommendations');
    expect(insightHref(insight({ insightType: 'FORECAST_UPDATE' }))).toBe('/intelligence/forecast');
    expect(insightHref(insight({ insightType: 'GOAL_PROGRESS' }))).toBe('/intelligence/goals');
    expect(insightHref(insight({ insightType: 'BUDGET_WARNING' }))).toBe('/budgets');
  });
  it('falls back to the insights page', () => {
    expect(insightHref(insight({ insightType: 'MISC' }))).toBe('/intelligence/insights');
  });
});

describe('insightCategory', () => {
  it('labels risks and known types', () => {
    expect(insightCategory(insight({ riskType: 'DEBT' }))).toBe('Risk');
    expect(insightCategory(insight({ insightType: 'GOAL_X' }))).toBe('Goal');
    expect(insightCategory(insight({ insightType: 'UNKNOWN' }))).toBe('Insight');
  });
});

describe('fromInsight', () => {
  it('normalizes an insight into the unified feed shape', () => {
    const n = fromInsight(insight({ id: 'abc', severity: 'HIGH', viewed: true }));
    expect(n.id).toBe('insight:abc');
    expect(n.rawId).toBe('abc');
    expect(n.source).toBe('insight');
    expect(n.group).toBe('intelligence');
    expect(n.read).toBe(true);
    expect(n.tone).toBe('destructive');
    expect(n.actionable).toBe(false);
  });
});
