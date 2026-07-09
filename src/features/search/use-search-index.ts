'use client';

import { useQuery } from '@tanstack/react-query';
import { getBudgets } from '@/lib/services/budgets';
import { getCategories } from '@/lib/services/categories';
import { getExpenses } from '@/lib/services/expenses';
import { getFriends } from '@/lib/services/friends';
import { getGoals } from '@/lib/services/goals';
import { getGroups } from '@/lib/services/groups';
import { getInsights } from '@/lib/services/insights';
import { getRecommendations } from '@/lib/services/recommendations';
import { currentMonthParam, formatCurrency } from '@/shared/utils/format';

export type SearchGroup =
  | 'Expenses'
  | 'Groups'
  | 'Friends'
  | 'Goals'
  | 'Categories'
  | 'Budgets'
  | 'Insights'
  | 'Recommendations';

export interface SearchEntry {
  id: string;
  group: SearchGroup;
  label: string;
  sublabel?: string;
  href: string;
}

async function safe<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p;
  } catch {
    return [];
  }
}

/** Fetch and normalize every searchable entity into a flat index. */
async function buildIndex(): Promise<SearchEntry[]> {
  const [expenses, groups, friends, goals, categories, budgets, insights, recommendations] = await Promise.all([
    safe(getExpenses(currentMonthParam())),
    safe(getGroups()),
    safe(getFriends()),
    safe(getGoals()),
    safe(getCategories()),
    safe(getBudgets()),
    safe(getInsights()),
    safe(getRecommendations()),
  ]);

  const entries: SearchEntry[] = [];

  for (const e of expenses) {
    entries.push({
      id: `expense:${e.id}`,
      group: 'Expenses',
      label: e.description || e.category,
      sublabel: `${e.category} · ${formatCurrency(e.amount)}`,
      href: '/expenses',
    });
  }
  for (const g of groups) {
    entries.push({ id: `group:${g.id}`, group: 'Groups', label: g.name, sublabel: `${g.members?.length ?? 0} members`, href: `/groups/${g.id}` });
  }
  for (const f of friends) {
    entries.push({ id: `friend:${f.userId}`, group: 'Friends', label: f.name, sublabel: f.email, href: `/friends/${f.userId}` });
  }
  for (const goal of goals) {
    entries.push({ id: `goal:${goal.id}`, group: 'Goals', label: goal.title, sublabel: formatCurrency(goal.targetAmount), href: '/intelligence/goals' });
  }
  for (const c of categories) {
    entries.push({ id: `category:${c.id}`, group: 'Categories', label: c.name, href: '/categories' });
  }
  for (const b of budgets) {
    entries.push({ id: `budget:${b.category}`, group: 'Budgets', label: b.category, sublabel: `${b.percentageUsed}% used`, href: '/budgets' });
  }
  for (const i of insights) {
    entries.push({ id: `insight:${i.id}`, group: 'Insights', label: i.title, href: '/intelligence/insights' });
  }
  for (const r of recommendations) {
    entries.push({ id: `reco:${r.id}`, group: 'Recommendations', label: r.title, href: '/intelligence/recommendations' });
  }

  return entries;
}

/** Global search index, fetched once per open and cached briefly. */
export function useSearchIndex(enabled: boolean) {
  return useQuery({
    queryKey: ['search-index'],
    queryFn: buildIndex,
    enabled,
    staleTime: 60_000,
  });
}
