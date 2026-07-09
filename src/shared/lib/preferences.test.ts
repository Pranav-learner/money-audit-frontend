import { describe, expect, it } from 'vitest';
import { DEFAULT_PREFERENCES, toFormatConfig } from './preferences';

describe('toFormatConfig', () => {
  it('maps the default (Indian) preferences', () => {
    const cfg = toFormatConfig(DEFAULT_PREFERENCES);
    expect(cfg.currency).toBe('INR');
    expect(cfg.locale).toBe('en-IN');
    expect(cfg.datePattern).toBe('d MMM yyyy');
  });

  it('uses an international locale for international number format', () => {
    const cfg = toFormatConfig({ ...DEFAULT_PREFERENCES, numberFormat: 'INTERNATIONAL', language: 'en' });
    expect(cfg.locale).toBe('en-US');
  });

  it('translates the date-format key into a date-fns pattern', () => {
    expect(toFormatConfig({ ...DEFAULT_PREFERENCES, dateFormat: 'ISO' }).datePattern).toBe('yyyy-MM-dd');
    expect(toFormatConfig({ ...DEFAULT_PREFERENCES, dateFormat: 'MDY_SLASH' }).datePattern).toBe('MM/dd/yyyy');
  });

  it('carries the chosen currency through', () => {
    expect(toFormatConfig({ ...DEFAULT_PREFERENCES, currency: 'EUR' }).currency).toBe('EUR');
  });
});
