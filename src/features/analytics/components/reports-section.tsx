'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useMemo } from 'react';
import { useBudgetUsage, useCategoryDistribution, useMonthlySummary } from '@/features/analytics/api';
import { periodLabel, type Period } from '@/features/analytics/time-range';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { toast } from '@/shared/components/ui/toast';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { formatCurrency } from '@/shared/utils/format';

function ExportMenu() {
  const notImplemented = (fmt: string) => toast.info(`${fmt} export is coming soon`);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => notImplemented('CSV')}>
          <FileText />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notImplemented('Excel')}>
          <FileSpreadsheet />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notImplemented('PDF')}>
          <FileText />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ReportsSection({ period }: { period: Period }) {
  const summaryQuery = useMonthlySummary(period.month, period.year);
  const budgetQuery = useBudgetUsage(period.month, period.year);
  const categoryQuery = useCategoryDistribution(period.month, period.year);

  const categories = useMemo(() => categoryQuery.data ?? [], [categoryQuery.data]);
  const budgets = budgetQuery.data ?? [];
  const categoryTotal = useMemo(() => categories.reduce((s, c) => s + c.value, 0), [categories]);
  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Monthly report</h3>
          <p className="text-sm text-muted-foreground">{periodLabel(period)}</p>
        </div>
        <ExportMenu />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total spent" value={formatCurrency(summary?.totalSpent ?? 0)} icon={FileText} loading={summaryQuery.isLoading} />
        <StatCard label="Saved" value={formatCurrency(summary?.totalIncomeSaved ?? 0)} icon={FileText} loading={summaryQuery.isLoading} />
        <StatCard label="Net" value={formatCurrency(summary?.netSavings ?? 0)} icon={FileText} loading={summaryQuery.isLoading} />
        <StatCard label="Top category" value={summary?.topCategory || '—'} icon={FileText} loading={summaryQuery.isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : categories.length === 0 ? (
            <EmptyState icon={FileText} title="No data for this month" description="Add expenses to generate a report." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.value)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {categoryTotal > 0 ? Math.round((c.value / categoryTotal) * 100) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget report</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : budgets.length === 0 ? (
            <EmptyState icon={FileText} title="No budgets" description="Set budgets to see them in your report." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b) => (
                  <TableRow key={b.category}>
                    <TableCell className="font-medium text-foreground">{b.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(b.budget)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(b.spent)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(b.remaining)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
