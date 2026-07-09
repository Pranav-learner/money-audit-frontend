'use client';

import { motion } from 'framer-motion';
import { Check, PiggyBank, X } from 'lucide-react';
import type { Recommendation } from '@/lib/services/recommendations';
import { confidenceLabel, humanizeEnum, priorityMeta } from '@/features/intelligence/lib/display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency, formatDate } from '@/shared/utils/format';

export interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
  readOnly?: boolean;
}

export function RecommendationCard({ recommendation, onDismiss, onComplete, readOnly }: RecommendationCardProps) {
  const pr = priorityMeta(recommendation.priority);
  const saving = recommendation.expectedMonthlySaving ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={pr.variant}>{pr.label}</Badge>
              <Badge variant="secondary">{humanizeEnum(recommendation.recommendationType)}</Badge>
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">{formatDate(recommendation.createdAt)}</time>
          </div>

          <div>
            <p className="font-medium text-foreground">{recommendation.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{recommendation.description}</p>
          </div>

          {saving > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-2.5 text-sm font-medium text-success">
              <PiggyBank className="size-4" aria-hidden />
              Save about {formatCurrency(saving)}/month
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">{confidenceLabel(recommendation.confidence)}</span>
            {!readOnly && (
              <div className="flex items-center gap-1">
                {onComplete && (
                  <Button variant="ghost" size="sm" className="text-success" onClick={() => onComplete(recommendation.id)}>
                    <Check />
                    Done
                  </Button>
                )}
                {onDismiss && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onDismiss(recommendation.id)}>
                    <X />
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
