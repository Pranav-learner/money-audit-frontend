import { afterEach, describe, expect, it } from 'vitest';
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  setFormatConfig,
} from './format';

const INR = { currency: 'INR', locale: 'en-IN', datePattern: 'd MMM yyyy', shortDatePattern: 'd MMM' };

afterEach(() => setFormatConfig(INR));

describe('formatCurrency', () => {
  it('formats INR with the Indian grouping by default', () => {
    expect(formatCurrency(123456)).toContain('₹');
    expect(formatCurrency(123456)).toContain('1,23,456');
  });

  it('coerces null/undefined to zero', () => {
    expect(formatCurrency(null)).toContain('0');
    expect(formatCurrency(undefined)).toContain('0');
  });

  it('respects a changed currency preference', () => {
    setFormatConfig({ currency: 'USD', locale: 'en-US' });
    expect(formatCurrency(1000).startsWith('$')).toBe(true);
    expect(formatCurrency(1000)).toContain('1,000');
  });
});

describe('formatCompactCurrency', () => {
  it('uses Indian units (L/Cr) for en-IN', () => {
    expect(formatCompactCurrency(150000)).toBe('₹1.5L');
    expect(formatCompactCurrency(12000)).toBe('₹12k');
  });

  it('uses international units (k/M) otherwise', () => {
    setFormatConfig({ currency: 'USD', locale: 'en-US' });
    expect(formatCompactCurrency(1500000)).toBe('$1.5M');
  });
});

describe('formatNumber', () => {
  it('groups digits by locale', () => {
    expect(formatNumber(1234567)).toBe('12,34,567');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for very recent times', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('falls back to a dash for empty input', () => {
    expect(formatRelativeTime(undefined)).toBe('—');
  });
});
