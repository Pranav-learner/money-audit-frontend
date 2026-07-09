'use client';

import type { LucideIcon } from 'lucide-react';
import type { Forecast } from '@/lib/services/forecast';
import { confidenceLabel } from '@/features/intelligence/lib/display';
import { WhyExplanation } from '@/features/intelligence/components/why-explanation';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatCurrency } from '@/shared/utils/format';

export interface ForecastCardProps {
  forecast?: Forecast | null;
  label: string;
  icon: LucideIcon;
  percent?: boolean;
  loading?: boolean;
}

export function ForecastCard({ forecast, label, icon: Icon, percent, loading }: ForecastCardProps) {
  const value =
    forecast?.predictedValue == null
      ? '—'
      : percent
        ? `${Math.round(forecast.predictedValue)}%`
        : formatCurrency(forecast.predictedValue);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon className="size-4 text-primary" aria-hidden />
            {label}
          </span>
          {forecast && <Badge variant="secondary">{confidenceLabel(forecast.confidence)}</Badge>}
        </div>

        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        )}

        {forecast?.predictionPeriod && !loading && (
          <p className="text-xs text-muted-foreground">Projected for {forecast.predictionPeriod.replace(/_/g, ' ').toLowerCase()}</p>
        )}

        {forecast?.explanation && <WhyExplanation question="Why is this predicted?" explanation={forecast.explanation} />}
      </CardContent>
    </Card>
  );
}
