'use client';

import { Banknote, CreditCard, LineChart, PiggyBank, Target, TrendingDown, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { useForecastSummary } from '@/features/intelligence/api';
import { ForecastCard } from '@/features/intelligence/components/forecast-card';
import { humanizeEnum } from '@/features/intelligence/lib/display';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function ForecastPage() {
  const query = useForecastSummary();
  const s = query.data;
  const loading = query.isLoading;

  const confidenceData = useMemo(() => {
    const forecasts = [s?.spendingForecast, s?.savingsForecast, s?.cashflowForecast, s?.budgetForecast, s?.debtForecast, s?.netWorthForecast];
    return forecasts
      .filter((f): f is NonNullable<typeof f> => !!f)
      .map((f) => ({ label: humanizeEnum(f.forecastType), value: Math.round(f.confidence <= 1 ? f.confidence * 100 : f.confidence) }));
  }, [s]);

  const hasAny = confidenceData.length > 0;

  return (
    <div>
      <PageHeader title="Forecast" description="Where your finances are heading, with explainable predictions." />

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : !loading && !hasAny ? (
        <Card>
          <EmptyState icon={LineChart} title="No forecasts yet" description="Forecasts are generated as you build up financial history." />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ForecastCard label="Predicted spending" icon={TrendingDown} forecast={s?.spendingForecast} loading={loading} />
            <ForecastCard label="Predicted savings" icon={PiggyBank} forecast={s?.savingsForecast} loading={loading} />
            <ForecastCard label="Cash flow" icon={Wallet} forecast={s?.cashflowForecast} loading={loading} />
            <ForecastCard label="Budget usage" icon={Target} forecast={s?.budgetForecast} percent loading={loading} />
            <ForecastCard label="Debt" icon={CreditCard} forecast={s?.debtForecast} loading={loading} />
            <ForecastCard label="Net worth" icon={Banknote} forecast={s?.netWorthForecast} loading={loading} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Forecast confidence</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {confidenceData.map((c) => (
                    <li key={c.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-foreground">{c.label}</span>
                        <span className="text-muted-foreground">{c.value}%</span>
                      </div>
                      <Progress value={c.value} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
