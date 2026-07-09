'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';

/**
 * Explainability affordance. Surfaces the backend-provided explanation behind a "Why?" toggle.
 * Renders nothing when the backend gives no explanation — we never invent one.
 */
export function WhyExplanation({
  question = 'Why am I seeing this?',
  explanation,
}: {
  question?: string;
  explanation?: string | null;
}) {
  const [open, setOpen] = useState(false);
  if (!explanation) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-secondary/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-3.5 text-primary" aria-hidden />
        {question}
        <ChevronDown className={cn('ml-auto size-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-3 pb-3 text-xs leading-relaxed text-muted-foreground">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
