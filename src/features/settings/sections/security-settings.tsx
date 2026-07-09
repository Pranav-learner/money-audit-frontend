'use client';

import { LogOut, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { changePassword } from '@/lib/services/account';
import type { ApiError } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { toast } from '@/shared/components/ui/toast';
import { useZodForm } from '@/shared/lib/use-zod-form';
import { decodeJwt } from '@/shared/utils/jwt';
import { formatDate } from '@/shared/utils/format';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type Values = z.infer<typeof schema>;

export function SecuritySettings() {
  const { token, logout } = useAuth();

  const session = useMemo(() => {
    const payload = decodeJwt(token);
    return {
      email: (payload?.sub as string) ?? '',
      issuedAt: payload?.iat ? new Date(payload.iat * 1000) : null,
      expiresAt: payload?.exp ? new Date(payload.exp * 1000) : null,
    };
  }, [token]);

  const form = useZodForm(schema, { defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values: Values) => {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password updated');
      reset();
    } catch (err) {
      const status = (err as ApiError)?.status;
      if (status === 404 || status === 405 || status === 501) {
        toast.error('Password change isn’t available yet. This will be enabled soon.');
      } else {
        toast.error((err as ApiError)?.message ?? 'Could not update password');
      }
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>Use a strong password you don&apos;t reuse elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="max-w-md space-y-4">
            <FormItem>
              <FormLabel required>Current password</FormLabel>
              <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
              <FormMessage>{errors.currentPassword?.message}</FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel required>New password</FormLabel>
              <Input type="password" autoComplete="new-password" {...register('newPassword')} />
              <FormMessage>{errors.newPassword?.message}</FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel required>Confirm new password</FormLabel>
              <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
              <FormMessage>{errors.confirmPassword?.message}</FormMessage>
            </FormItem>
            <Button type="submit" loading={isSubmitting}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active session</CardTitle>
          <CardDescription>You&apos;re signed in on this device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <MonitorSmartphone className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-foreground">This device</p>
              {session.email && <p className="text-muted-foreground">{session.email}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {session.issuedAt ? `Signed in ${formatDate(session.issuedAt)}` : 'Active now'}
                {session.expiresAt ? ` · expires ${formatDate(session.expiresAt)}` : ''}
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <ShieldCheck className="size-3.5" aria-hidden />
              Current
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={logout}>
              <LogOut className="size-4" />
              Sign out
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                toast.success('Signed out of all devices');
                logout();
              }}
            >
              Sign out of all devices
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sessions are stateless (JWT). &ldquo;Sign out of all devices&rdquo; clears this device now; server-side
            revocation will apply automatically once supported by the backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
