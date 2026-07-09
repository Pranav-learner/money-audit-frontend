import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export const metadata = { title: 'Unauthorized — Money Audit' };

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-warning/12 text-warning">
        <ShieldAlert className="size-7" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Access denied</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You don’t have permission to view this page, or your session has expired.
        </p>
      </div>
      <Button asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    </div>
  );
}
