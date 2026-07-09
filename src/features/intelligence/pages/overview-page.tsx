'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  ChevronRight,
  Lightbulb,
  LineChart,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  useForecastSummary,
  useGoals,
  useHealthScore,
  useInsights,
  useInsightSummary,
  useRecommendationSummary,
} from '@/features/intelligence/api';
import { CircularScore } from '@/features/intelligence/components/circular-score';
import { bandMeta, humanizeEnum, severityMeta } from '@/features/intelligence/lib/display';
import type { FinancialInsight } from '@/lib/services/insights';
import { PageHeader } from '@/shared/components/common/page-header';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/shared/utils/format';

const SEVERITY_RANK = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

function TileCard({
  href,
  title,
  icon: Icon,
  children,
  className,
  loading,
}: {
  href: string;
  title: string;
  icon: typeof Target;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={className}>
      <Link href={href} className="group block h-full">
        <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="size-4 text-primary" aria-hidden />
                {title}
              </span>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            {loading ? <Skeleton className="h-16 w-full" /> : children}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function OverviewPage() {
  const health = useHealthScore();
  const insightSummary = useInsightSummary();
  const recoSummary = useRecommendationSummary();
  const insights = useInsights();
  const forecast = useForecastSummary();
  const goals = useGoals();

  const topRisk = useMemo<FinancialInsight | undefined>(() => {
    const risks = (insights.data ?? []).filter((i) => i.riskType && !i.dismissed);
    return [...risks].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])[0];
  }, [insights.data]);

  const topGoal = useMemo(() => {
    const active = (goals.data ?? []).filter((g) => g.status !== 'COMPLETED');
    return [...active].sort((a, b) => b.progressPercent - a.progressPercent)[0] ?? (goals.data ?? [])[0];
  }, [goals.data]);

  const band = health.data ? bandMeta(health.data.band) : null;
  const latest = insightSummary.data?.latestInsight;
  const topReco = recoSummary.data?.highestPriority ?? recoSummary.data?.topRecommendations?.[0];
  const unread = insightSummary.data?.unreadCount ?? 0;
  const spending = forecast.data?.spendingForecast;

  return (
    <div>
      <PageHeader
        title="Financial Intelligence"
        description="A single, explainable view of where your money stands — and what to do next."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Health — hero tile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 lg:col-span-1 lg:row-span-2">
          <Link href="/intelligence/health" className="group block h-full">
            <Card className="h-full overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                    Financial Health
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                {health.isLoading ? (
                  <Skeleton className="size-48 rounded-full" />
                ) : health.data ? (
                  <>
                    <CircularScore score={health.data.score} color={band!.color} label={band!.label} size={190} />
                    <p className="max-w-xs text-sm text-muted-foreground">{health.data.explanation}</p>
                  </>
                ) : (
                  <p className="py-12 text-sm text-muted-foreground">Health score not available yet.</p>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Today's insight */}
        <TileCard href="/intelligence/insights" title="Latest insight" icon={Lightbulb} loading={insightSummary.isLoading}>
          {latest ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={severityMeta(latest.severity).variant}>{severityMeta(latest.severity).label}</Badge>
                {latest.category && <span className="text-xs text-muted-foreground">{humanizeEnum(latest.category)}</span>}
              </div>
              <p className="font-medium text-foreground">{latest.title}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{latest.description}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No new insights. You&apos;re all caught up.</p>
          )}
        </TileCard>

        {/* Highest priority risk */}
        <TileCard href="/intelligence/risk" title="Top risk" icon={AlertTriangle} loading={insights.isLoading}>
          {topRisk ? (
            <div className="space-y-1.5">
              <Badge variant={severityMeta(topRisk.severity).variant}>{severityMeta(topRisk.severity).label} risk</Badge>
              <p className="font-medium text-foreground">{topRisk.title}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{topRisk.description}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active risks detected. 🎉</p>
          )}
        </TileCard>

        {/* Top recommendation */}
        <TileCard href="/intelligence/recommendations" title="Top recommendation" icon={Sparkles} loading={recoSummary.isLoading}>
          {topReco ? (
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">{topReco.title}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{topReco.description}</p>
              {topReco.expectedMonthlySaving != null && topReco.expectedMonthlySaving > 0 && (
                <p className="text-sm font-medium text-success">Save ~{formatCurrency(topReco.expectedMonthlySaving)}/mo</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recommendations right now.</p>
          )}
        </TileCard>

        {/* Forecast */}
        <TileCard href="/intelligence/forecast" title="Spending forecast" icon={LineChart} loading={forecast.isLoading}>
          {spending?.predictedValue != null ? (
            <div className="space-y-1.5">
              <p className="text-2xl font-semibold tracking-tight text-foreground">{formatCurrency(spending.predictedValue)}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{spending.explanation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not enough history to forecast yet.</p>
          )}
        </TileCard>

        {/* Goal progress */}
        <TileCard href="/intelligence/goals" title="Goal progress" icon={Target} loading={goals.isLoading}>
          {topGoal ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{topGoal.title}</p>
                <span className="text-sm text-muted-foreground">{topGoal.progressPercent}%</span>
              </div>
              <Progress value={topGoal.progressPercent} />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(topGoal.currentAmount)} of {formatCurrency(topGoal.targetAmount)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No goals yet. Set one to start planning.</p>
          )}
        </TileCard>

        {/* Notifications + AI shortcut row */}
        <Link href="/intelligence/insights" className="group block">
          <Card className={cn('h-full transition-all hover:border-primary/40 hover:shadow-md', unread > 0 && 'border-primary/30 bg-primary/5')}>
            <CardContent className="flex h-full items-center gap-3 p-5">
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.65rem] font-semibold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
              <div>
                <p className="font-medium text-foreground">{unread > 0 ? `${unread} unread insight${unread > 1 ? 's' : ''}` : 'Notifications'}</p>
                <p className="text-sm text-muted-foreground">{unread > 0 ? 'Tap to review what needs attention' : "You're all caught up"}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 lg:col-span-3">
          <Link href="/intelligence/assistant" className="group block">
            <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Ask the AI Assistant</p>
                  <p className="text-sm text-muted-foreground">Get grounded answers about your spending, goals, and health — in plain language.</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                  Chat
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
