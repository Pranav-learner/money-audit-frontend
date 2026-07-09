import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

/** A single labelled setting: title + description on the left, control on the right. */
export function SettingRow({
  title,
  description,
  htmlFor,
  control,
  className,
}: {
  title: string;
  description?: string;
  htmlFor?: string;
  control: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0 pr-4">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
          {title}
        </label>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0 sm:min-w-56">{control}</div>
    </div>
  );
}
