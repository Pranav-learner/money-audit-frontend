import { BarChart3 } from 'lucide-react';
import { PagePlaceholder } from '@/shared/components/common/page-placeholder';

export default function AnalyticsPage() {
  return (
    <PagePlaceholder
      title="Analytics"
      icon={BarChart3}
      description="Understand where your money goes with rich, interactive analytics."
      highlights={[
        'Spending by category, trends and month-over-month comparisons',
        'Income vs. expense breakdowns and savings rate',
        'Exportable reports powered by the Analytics engine',
      ]}
    />
  );
}
