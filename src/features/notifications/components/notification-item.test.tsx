import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AppNotification } from '../types';
import { NotificationItem } from './notification-item';

function make(partial: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 'insight:1',
    rawId: '1',
    source: 'insight',
    group: 'intelligence',
    category: 'Insight',
    title: 'Spending trend',
    message: 'You spent more this week.',
    createdAt: new Date().toISOString(),
    read: false,
    tone: 'warning',
    href: '/intelligence/insights',
    actionable: false,
    ...partial,
  };
}

describe('NotificationItem', () => {
  it('shows title, message and category', () => {
    render(<NotificationItem notification={make()} />);
    expect(screen.getByText('Spending trend')).toBeInTheDocument();
    expect(screen.getByText('You spent more this week.')).toBeInTheDocument();
  });

  it('fires mark-read and dismiss for insight notifications', async () => {
    const onMarkRead = vi.fn();
    const onDismiss = vi.fn();
    render(<NotificationItem notification={make()} onMarkRead={onMarkRead} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: /mark as read/i }));
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onMarkRead).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders Accept / Decline for actionable invitations', async () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    const invite = make({
      id: 'friend:9',
      source: 'friend_request',
      group: 'social',
      category: 'Friend request',
      title: 'New friend request',
      actionable: true,
      href: '/friends',
    });
    render(<NotificationItem notification={invite} onAccept={onAccept} onDecline={onDecline} />);
    await userEvent.click(screen.getByRole('button', { name: /accept/i }));
    await userEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(onAccept).toHaveBeenCalledWith(invite);
    expect(onDecline).toHaveBeenCalledWith(invite);
  });
});
