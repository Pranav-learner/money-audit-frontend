'use client';

import { RotateCcw } from 'lucide-react';
import { SettingRow } from '@/features/settings/components/setting-row';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { toast } from '@/shared/components/ui/toast';
import { LANDING_OPTIONS } from '@/shared/lib/preferences';
import { usePreferences } from '@/shared/providers/preferences-provider';

const SIDEBAR_OPTIONS = [
  { value: 'remember', label: 'Remember last state' },
  { value: 'expanded', label: 'Always expanded' },
  { value: 'collapsed', label: 'Always collapsed' },
];

export function ApplicationSettings() {
  const { preferences, update, reset } = usePreferences();

  const handleReset = () => {
    reset();
    toast.success('Preferences reset to defaults');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Application</CardTitle>
        <CardDescription>Fine-tune density, motion and navigation behaviour.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border pt-0">
        <SettingRow
          title="Compact mode"
          description="Reduce spacing to fit more on screen."
          control={
            <div className="sm:flex sm:justify-end">
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={(v) => update({ compactMode: v })}
                aria-label="Compact mode"
              />
            </div>
          }
        />
        <SettingRow
          title="Interface animations"
          description="Motion and transitions across the app. Off also respects reduced-motion."
          control={
            <div className="sm:flex sm:justify-end">
              <Switch
                checked={preferences.animations}
                onCheckedChange={(v) => update({ animations: v })}
                aria-label="Interface animations"
              />
            </div>
          }
        />
        <SettingRow
          title="Chart animations"
          description="Animate charts as they load."
          control={
            <div className="sm:flex sm:justify-end">
              <Switch
                checked={preferences.chartAnimations}
                onCheckedChange={(v) => update({ chartAnimations: v })}
                aria-label="Chart animations"
              />
            </div>
          }
        />
        <SettingRow
          title="Default landing page"
          description="Where Money Audit opens after you sign in."
          control={
            <Select value={preferences.defaultLanding} onValueChange={(v) => update({ defaultLanding: v })}>
              <SelectTrigger aria-label="Default landing page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANDING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          title="Sidebar behaviour"
          description="How the desktop sidebar behaves on load."
          control={
            <Select value={preferences.sidebarBehavior} onValueChange={(v) => update({ sidebarBehavior: v as never })}>
              <SelectTrigger aria-label="Sidebar behaviour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIDEBAR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm font-medium text-foreground">Reset preferences</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Restore all settings to their defaults.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
