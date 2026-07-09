'use client';

import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDismissInsight, useInsights } from '@/features/intelligence/api';
import { FinancialInsightCard } from '@/features/intelligence/components/financial-insight-card';
import { InsightDetailsDrawer } from '@/features/intelligence/components/insight-details-drawer';
import { LazyPieChart } from '@/features/analytics/components/lazy-charts';
import { humanizeEnum } from '@/features/intelligence/lib/display';
import type { FinancialInsight, Severity } from '@/lib/services/insights';
import { ChartCard } from '@/shared/components/charts/chart-card';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Card } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';

const GROUPS: { severity: Severity; title: string }[] = [
  { severity: 'HIGH', title: 'High risk' },
  { severity: 'MEDIUM', title: 'Medium risk' },
  { severity: 'LOW', title: 'Low risk' },
];

export function RiskPage() {
  const insightsQuery = useInsights();
  const dismiss = useDismissInsight();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FinancialInsight | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const risks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (insightsQuery.data ?? [])
      .filter((i) => i.riskType)
      .filter((i) => !q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [insightsQuery.data, search]);

  const distribution = useMemo(() => {
    const byType = new Map<string, number>();
    for (const r of risks) {
      const label = humanizeEnum(r.riskType);
      byType.set(label, (byType.get(label) ?? 0) + 1);
    }
    return [...byType.entries()].map(([name, value]) => ({ name, value }));
  }, [risks]);

  const openDetails = (insight: FinancialInsight) => {
    setSelected(insight);
    setDrawerOpen(true);
  };
  const handleDismiss = async (id: string) => {
    try {
      await dismiss.mutateAsync(id);
      toast.success('Risk dismissed');
      setDrawerOpen(false);
    } catch {
      toast.error('Could not dismiss');
    }
  };

  return (
    <div>
      <PageHeader title="Risk Analysis" description="Detected financial risks, grouped by severity." />

      {insightsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : insightsQuery.isError ? (
        <ErrorState onRetry={() => insightsQuery.refetch()} />
      ) : (insightsQuery.data ?? []).filter((i) => i.riskType).length === 0 ? (
        <Card>
          <EmptyState icon={ShieldCheck} title="No active risks" description="You're in good standing — no financial risks detected." />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search risks…" className="pl-9" aria-label="Search risks" />
            </div>

            {GROUPS.map(({ severity, title }) => {
              const group = risks.filter((r) => r.severity === severity);
              if (group.length === 0) return null;
              return (
                <section key={severity}>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldAlert className="size-4 text-muted-foreground" aria-hidden />
                    {title}
                    <span className="text-muted-foreground">({group.length})</span>
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.map((risk) => (
                      <FinancialInsightCard key={risk.id} insight={risk} onSelect={openDetails} onDismiss={handleDismiss} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <ChartCard title="Risk distribution" description="By risk type" height={280} isEmpty={distribution.length === 0}>
              <LazyPieChart data={distribution} />
            </ChartCard>
          </div>
        </div>
      )}

      <InsightDetailsDrawer insight={selected} open={drawerOpen} onOpenChange={setDrawerOpen} onDismiss={handleDismiss} />
    </div>
  );
}
