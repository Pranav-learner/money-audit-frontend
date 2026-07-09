import { format } from 'date-fns';

export interface Period {
  month: number; // 1-12
  year: number;
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function currentPeriod(): Period {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export function previousPeriod(p: Period): Period {
  return p.month === 1 ? { month: 12, year: p.year - 1 } : { month: p.month - 1, year: p.year };
}

export function monthShort(month: number): string {
  return MONTH_NAMES[month] ?? String(month);
}

export function periodLabel(p: Period): string {
  return format(new Date(p.year, p.month - 1, 1), 'MMMM yyyy');
}

/** `YYYY-MM` string ↔ Period, for a native month input. */
export function periodToInput(p: Period): string {
  return `${p.year}-${String(p.month).padStart(2, '0')}`;
}
export function inputToPeriod(value: string): Period {
  const [year, month] = value.split('-').map(Number);
  return { month: month || 1, year: year || new Date().getFullYear() };
}
