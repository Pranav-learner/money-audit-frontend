import { Compass } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/shared/components/common/back-button';
import { Button } from '@/shared/components/ui/button';

export const metadata = { title: 'Page not found — Money Audit' };

export default function NotFound() {
  return (
    <main
      role="main"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Compass className="size-7" aria-hidden />
      </div>
      <p className="text-6xl font-bold tracking-tight text-primary" aria-hidden>
        404
      </p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <BackButton />
      </div>
    </main>
  );
}
