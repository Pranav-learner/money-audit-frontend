import api from '@/lib/api';

export type ForecastType =
  | 'MONTHLY_SPENDING'
  | 'MONTHLY_SAVINGS'
  | 'CASHFLOW'
  | 'BUDGET_USAGE'
  | 'DEBT'
  | 'NET_WORTH'
  | 'GOAL_COMPLETION';

export interface Forecast {
  id: string;
  forecastType: ForecastType;
  predictedValue?: number | null;
  confidence: number;
  predictionDate: string;
  predictionPeriod: string;
  explanation: string;
  createdAt: string;
}

export interface ForecastSummary {
  spendingForecast?: Forecast | null;
  savingsForecast?: Forecast | null;
  budgetForecast?: Forecast | null;
  cashflowForecast?: Forecast | null;
  debtForecast?: Forecast | null;
  netWorthForecast?: Forecast | null;
}

export const getForecasts = async (): Promise<Forecast[]> => {
  const res = await api.get('/api/forecast');
  return res.data;
};

export const getForecastSummary = async (): Promise<ForecastSummary> => {
  const res = await api.get('/api/forecast/summary');
  return res.data;
};
