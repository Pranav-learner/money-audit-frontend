'use client';

import {
  AlertTriangle,
  Bell,
  Check,
  HeartPulse,
  Lightbulb,
  LineChart,
  Sparkles,
  Target,
  UserPlus,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { formatRelativeTime } from '@/shared/utils/format';
import type { AppNotification } from '../types';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Risk: AlertTriangle,
  Health: HeartPulse,
  Recommendation: Sparkles,
  Forecast: LineChart,
  Goal: Target,
  Budget: Wallet,
  Insight: Lightbulb,
  'Friend request': UserPlus,
  'Group invite': Users,
};

const TONE_TEXT: Record<string, string> = {
  destructive: 'text-destructive',
  warning: 'text-warning',
  info: 'text-accent',
  success: 'text-success',
  default: 'text-primary',
};

export interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead?: (n: AppNotification) => void;
  onDismiss?: (n: AppNotification) => void;
  onAccept?: (n: AppNotification) => void;
  onDecline?: (n: AppNotification) => void;
  onNavigate?: () => void;
  actionPending?: boolean;
  compact?: boolean;
}

export function NotificationItem({
  notification: n,
  onMarkRead,
  onDismiss,
  onAccept,
  onDecline,
  onNavigate,
  actionPending,
  compact,
}: NotificationItemProps) {
  const Icon = CATEGORY_ICON[n.category] ?? Bell;
  const toneText = TONE_TEXT[n.tone] ?? TONE_TEXT.default;

  const body = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary', toneText)}>
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('truncate text-sm font-medium text-foreground', !n.read && 'font-semibold')}>{n.title}</p>
          {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <p className={cn('mt-0.5 text-sm text-muted-foreground', compact ? 'line-clamp-2' : '')}>{n.message}</p>
        {n.actionSuggestion && !compact && (
          <p className={cn('mt-1 flex items-start gap-1.5 text-xs', toneText)}>
            <Lightbulb className="mt-0.5 size-3 shrink-0" aria-hidden />
            {n.actionSuggestion}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {n.category}
          {n.createdAt ? ` · ${formatRelativeTime(n.createdAt)}` : ' · Pending'}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3 transition-colors',
        !n.read && 'border-l-2 border-l-primary',
      )}
    >
      <div className="flex items-start gap-2">
        {n.href && !n.actionable ? (
          <Link
            href={n.href}
            onClick={() => {
              onMarkRead?.(n);
              onNavigate?.();
            }}
            className="min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {body}
          </Link>
        ) : (
          body
        )}

        {!n.actionable && (
          <div className="flex shrink-0 items-center gap-0.5">
            {!n.read && onMarkRead && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mark as read"
                className="size-7 text-muted-foreground"
                onClick={() => onMarkRead(n)}
              >
                <Check className="size-4" />
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Dismiss notification"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDismiss(n)}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {n.actionable && (
        <div className="mt-3 flex gap-2 pl-12">
          <Button size="sm" className="flex-1" loading={actionPending} onClick={() => onAccept?.(n)}>
            <Check className="size-3.5" />
            Accept
          </Button>
          <Button size="sm" variant="outline" className="flex-1" disabled={actionPending} onClick={() => onDecline?.(n)}>
            <X className="size-3.5" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
