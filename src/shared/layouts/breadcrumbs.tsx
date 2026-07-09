'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { SEGMENT_LABELS } from './nav-config';

function labelFor(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

/** Route-derived breadcrumb trail. The last crumb is the current page (not a link). */
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        return (
          <Fragment key={href}>
            {index > 0 && <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />}
            {isLast ? (
              <span aria-current="page" className="font-medium text-foreground">
                {labelFor(segment)}
              </span>
            ) : (
              <Link href={href} className="transition-colors hover:text-foreground">
                {labelFor(segment)}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
