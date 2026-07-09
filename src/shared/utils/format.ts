import { format, isValid, parseISO } from 'date-fns';

/**
 * Formatting is driven by a mutable module-level config so a user's Settings
 * preferences (currency / number / date format) apply everywhere the shared
 * formatters are used, without every call site needing to read the store.
 * `PreferencesProvider` calls `setFormatConfig` whenever preferences change.
 */
export interface FormatConfig {
  /** ISO 4217 currency code, e.g. "INR". */
  currency: string;
  /** BCP-47 locale controlling digit grouping, e.g. "en-IN". */
  locale: string;
  /** date-fns pattern for long dates. */
  datePattern: string;
  /** date-fns pattern for short dates. */
  shortDatePattern: string;
}

const config: FormatConfig = {
  currency: 'INR',
  locale: 'en-IN',
  datePattern: 'd MMM yyyy',
  shortDatePattern: 'd MMM',
};

/** Currency symbols for the compact formatter (Intl handles the rest). */
const CURRENCY_SYMBOL: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

export function setFormatConfig(partial: Partial<FormatConfig>): void {
  Object.assign(config, partial);
}

export function getFormatConfig(): Readonly<FormatConfig> {
  return config;
}

/** Format a number as whole currency in the user's preferred currency/locale. */
export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/** Plain grouped number in the user's locale, e.g. "1,23,450". */
export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat(config.locale).format(value || 0);
}

/** Compact currency for chart axes, e.g. ₹12k / ₹1.2L (Indian) or $12k / $1.2M. */
export function formatCompactCurrency(value: number | null | undefined): string {
  const n = value || 0;
  const symbol = CURRENCY_SYMBOL[config.currency] ?? '';
  const indian = config.locale.endsWith('-IN');
  const abs = Math.abs(n);
  if (indian) {
    if (abs >= 10_000_000) return `${symbol}${(n / 10_000_000).toFixed(1)}Cr`;
    if (abs >= 100_000) return `${symbol}${(n / 100_000).toFixed(1)}L`;
    if (abs >= 1_000) return `${symbol}${(n / 1_000).toFixed(0)}k`;
    return `${symbol}${n}`;
  }
  if (abs >= 1_000_000_000) return `${symbol}${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${symbol}${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${(n / 1_000).toFixed(0)}k`;
  return `${symbol}${n}`;
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) return isValid(value) ? value : null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

/** Human date in the user's preferred pattern, e.g. "12 Jul 2026". */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  return date ? format(date, config.datePattern) : String(value);
}

/** Short date, e.g. "12 Jul". */
export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  return date ? format(date, config.shortDatePattern) : String(value);
}

/** Relative time, e.g. "just now", "3h ago", "2d ago". Falls back to a short date. */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  if (!date) return String(value);
  const diffMs = Date.now() - date.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatShortDate(date);
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
