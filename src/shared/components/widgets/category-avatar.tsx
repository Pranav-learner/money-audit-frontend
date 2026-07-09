import { getCategoryColor } from '@/shared/utils/category-color';
import { cn } from '@/shared/utils/cn';

export interface CategoryAvatarProps {
  icon?: string;
  name?: string;
  size?: number;
  className?: string;
}

/** Category glyph (emoji) inside a tinted, stable-coloured tile. Reused across features. */
export function CategoryAvatar({ icon, name, size = 44, className }: CategoryAvatarProps) {
  const color = getCategoryColor(name);
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-xl text-lg', className)}
      style={{
        width: size,
        height: size,
        background: `color-mix(in oklch, ${color} 16%, transparent)`,
      }}
    >
      {icon || '💸'}
    </span>
  );
}
