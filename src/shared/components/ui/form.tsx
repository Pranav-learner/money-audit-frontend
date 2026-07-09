'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/cn';

/** Vertical spacing wrapper for a single form field (label + control + message). */
function FormItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1.5', className)} {...props} />;
}

interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  required?: boolean;
}

function FormLabel({ className, children, required, ...props }: FormLabelProps) {
  return (
    <Label className={className} {...props}>
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
  );
}

/** Renders a field-level validation error; returns nothing when there's no message. */
function FormMessage({ children, className }: { children?: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className={cn('text-xs font-medium text-destructive', className)}>
      {children}
    </p>
  );
}

/** Small helper text shown under a control. */
function FormHint({ children, className }: { children?: ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={cn('text-xs text-muted-foreground', className)}>{children}</p>;
}

export { FormItem, FormLabel, FormMessage, FormHint };
