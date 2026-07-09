import type { BadgeProps } from '@/shared/components/ui/badge';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

/** Where a notification originated (each maps to a real, exposed backend feed). */
export type NotificationSource = 'insight' | 'friend_request' | 'group_invite';

/** Coarse grouping used for the filter control. */
export type NotificationGroup = 'intelligence' | 'social';

/**
 * A single, normalized notification. The backend has no unified notification
 * endpoint, so the frontend aggregates the exposed feeds — Financial
 * Intelligence insights and pending friend/group invitations — into this shape.
 */
export interface AppNotification {
  /** Stable id, namespaced by source so ids never collide across feeds. */
  id: string;
  /** Underlying backend id used for mutations (mark-read / dismiss / accept). */
  rawId: string;
  source: NotificationSource;
  group: NotificationGroup;
  /** Short human category label, e.g. "Risk", "Recommendation", "Social". */
  category: string;
  title: string;
  message: string;
  actionSuggestion?: string;
  createdAt: string;
  read: boolean;
  tone: BadgeVariant;
  /** Deep link to the most relevant page (used when the item is not actionable). */
  href?: string;
  /** Invitations expose Accept / Decline actions. */
  actionable: boolean;
}
