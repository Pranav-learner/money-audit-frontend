'use client';

import { Activity, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDismissInsight, useInsights, useMarkInsightRead } from '@/features/intelligence/api';
import { FinancialInsightCard } from '@/features/intelligence/components/financial-insight-card';
import { InsightDetailsDrawer } from '@/features/intelligence/components/insight-details-drawer';
import type { FinancialInsight } from '@/lib/services/insights';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';

const SEV_WEIGHT: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

export function InsightsPage() {
  const insightsQuery = useInsights();
  const dismiss = useDismissInsight();
  const markRead = useMarkInsightRead();

  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selected, setSelected] = useState<FinancialInsight | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const insights = useMemo(() => (insightsQuery.data ?? []).filter((i) => !i.riskType), [insightsQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = insights.filter((i) => {
      const matchesSearch = !q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q);
      const matchesSeverity = severity === 'all' || i.severity === severity;
      return matchesSearch && matchesSeverity;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'severity') return (SEV_WEIGHT[b.severity] ?? 0) - (SEV_WEIGHT[a.severity] ?? 0);
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [insights, search, severity, sortBy]);

  const openDetails = (insight: FinancialInsight) => {
    setSelected(insight);
    setDrawerOpen(true);
    if (!insight.viewed) markRead.mutate(insight.id);
  };
  const handleDismiss = async (id: string) => {
    try {
      await dismiss.mutateAsync(id);
      toast.success('Insight dismissed');
      setDrawerOpen(false);
    } catch {
      toast.error('Could not dismiss');
    }
  };

  return (
    <div>
      <PageHeader title="Spending Insights" description="Personalized observations about your spending behaviour." />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search insights…" className="pl-9" aria-label="Search insights" />
          </div>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger aria-label="Severity" className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger aria-label="Sort" className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {insightsQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : insightsQuery.isError ? (
        <ErrorState onRetry={() => insightsQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Activity} title="No insights yet" description="As you track expenses, personalized insights will appear here." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((insight) => (
            <FinancialInsightCard key={insight.id} insight={insight} onSelect={openDetails} onMarkRead={(id) => markRead.mutate(id)} onDismiss={handleDismiss} />
          ))}
        </div>
      )}

      <InsightDetailsDrawer insight={selected} open={drawerOpen} onOpenChange={setDrawerOpen} onDismiss={handleDismiss} />
    </div>
  );
}
