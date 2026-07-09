import api from '@/lib/api';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RecommendationStatus = 'ACTIVE' | 'COMPLETED' | 'DISMISSED' | 'EXPIRED';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  recommendationType: string;
  priority: Priority;
  expectedMonthlySaving?: number | null;
  confidence: number;
  actionText?: string | null;
  status: RecommendationStatus;
  createdAt: string;
  expiresAt: string;
}

export interface RecommendationSummary {
  totalRecommendations: number;
  activeCount: number;
  completedCount: number;
  dismissedCount: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  highestPriority?: Recommendation | null;
  topRecommendations: Recommendation[];
  recentlyCompleted: Recommendation[];
}

export const getRecommendations = async (): Promise<Recommendation[]> => {
  const res = await api.get('/api/recommendations');
  return res.data;
};

export const getTopRecommendations = async (): Promise<Recommendation[]> => {
  const res = await api.get('/api/recommendations/top');
  return res.data;
};

export const getRecommendationHistory = async (): Promise<Recommendation[]> => {
  const res = await api.get('/api/recommendations/history');
  return res.data;
};

export const dismissRecommendation = async (id: string): Promise<void> => {
  await api.put(`/api/recommendations/${id}/dismiss`);
};

export const completeRecommendation = async (id: string): Promise<void> => {
  await api.put(`/api/recommendations/${id}/complete`);
};

export const getRecommendationSummary = async (): Promise<RecommendationSummary> => {
  const res = await api.get('/api/recommendations/summary');
  return res.data;
};
