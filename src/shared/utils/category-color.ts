/**
 * Deterministic category colours. The backend stores no colour, so we derive a stable
 * one from the category name — the same name always maps to the same swatch, across
 * charts, avatars and badges.
 */
const PALETTE = [
  '#2dd4a8', // emerald
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#a855f7', // violet
  '#ef4444', // rose
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#f97316', // orange
  '#ec4899', // pink
  '#84cc16', // lime
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Stable hex colour for a category name. */
export function getCategoryColor(name: string | null | undefined): string {
  if (!name) return PALETTE[0];
  return PALETTE[hash(name) % PALETTE.length];
}

/** An ordered palette for multi-series charts. */
export const CHART_PALETTE = PALETTE;
