import api from '@/lib/api';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  insightType: string;
  severity: Severity;
  /** Present when this insight is a detected risk. */
  riskType?: string | null;
  category?: string | null;
  actionSuggestion?: string | null;
  confidence: number;
  createdAt: string;
  expiresAt: string;
  viewed: boolean;
  dismissed: boolean;
}

export interface InsightSummary {
  totalInsights: number;
  unreadCount: number;
  highSeverityCount: number;
  latestInsight?: FinancialInsight | null;
}

export const getInsights = async (): Promise<FinancialInsight[]> => {
  const res = await api.get('/api/financial-insights');
  return res.data;
};

export const getUnreadInsights = async (): Promise<FinancialInsight[]> => {
  const res = await api.get('/api/financial-insights/unread');
  return res.data;
};

export const markInsightRead = async (id: string): Promise<void> => {
  await api.put(`/api/financial-insights/${id}/read`);
};

export const dismissInsight = async (id: string): Promise<void> => {
  await api.put(`/api/financial-insights/${id}/dismiss`);
};

export const getInsightSummary = async (): Promise<InsightSummary> => {
  const res = await api.get('/api/financial-insights/summary');
  return res.data;
};
