'use client';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { currentPeriod, inputToPeriod, periodToInput, previousPeriod, type Period } from '@/features/analytics/time-range';

function sameMonth(a: Period, b: Period) {
  return a.month === b.month && a.year === b.year;
}

/** Month/period selector that drives every visualisation on a page. */
export function TimeFilter({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  const now = currentPeriod();
  const last = previousPeriod(now);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="month"
        value={periodToInput(period)}
        max={periodToInput(now)}
        onChange={(e) => e.target.value && onChange(inputToPeriod(e.target.value))}
        className="w-40"
        aria-label="Select month"
      />
      <Button variant={sameMonth(period, now) ? 'default' : 'outline'} size="sm" onClick={() => onChange(now)}>
        This month
      </Button>
      <Button variant={sameMonth(period, last) ? 'default' : 'outline'} size="sm" onClick={() => onChange(last)}>
        Last month
      </Button>
    </div>
  );
}
