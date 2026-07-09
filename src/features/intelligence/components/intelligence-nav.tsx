'use client';

import { Activity, BrainCircuit, HeartPulse, Lightbulb, MessageSquare, ShieldAlert, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

const SECTIONS = [
  { label: 'Overview', href: '/intelligence', icon: BrainCircuit, exact: true },
  { label: 'Spending Insights', href: '/intelligence/insights', icon: Activity },
  { label: 'Risk Analysis', href: '/intelligence/risk', icon: ShieldAlert },
  { label: 'Financial Health', href: '/intelligence/health', icon: HeartPulse },
  { label: 'Recommendations', href: '/intelligence/recommendations', icon: Lightbulb },
  { label: 'Forecast', href: '/intelligence/forecast', icon: TrendingUp },
  { label: 'Goals', href: '/intelligence/goals', icon: Target },
  { label: 'AI Assistant', href: '/intelligence/assistant', icon: MessageSquare },
];

/** Secondary navigation for the Financial Intelligence hub (horizontally scrollable on mobile). */
export function IntelligenceNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 overflow-x-auto border-b border-border pb-px">
      <nav aria-label="Financial Intelligence sections" className="flex w-max gap-1">
        {SECTIONS.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
