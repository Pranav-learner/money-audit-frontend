'use client';

import { ArrowDownRight, ArrowUpRight, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useHealthHistory, useHealthScore } from '@/features/intelligence/api';
import { CircularScore } from '@/features/intelligence/components/circular-score';
import { WhyExplanation } from '@/features/intelligence/components/why-explanation';
import { bandMeta, humanizeEnum } from '@/features/intelligence/lib/display';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { formatShortDate } from '@/shared/utils/format';

const ScoreTrendChart = dynamic(
  () => import('@/features/intelligence/components/score-trend-chart').then((m) => ({ default: m.ScoreTrendChart })),
  { ssr: false, loading: () => <Skeleton className="size-full" /> },
);

export function HealthPage() {
  const scoreQuery = useHealthScore();
  const historyQuery = useHealthHistory();

  const score = scoreQuery.data;
  const band = score ? bandMeta(score.band) : null;

  const components = useMemo(
    () => [...(score?.components ?? [])].sort((a, b) => a.score / a.maxPoints - b.score / b.maxPoints),
    [score?.components],
  );
  const weaknesses = components.slice(0, 2);
  const strengths = [...components].reverse().slice(0, 2);

  const history = useMemo(
    () => [...(historyQuery.data ?? [])].reverse().map((p) => ({ label: formatShortDate(p.createdAt), value: p.score })),
    [historyQuery.data],
  );

  const change = score?.changeSincePrevious ?? null;

  return (
    <div>
      <PageHeader title="Financial Health" description="A single, explainable measure of your financial wellbeing." />

      {scoreQuery.isError ? (
        <ErrorState onRetry={() => scoreQuery.refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Score gauge */}
            <Card className="lg:col-span-1">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                {scoreQuery.isLoading || !score || !band ? (
                  <Skeleton className="size-52 rounded-full" />
                ) : (
                  <>
                    <CircularScore score={score.score} color={band.color} label={band.label} />
                    <Badge variant={band.variant}>{band.label}</Badge>
                    {change != null && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-sm font-medium',
                          change >= 0 ? 'text-success' : 'text-destructive',
                        )}
                      >
                        {change >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                        {change >= 0 ? '+' : ''}
                        {change} since last snapshot
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground">{score.explanation}</p>
                    <WhyExplanation question="Why did my score change?" explanation={score.changeExplanation} />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Component breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Component breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {scoreQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {(score?.components ?? []).map((c) => {
                      const pct = c.maxPoints > 0 ? Math.round((c.score / c.maxPoints) * 100) : 0;
                      return (
                        <li key={c.component}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium capitalize text-foreground">{humanizeEnum(c.component)}</span>
                            <span className="text-muted-foreground">
                              {c.score}/{c.maxPoints}
                            </span>
                          </div>
                          <Progress value={pct} />
                          <p className="mt-1 text-xs text-muted-foreground">{c.reason}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Score history */}
          <ChartCard title="Score history" description="How your health score has trended" height={240} loading={historyQuery.isLoading} isEmpty={history.length < 2} emptyMessage="Not enough history yet — check back after a few days.">
            <ScoreTrendChart data={history} />
          </ChartCard>

          {/* Strengths & weaknesses */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <TrendingUp className="size-4 text-success" aria-hidden />
                <CardTitle className="text-base">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                {strengths.length === 0 ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <ul className="space-y-2 text-sm">
                    {strengths.map((c) => (
                      <li key={c.component} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                        <span>
                          <span className="font-medium capitalize text-foreground">{humanizeEnum(c.component)}</span>
                          <span className="text-muted-foreground"> — {c.reason}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <TrendingDown className="size-4 text-warning" aria-hidden />
                <CardTitle className="text-base">Improvement suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {weaknesses.length === 0 ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <ul className="space-y-2 text-sm">
                    {weaknesses.map((c) => (
                      <li key={c.component} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                        <span>
                          <span className="font-medium capitalize text-foreground">{humanizeEnum(c.component)}</span>
                          <span className="text-muted-foreground"> — {c.reason}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
