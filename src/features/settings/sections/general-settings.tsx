'use client';

import { useTheme } from 'next-themes';
import { SettingRow } from '@/features/settings/components/setting-row';
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  NUMBER_FORMAT_OPTIONS,
  TIMEZONE_OPTIONS,
} from '@/shared/lib/preferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useMounted } from '@/shared/hooks/use-mounted';
import { usePreferences } from '@/shared/providers/preferences-provider';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function GeneralSettings() {
  const { preferences, update } = usePreferences();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">General</CardTitle>
        <CardDescription>Regional formatting and appearance. Applied instantly across the app.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border pt-0">
        <SettingRow
          title="Theme"
          description="Choose a light or dark appearance, or match your system."
          control={
            <Select value={mounted ? (theme ?? 'system') : undefined} onValueChange={setTheme}>
              <SelectTrigger aria-label="Theme">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          title="Currency"
          description="Used to display all monetary amounts."
          control={
            <Select value={preferences.currency} onValueChange={(v) => update({ currency: v })}>
              <SelectTrigger aria-label="Currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          title="Language"
          description="Interface language preference."
          control={
            <Select value={preferences.language} onValueChange={(v) => update({ language: v })}>
              <SelectTrigger aria-label="Language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          title="Time zone"
          description="Used when showing dates and times."
          control={
            <Select value={preferences.timeZone} onValueChange={(v) => update({ timeZone: v })}>
              <SelectTrigger aria-label="Time zone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          title="Date format"
          description="How dates appear throughout the app."
          control={
            <Select value={preferences.dateFormat} onValueChange={(v) => update({ dateFormat: v as never })}>
              <SelectTrigger aria-label="Date format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMAT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          title="Number format"
          description="Digit grouping style for amounts."
          control={
            <Select value={preferences.numberFormat} onValueChange={(v) => update({ numberFormat: v as never })}>
              <SelectTrigger aria-label="Number format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUMBER_FORMAT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </CardContent>
    </Card>
  );
}
