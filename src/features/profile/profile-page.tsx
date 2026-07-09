'use client';

import { Camera, HeartPulse, PiggyBank, Target, Trash2, TrendingDown, Users, UsersRound } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { useDashboardSummary } from '@/features/dashboard/api';
import { useFriends } from '@/features/friends/api';
import { useGroups } from '@/features/groups/api';
import { useGoals, useHealthScore } from '@/features/intelligence/api';
import { useProfile } from '@/features/profile/use-profile';
import { PageHeader } from '@/shared/components/common/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/ui/toast';
import { StatCard } from '@/shared/components/widgets/stat-card';
import { useZodForm } from '@/shared/lib/use-zod-form';
import { initialsOf } from '@/shared/utils/initials';
import { formatCurrency } from '@/shared/utils/format';

const MAX_AVATAR_BYTES = 1_500_000;

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  phone: z
    .string()
    .max(20)
    .refine((v) => v === '' || /^[+\d][\d\s-]{6,}$/.test(v), 'Enter a valid phone number'),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const profile = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);

  const summary = useDashboardSummary();
  const goals = useGoals();
  const health = useHealthScore();
  const friends = useFriends();
  const groups = useGroups();

  const form = useZodForm(profileSchema, { defaultValues: { name: profile.name, phone: profile.phone } });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const activeGoals = useMemo(() => (goals.data ?? []).filter((g) => g.status !== 'COMPLETED').length, [goals.data]);

  const startEdit = () => {
    reset({ name: profile.name, phone: profile.phone });
    setEditing(true);
  };

  const onSubmit = handleSubmit((values: ProfileValues) => {
    profile.save({ name: values.name.trim(), phone: values.phone.trim() });
    toast.success('Profile updated on this device');
    setEditing(false);
  });

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Image is too large (max 1.5 MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      profile.save({ avatarDataUrl: String(reader.result) });
      toast.success('Photo updated');
    };
    reader.onerror = () => toast.error('Could not read image');
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <PageHeader title="Profile" description="Your account details and a snapshot of your activity." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="relative">
              <Avatar className="size-24">
                {profile.avatarDataUrl && <AvatarImage src={profile.avatarDataUrl} alt="" />}
                <AvatarFallback className="text-2xl">{initialsOf(profile.name)}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Camera className="size-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onPickAvatar} aria-hidden />
            </div>

            <div>
              <p className="text-lg font-semibold text-foreground">{profile.name || 'Your name'}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>

            {profile.avatarDataUrl && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={profile.clearAvatar}>
                <Trash2 className="size-4" />
                Remove photo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Details / edit */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Account information</CardTitle>
            {!editing && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                Edit profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={onSubmit} className="space-y-4">
                <FormItem>
                  <FormLabel required>Full name</FormLabel>
                  <Input {...register('name')} aria-invalid={!!errors.name} />
                  <FormMessage>{errors.name?.message}</FormMessage>
                </FormItem>
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <Input {...register('phone')} placeholder="+91 98765 43210" aria-invalid={!!errors.phone} />
                  <FormMessage>{errors.phone?.message}</FormMessage>
                </FormItem>
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input value={profile.email} disabled readOnly />
                  <p className="text-xs text-muted-foreground">Email is tied to your login and can&apos;t be changed here.</p>
                </FormItem>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={isSubmitting}>
                    Save changes
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="divide-y divide-border">
                <Row label="Full name" value={profile.name || '—'} />
                <Row label="Email" value={profile.email || '—'} />
                <Row label="Phone" value={profile.phone || 'Not set'} />
                <Row
                  label="Account ID"
                  value={<span className="font-mono text-xs">{profile.id || '—'}</span>}
                />
              </dl>
            )}
            {profile.hasOverride && !editing && (
              <p className="mt-4 rounded-lg bg-secondary/60 p-2.5 text-xs text-muted-foreground">
                Profile edits are saved on this device. Server-side profile updates will be available when the backend
                supports them.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <h2 className="mb-3 mt-8 text-sm font-medium text-muted-foreground">Your activity</h2>
      {summary.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="This month's spending" value={formatCurrency(summary.data?.monthlyExpenses ?? 0)} icon={TrendingDown} />
          <StatCard label="Total savings" value={formatCurrency(summary.data?.totalSavings ?? 0)} icon={PiggyBank} />
          <StatCard
            label="Health score"
            value={health.data ? `${Math.round(health.data.score)}/100` : '—'}
            icon={HeartPulse}
            loading={health.isLoading}
          />
          <StatCard label="Active goals" value={String(activeGoals)} icon={Target} loading={goals.isLoading} />
          <StatCard label="Friends" value={String(friends.data?.length ?? 0)} icon={Users} loading={friends.isLoading} />
          <StatCard label="Groups" value={String(groups.data?.length ?? 0)} icon={UsersRound} loading={groups.isLoading} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
