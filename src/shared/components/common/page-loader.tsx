import { Spinner } from '@/shared/components/ui/spinner';
import { cn } from '@/shared/utils/cn';

/** Full-height centered loader for route/session transitions. */
export function PageLoader({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex min-h-[60vh] w-full items-center justify-center', className)}>
      <Spinner size={28} label={label} />
    </div>
  );
}
