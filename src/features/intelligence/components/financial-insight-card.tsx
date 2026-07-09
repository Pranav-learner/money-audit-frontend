'use client';

import { motion } from 'framer-motion';
import { Check, Lightbulb, X } from 'lucide-react';
import type { FinancialInsight } from '@/lib/services/insights';
import { confidenceLabel, humanizeEnum, severityMeta } from '@/features/intelligence/lib/display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/utils/format';

export interface FinancialInsightCardProps {
  insight: FinancialInsight;
  onSelect?: (insight: FinancialInsight) => void;
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function FinancialInsightCard({ insight, onSelect, onMarkRead, onDismiss }: FinancialInsightCardProps) {
  const sev = severityMeta(insight.severity);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn('transition-shadow hover:shadow-md', !insight.viewed && 'ring-1 ring-primary/25')}>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={sev.variant}>{sev.label}</Badge>
              {insight.category && <Badge variant="secondary">{insight.category}</Badge>}
              {!insight.viewed && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">{formatDate(insight.createdAt)}</time>
          </div>

          <button type="button" onClick={() => onSelect?.(insight)} className="block w-full text-left">
            <p className="font-medium text-foreground">{insight.title}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{insight.description}</p>
          </button>

          {insight.actionSuggestion && (
            <div className="flex items-start gap-2 rounded-lg bg-primary/8 p-2.5 text-xs text-foreground">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              {insight.actionSuggestion}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {humanizeEnum(insight.insightType)} • {confidenceLabel(insight.confidence)}
            </span>
            <div className="flex items-center gap-1">
              {!insight.viewed && onMarkRead && (
                <Button variant="ghost" size="sm" onClick={() => onMarkRead(insight.id)}>
                  <Check />
                  <span className="hidden sm:inline">Mark read</span>
                </Button>
              )}
              {onDismiss && (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onDismiss(insight.id)}>
                  <X />
                  <span className="hidden sm:inline">Dismiss</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
