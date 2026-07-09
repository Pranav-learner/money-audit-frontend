'use client';

import { CalendarClock, Lightbulb, PiggyBank, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  useCompleteRecommendation,
  useDismissRecommendation,
  useRecommendationHistory,
  useRecommendationSummary,
  useRecommendations,
} from '@/features/intelligence/api';
import { RecommendationCard } from '@/features/intelligence/components/recommendation-card';
import { ErrorState } from '@/shared/components/common/error-state';
import { PageHeader } from '@/shared/components/common/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from '@/shared/components/ui/toast';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency } from '@/shared/utils/format';

const PRIORITY_WEIGHT: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export function RecommendationsPage() {
  const listQuery = useRecommendations();
  const summaryQuery = useRecommendationSummary();
  const historyQuery = useRecommendationHistory();
  const dismiss = useDismissRecommendation();
  const complete = useCompleteRecommendation();

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const summary = summaryQuery.data;

  const active = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (listQuery.data ?? []).filter((r) => {
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchesPriority = priority === 'all' || r.priority === priority;
      return matchesSearch && matchesPriority;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'savings') return (b.expectedMonthlySaving ?? 0) - (a.expectedMonthlySaving ?? 0);
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      return (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
    });
  }, [listQuery.data, search, priority, sortBy]);

  const history = historyQuery.data ?? [];

  const act = async (fn: typeof dismiss, id: string, msg: string) => {
    try {
      await fn.mutateAsync(id);
      toast.success(msg);
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div>
      <PageHeader title="Recommendations" description="Personalized ways to improve your finances." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Potential monthly savings" value={formatCurrency(summary?.potentialMonthlySavings ?? 0)} icon={PiggyBank} loading={summaryQuery.isLoading} />
        <StatCard label="Potential annual savings" value={formatCurrency(summary?.potentialAnnualSavings ?? 0)} icon={CalendarClock} loading={summaryQuery.isLoading} />
        <StatCard label="Active recommendations" value={String(summary?.activeCount ?? 0)} icon={Lightbulb} loading={summaryQuery.isLoading} />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="mb-4">
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recommendations…" className="pl-9" aria-label="Search recommendations" />
              </div>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger aria-label="Priority" className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
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
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {listQuery.isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full" />
              ))}
            </div>
          ) : listQuery.isError ? (
            <ErrorState onRetry={() => listQuery.refetch()} />
          ) : active.length === 0 ? (
            <Card>
              <EmptyState icon={Lightbulb} title="No recommendations" description="Nothing to improve right now — you're on track!" />
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {active.map((r) => (
                <RecommendationCard
                  key={r.id}
                  recommendation={r}
                  onDismiss={(id) => act(dismiss, id, 'Recommendation dismissed')}
                  onComplete={(id) => act(complete, id, 'Marked as done')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyQuery.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : history.length === 0 ? (
            <Card>
              <EmptyState icon={Lightbulb} title="No history yet" description="Completed and dismissed recommendations will appear here." />
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {history.map((r) => (
                <RecommendationCard key={r.id} recommendation={r} readOnly />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
