'use client';

import { useState } from 'react';
import { ActivityTimeline } from '@/features/analytics/components/activity-timeline';
import { BudgetsSection } from '@/features/analytics/components/budgets-section';
import { CategoriesSection } from '@/features/analytics/components/categories-section';
import { ComparisonStrip } from '@/features/analytics/components/comparison-strip';
import { ReportsSection } from '@/features/analytics/components/reports-section';
import { SavingsSection } from '@/features/analytics/components/savings-section';
import { SpendingSection } from '@/features/analytics/components/spending-section';
import { SplitwiseSection } from '@/features/analytics/components/splitwise-section';
import { TimeFilter } from '@/features/analytics/components/time-filter';
import { currentPeriod } from '@/features/analytics/time-range';
import { PageHeader } from '@/shared/components/common/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

const TABS = [
  { value: 'spending', label: 'Spending' },
  { value: 'budgets', label: 'Budgets' },
  { value: 'savings', label: 'Savings' },
  { value: 'categories', label: 'Categories' },
  { value: 'splitwise', label: 'Splitwise' },
  { value: 'reports', label: 'Reports' },
];

export function AnalyticsPage() {
  const [period, setPeriod] = useState(currentPeriod());

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep insight into your spending, savings and balances."
        actions={<TimeFilter period={period} onChange={setPeriod} />}
      />

      <ComparisonStrip period={period} />

      <Tabs defaultValue="spending" className="mt-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="spending">
          <SpendingSection period={period} />
        </TabsContent>
        <TabsContent value="budgets">
          <BudgetsSection period={period} />
        </TabsContent>
        <TabsContent value="savings">
          <SavingsSection period={period} />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesSection period={period} />
        </TabsContent>
        <TabsContent value="splitwise">
          <SplitwiseSection period={period} />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsSection period={period} />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <ActivityTimeline />
      </div>
    </div>
  );
}
