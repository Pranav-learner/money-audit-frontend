import type { FormatConfig } from '@/shared/utils/format';

/** All user-controllable preferences. Persisted locally (no backend endpoint exists). */
export interface Preferences {
  // ── General ──
  currency: string; // ISO 4217
  language: string; // BCP-47 primary subtag
  timeZone: string; // IANA tz
  dateFormat: DateFormatKey;
  numberFormat: NumberFormatKey;

  // ── Notification preferences ──
  notifications: {
    financialIntelligence: boolean;
    budgetAlerts: boolean;
    goals: boolean;
    settlements: boolean;
    friendRequests: boolean;
    groupActivity: boolean;
    emailWeekly: boolean;
    emailMonthly: boolean;
    push: boolean;
  };

  // ── Application ──
  compactMode: boolean;
  animations: boolean;
  chartAnimations: boolean;
  defaultLanding: string; // route path
  sidebarBehavior: 'expanded' | 'collapsed' | 'remember';
}

export type DateFormatKey = 'DMY_TEXT' | 'DMY_SLASH' | 'MDY_SLASH' | 'ISO';
export type NumberFormatKey = 'INDIAN' | 'INTERNATIONAL';

export const DEFAULT_PREFERENCES: Preferences = {
  currency: 'INR',
  language: 'en',
  timeZone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata',
  dateFormat: 'DMY_TEXT',
  numberFormat: 'INDIAN',
  notifications: {
    financialIntelligence: true,
    budgetAlerts: true,
    goals: true,
    settlements: true,
    friendRequests: true,
    groupActivity: true,
    emailWeekly: false,
    emailMonthly: false,
    push: false,
  },
  compactMode: false,
  animations: true,
  chartAnimations: true,
  defaultLanding: '/dashboard',
  sidebarBehavior: 'remember',
};

// ── Option catalogues (for Settings selects) ──

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ British Pound (GBP)' },
  { value: 'JPY', label: '¥ Japanese Yen (JPY)' },
  { value: 'AUD', label: 'A$ Australian Dollar (AUD)' },
  { value: 'CAD', label: 'C$ Canadian Dollar (CAD)' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
] as const;

export const DATE_FORMAT_OPTIONS: { value: DateFormatKey; label: string }[] = [
  { value: 'DMY_TEXT', label: '12 Jul 2026' },
  { value: 'DMY_SLASH', label: '12/07/2026' },
  { value: 'MDY_SLASH', label: '07/12/2026' },
  { value: 'ISO', label: '2026-07-12' },
];

export const NUMBER_FORMAT_OPTIONS: { value: NumberFormatKey; label: string }[] = [
  { value: 'INDIAN', label: 'Indian (1,23,456)' },
  { value: 'INTERNATIONAL', label: 'International (123,456)' },
];

export const TIMEZONE_OPTIONS = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'UTC',
] as const;

export const LANDING_OPTIONS = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/expenses', label: 'Expenses' },
  { value: '/analytics', label: 'Analytics' },
  { value: '/intelligence', label: 'Financial Intelligence' },
  { value: '/groups', label: 'Groups' },
] as const;

const DATE_PATTERNS: Record<DateFormatKey, { datePattern: string; shortDatePattern: string }> = {
  DMY_TEXT: { datePattern: 'd MMM yyyy', shortDatePattern: 'd MMM' },
  DMY_SLASH: { datePattern: 'dd/MM/yyyy', shortDatePattern: 'dd/MM' },
  MDY_SLASH: { datePattern: 'MM/dd/yyyy', shortDatePattern: 'MM/dd' },
  ISO: { datePattern: 'yyyy-MM-dd', shortDatePattern: 'MM-dd' },
};

/** Translate preferences into the low-level FormatConfig consumed by format.ts. */
export function toFormatConfig(prefs: Preferences): FormatConfig {
  const locale = prefs.numberFormat === 'INDIAN' ? 'en-IN' : `${prefs.language || 'en'}-US`;
  return {
    currency: prefs.currency,
    locale,
    ...DATE_PATTERNS[prefs.dateFormat],
  };
}
