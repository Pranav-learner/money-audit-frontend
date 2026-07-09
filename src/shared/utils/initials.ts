/** Up to two uppercase initials from a name (fallback "U"). */
export function initialsOf(name?: string | null): string {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
