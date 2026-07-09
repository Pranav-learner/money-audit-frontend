'use client';

import { useState } from 'react';
import { ApplicationSettings } from '@/features/settings/sections/application-settings';
import { GeneralSettings } from '@/features/settings/sections/general-settings';
import { NotificationSettings } from '@/features/settings/sections/notification-settings';
import { SecuritySettings } from '@/features/settings/sections/security-settings';
import { PageHeader } from '@/shared/components/common/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export function SettingsPage() {
  const [tab, setTab] = useState('general');

  return (
    <div>
      <PageHeader title="Settings" description="Manage your preferences, notifications and security." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex w-full flex-wrap justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="application">
          <ApplicationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
