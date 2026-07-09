import { Sparkles, type LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { PageHeader } from './page-header';

export interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Bullet points describing what this section will offer. */
  highlights?: string[];
}

/**
 * Standard "coming in a future milestone" page. Used for routes whose feature work
 * is intentionally out of scope for the foundation milestone.
 */
export function PagePlaceholder({ title, description, icon: Icon = Sparkles, highlights = [] }: PagePlaceholderProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="info">Coming soon</Badge>}
      />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Icon className="size-7" aria-hidden />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{title} is on the way</h2>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              This area is scaffolded on the shared foundation and will be built in an upcoming milestone.
            </p>
          </div>
          {highlights.length > 0 && (
            <ul className="mx-auto grid max-w-md gap-2 text-left text-sm text-muted-foreground">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
