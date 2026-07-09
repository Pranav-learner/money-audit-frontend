export type BalanceTone = 'positive' | 'negative' | 'neutral';

export interface BalanceDescriptor {
  label: string;
  amount: number;
  tone: BalanceTone;
}

/**
 * Interpret a signed direct balance from the current user's perspective.
 * Backend convention: net > 0 → you owe the friend; net < 0 → the friend owes you.
 */
export function describeDirectBalance(net: number, friendName: string): BalanceDescriptor {
  if (net > 0) return { label: `You owe ${friendName}`, amount: net, tone: 'negative' };
  if (net < 0) return { label: `${friendName} owes you`, amount: -net, tone: 'positive' };
  return { label: `Settled up with ${friendName}`, amount: 0, tone: 'neutral' };
}

/**
 * Interpret a group member's net balance. Backend convention: netBalance > 0 → they are owed
 * (paid more than their share); netBalance < 0 → they owe the group.
 */
export function describeGroupBalance(netBalance: number, name: string, isCurrentUser: boolean): BalanceDescriptor {
  const who = isCurrentUser ? 'You' : name;
  if (netBalance > 0) return { label: `${who} ${isCurrentUser ? 'are' : 'is'} owed`, amount: netBalance, tone: 'positive' };
  if (netBalance < 0) return { label: `${who} ${isCurrentUser ? 'owe' : 'owes'}`, amount: -netBalance, tone: 'negative' };
  return { label: `${who} settled up`, amount: 0, tone: 'neutral' };
}

export function toneTextClass(tone: BalanceTone): string {
  if (tone === 'positive') return 'text-success';
  if (tone === 'negative') return 'text-destructive';
  return 'text-muted-foreground';
}
