import { Ban } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export const metadata = { title: 'Forbidden — Money Audit' };

/** 403 — the user is authenticated but lacks permission for this resource. */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
        <Ban className="size-7" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Access forbidden</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You don’t have permission to view this resource. If you think this is a mistake, contact an
          administrator.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
