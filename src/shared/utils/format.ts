import { format, isValid, parseISO } from 'date-fns';

/** Format a number as whole Indian Rupees, e.g. ₹1,23,450. */
export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/** Compact currency for chart axes, e.g. ₹12k / ₹1.2L. */
export function formatCompactCurrency(value: number | null | undefined): string {
  const n = value || 0;
  if (Math.abs(n) >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000) return `₹${(n / 1_000).toFixed(0)}k`;
  return `₹${n}`;
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) return isValid(value) ? value : null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

/** Human date, e.g. "12 Jul 2026". Falls back to the raw string if unparseable. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  return date ? format(date, 'd MMM yyyy') : String(value);
}

/** Short date, e.g. "12 Jul". */
export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  return date ? format(date, 'd MMM') : String(value);
}

/** Current month as a `YYYY-MM` param for the expenses API. */
export function currentMonthParam(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Today as `YYYY-MM-DD`. */
export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

/** Month label from a `YYYY-MM` string, e.g. "July 2026". */
export function formatMonthLabel(monthParam: string): string {
  const date = parseISO(`${monthParam}-01`);
  return isValid(date) ? format(date, 'MMMM yyyy') : monthParam;
}
