'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendChat, clearChatHistory, getChatHistory } from '@/lib/services/ai-assistant';
import { getForecastSummary, getForecasts } from '@/lib/services/forecast';
import { createGoal, deleteGoal, getGoalForecast, getGoalPlan, getGoals, updateGoal, type GoalRequest } from '@/lib/services/goals';
import { getHealthHistory, getHealthScore } from '@/lib/services/health-score';
import { dismissInsight, getInsightSummary, getInsights, getUnreadInsights, markInsightRead } from '@/lib/services/insights';
import {
  completeRecommendation,
  dismissRecommendation,
  getRecommendationHistory,
  getRecommendationSummary,
  getRecommendations,
} from '@/lib/services/recommendations';

const key = (...parts: (string | number)[]) => ['fi', ...parts] as const;
const STALE = 60_000;

// ── Health Score ────────────────────────────────────────────────────
export const useHealthScore = () => useQuery({ queryKey: key('health'), queryFn: getHealthScore, staleTime: STALE });
export const useHealthHistory = (limit = 30) =>
  useQuery({ queryKey: key('health-history', limit), queryFn: () => getHealthHistory(limit), staleTime: STALE });

// ── Insights ────────────────────────────────────────────────────────
export const useInsights = () => useQuery({ queryKey: key('insights'), queryFn: getInsights, staleTime: STALE });
export const useUnreadInsights = () => useQuery({ queryKey: key('insights', 'unread'), queryFn: getUnreadInsights, staleTime: STALE });
export const useInsightSummary = () => useQuery({ queryKey: key('insights', 'summary'), queryFn: getInsightSummary, staleTime: STALE });

export function useMarkInsightRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: markInsightRead, onSuccess: () => qc.invalidateQueries({ queryKey: key('insights') }) });
}
export function useDismissInsight() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: dismissInsight, onSuccess: () => qc.invalidateQueries({ queryKey: key('insights') }) });
}

// ── Recommendations ─────────────────────────────────────────────────
export const useRecommendations = () => useQuery({ queryKey: key('recos'), queryFn: getRecommendations, staleTime: STALE });
export const useRecommendationSummary = () => useQuery({ queryKey: key('recos', 'summary'), queryFn: getRecommendationSummary, staleTime: STALE });
export const useRecommendationHistory = () => useQuery({ queryKey: key('recos', 'history'), queryFn: getRecommendationHistory, staleTime: STALE });

function invalidateRecos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: key('recos') });
}
export function useDismissRecommendation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: dismissRecommendation, onSuccess: () => invalidateRecos(qc) });
}
export function useCompleteRecommendation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: completeRecommendation, onSuccess: () => invalidateRecos(qc) });
}

// ── Forecast ────────────────────────────────────────────────────────
export const useForecasts = () => useQuery({ queryKey: key('forecast'), queryFn: getForecasts, staleTime: STALE });
export const useForecastSummary = () => useQuery({ queryKey: key('forecast', 'summary'), queryFn: getForecastSummary, staleTime: STALE });

// ── Goals ───────────────────────────────────────────────────────────
export const useGoals = () => useQuery({ queryKey: key('goals'), queryFn: getGoals, staleTime: STALE });
export const useGoalPlan = (id: string) => useQuery({ queryKey: key('goals', id, 'plan'), queryFn: () => getGoalPlan(id), enabled: !!id });
export const useGoalForecast = (id: string) => useQuery({ queryKey: key('goals', id, 'forecast'), queryFn: () => getGoalForecast(id), enabled: !!id });

function invalidateGoals(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: key('goals') });
}
export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: GoalRequest) => createGoal(data), onSuccess: () => invalidateGoals(qc) });
}
export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: GoalRequest }) => updateGoal(id, data), onSuccess: () => invalidateGoals(qc) });
}
export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteGoal(id), onSuccess: () => invalidateGoals(qc) });
}

// ── AI Assistant ────────────────────────────────────────────────────
export const useChatHistory = () => useQuery({ queryKey: key('ai', 'history'), queryFn: getChatHistory });
export function useSendChat() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (message: string) => sendChat(message), onSuccess: () => qc.invalidateQueries({ queryKey: key('ai', 'history') }) });
}
export function useClearChat() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: clearChatHistory, onSuccess: () => qc.invalidateQueries({ queryKey: key('ai', 'history') }) });
}
