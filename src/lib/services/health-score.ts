import api from '@/lib/api';

export type HealthBand = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION' | 'CRITICAL';

export interface HealthComponent {
  component: string;
  score: number;
  maxPoints: number;
  reason: string;
}

export interface HealthScore {
  score: number;
  band: HealthBand;
  components: HealthComponent[];
  explanation: string;
  changeSincePrevious?: number | null;
  changeExplanation?: string | null;
  generatedAt: string;
}

export interface HealthPoint {
  score: number;
  band: HealthBand;
  createdAt: string;
}

export const getHealthScore = async (): Promise<HealthScore> => {
  const res = await api.get('/api/health-score');
  return res.data;
};

export const getHealthHistory = async (limit = 30): Promise<HealthPoint[]> => {
  const res = await api.get('/api/health-score/history', { params: { limit } });
  return res.data;
};
