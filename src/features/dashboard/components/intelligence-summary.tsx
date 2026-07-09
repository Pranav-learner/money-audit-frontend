'use client';

import { AlertTriangle, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useHealthScore, useInsightSummary, useInsights, useRecommendationSummary } from '@/features/intelligence/api';
import { CircularScore } from '@/features/intelligence/components/circular-score';
import { bandMeta, severityMeta } from '@/features/intelligence/lib/display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatCurrency } from '@/shared/utils/format';

const SEVERITY_RANK = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

/** Compact Financial Intelligence snapshot for the dashboard, linking into the hub. */
export function IntelligenceSummary() {
  const health = useHealthScore();
  const insights = useInsights();
  const insightSummary = useInsightSummary();
  const recoSummary = useRecommendationSummary();

  const band = health.data ? bandMeta(health.data.band) : null;
  const topReco = recoSummary.data?.highestPriority ?? recoSummary.data?.topRecommendations?.[0];
  const latest = insightSummary.data?.latestInsight;

  const topRisk = useMemo(() => {
    const risks = (insights.data ?? []).filter((i) => i.riskType && !i.dismissed);
    return [...risks].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])[0];
  }, [insights.data]);

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Financial Intelligence
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/intelligence">
            Open hub <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          {/* Health gauge */}
          <Link href="/intelligence/health" className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border p-4 transition-colors hover:bg-accent">
            {health.isLoading ? (
              <Skeleton className="size-28 rounded-full" />
            ) : health.data ? (
              <>
                <CircularScore score={health.data.score} color={band!.color} label={band!.label} size={120} />
                <span className="text-xs text-muted-foreground">Health score</span>
              </>
            ) : (
              <div className="flex size-28 items-center justify-center text-center text-xs text-muted-foreground">Score unavailable</div>
            )}
          </Link>

          {/* Highlights */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/intelligence/insights" className="rounded-xl border border-border p-3 transition-colors hover:bg-accent">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lightbulb className="size-3.5 text-primary" aria-hidden />
                Latest insight
              </p>
              {insightSummary.isLoading ? (
                <Skeleton className="mt-2 h-9 w-full" />
              ) : latest ? (
                <>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium text-foreground">{latest.title}</p>
                  <Badge variant={severityMeta(latest.severity).variant} className="mt-1.5">
                    {severityMeta(latest.severity).label}
                  </Badge>
                </>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">No new insights.</p>
              )}
            </Link>

            <Link href="/intelligence/risk" className="rounded-xl border border-border p-3 transition-colors hover:bg-accent">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <AlertTriangle className="size-3.5 text-primary" aria-hidden />
                Top risk
              </p>
              {insights.isLoading ? (
                <Skeleton className="mt-2 h-9 w-full" />
              ) : topRisk ? (
                <>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium text-foreground">{topRisk.title}</p>
                  <Badge variant={severityMeta(topRisk.severity).variant} className="mt-1.5">
                    {severityMeta(topRisk.severity).label}
                  </Badge>
                </>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">No active risks.</p>
              )}
            </Link>

            <Link href="/intelligence/recommendations" className="rounded-xl border border-border p-3 transition-colors hover:bg-accent">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" aria-hidden />
                Top tip
              </p>
              {recoSummary.isLoading ? (
                <Skeleton className="mt-2 h-9 w-full" />
              ) : topReco ? (
                <>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium text-foreground">{topReco.title}</p>
                  {topReco.expectedMonthlySaving != null && topReco.expectedMonthlySaving > 0 && (
                    <p className="mt-1.5 text-xs font-medium text-success">Save ~{formatCurrency(topReco.expectedMonthlySaving)}/mo</p>
                  )}
                </>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">No tips right now.</p>
              )}
            </Link>
          </div>
        </div>

        {/* AI assistant shortcut */}
        <Link
          href="/intelligence/assistant"
          className="group mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3.5 transition-colors hover:from-primary/15"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Ask the AI Assistant</p>
            <p className="text-xs text-muted-foreground">Grounded answers about your money, in plain language.</p>
          </div>
          <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
