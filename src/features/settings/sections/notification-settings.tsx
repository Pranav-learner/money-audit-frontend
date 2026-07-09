'use client';

import { SettingRow } from '@/features/settings/components/setting-row';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import type { Preferences } from '@/shared/lib/preferences';
import { usePreferences } from '@/shared/providers/preferences-provider';

type NotifKey = keyof Preferences['notifications'];

const TOGGLES: { key: NotifKey; title: string; description: string }[] = [
  { key: 'financialIntelligence', title: 'Financial Intelligence', description: 'Insights, risks and recommendations from the engine.' },
  { key: 'budgetAlerts', title: 'Budget alerts', description: 'When you approach or exceed a budget.' },
  { key: 'goals', title: 'Goal updates', description: 'Progress and milestones on your savings goals.' },
  { key: 'settlements', title: 'Settlement reminders', description: 'Pending settle-ups with friends and groups.' },
  { key: 'friendRequests', title: 'Friend requests', description: 'When someone wants to connect.' },
  { key: 'groupActivity', title: 'Group activity', description: 'Invitations and shared-expense updates.' },
];

const EMAIL: { key: NotifKey; title: string; description: string }[] = [
  { key: 'emailWeekly', title: 'Weekly report', description: 'A summary of your week, by email.' },
  { key: 'emailMonthly', title: 'Monthly report', description: 'A deeper monthly review, by email.' },
];

export function NotificationSettings() {
  const { preferences, update } = usePreferences();
  const set = (key: NotifKey, value: boolean) => update({ notifications: { [key]: value } });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">In-app notifications</CardTitle>
          <CardDescription>Choose what shows up in your notification center and bell.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border pt-0">
          {TOGGLES.map((t) => (
            <SettingRow
              key={t.key}
              title={t.title}
              description={t.description}
              control={
                <div className="sm:flex sm:justify-end">
                  <Switch
                    checked={preferences.notifications[t.key]}
                    onCheckedChange={(v) => set(t.key, v)}
                    aria-label={t.title}
                  />
                </div>
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email reports</CardTitle>
          <CardDescription>Periodic summaries delivered to your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border pt-0">
          {EMAIL.map((t) => (
            <SettingRow
              key={t.key}
              title={t.title}
              description={t.description}
              control={
                <div className="sm:flex sm:justify-end">
                  <Switch
                    checked={preferences.notifications[t.key]}
                    onCheckedChange={(v) => set(t.key, v)}
                    aria-label={t.title}
                  />
                </div>
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Push notifications</CardTitle>
          <CardDescription>Browser push isn&apos;t enabled yet — this preference is saved for when it launches.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <SettingRow
            title="Enable push notifications"
            description="Get alerts even when Money Audit isn't open."
            control={
              <div className="sm:flex sm:justify-end">
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={(v) => set('push', v)}
                  aria-label="Push notifications"
                />
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
