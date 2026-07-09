import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface SpinnerProps {
  className?: string;
  /** Accessible label announced to screen readers. */
  label?: string;
  size?: number;
}

/** Accessible loading spinner. */
function Spinner({ className, label = 'Loading', size = 20 }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center', className)}>
      <Loader2 className="animate-spin text-muted-foreground" style={{ width: size, height: size }} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
