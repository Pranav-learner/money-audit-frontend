import api from '@/lib/api';

export type GoalType =
  | 'EMERGENCY_FUND'
  | 'VACATION'
  | 'VEHICLE'
  | 'EDUCATION'
  | 'HOUSE'
  | 'GADGET'
  | 'INVESTMENT'
  | 'CUSTOM';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export interface Goal {
  id: string;
  title: string;
  goalType: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContributionRequired?: number | null;
  projectedCompletionDate?: string | null;
  status: GoalStatus;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalRequest {
  title: string;
  goalType: GoalType;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
}

export interface PlanAction {
  label: string;
  monthlyAmount: number;
}

export interface GoalPlan {
  goalId: string;
  goalTitle: string;
  requiredMonthlySaving: number;
  currentMonthlyCapacity: number;
  successProbability: number;
  feasible: boolean;
  recommendedActions: PlanAction[];
  projectedCompletionDate?: string | null;
  alternativeTargetDate?: string | null;
  monthsRemaining: number;
  summary: string;
}

export interface GoalForecast {
  goalId: string;
  successProbability: number;
  projectedCompletionDate?: string | null;
  requiredMonthlySaving: number;
  recommendations: string[];
}

export const getGoals = async (): Promise<Goal[]> => {
  const res = await api.get('/api/goals');
  return res.data;
};

export const createGoal = async (data: GoalRequest): Promise<Goal> => {
  const res = await api.post('/api/goals', data);
  return res.data;
};

export const updateGoal = async (id: string, data: GoalRequest): Promise<Goal> => {
  const res = await api.put(`/api/goals/${id}`, data);
  return res.data;
};

export const deleteGoal = async (id: string): Promise<void> => {
  await api.delete(`/api/goals/${id}`);
};

export const getGoalPlan = async (id: string): Promise<GoalPlan> => {
  const res = await api.get(`/api/goals/${id}/plan`);
  return res.data;
};

export const getGoalForecast = async (id: string): Promise<GoalForecast> => {
  const res = await api.get(`/api/goals/${id}/forecast`);
  return res.data;
};
