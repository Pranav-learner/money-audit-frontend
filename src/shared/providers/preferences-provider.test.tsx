import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { formatCurrency } from '@/shared/utils/format';
import { PreferencesProvider, usePreferences } from './preferences-provider';

function Consumer() {
  const { preferences, update } = usePreferences();
  return (
    <div>
      <span data-testid="currency">{preferences.currency}</span>
      <span data-testid="compact">{String(preferences.compactMode)}</span>
      <button onClick={() => update({ currency: 'USD', numberFormat: 'INTERNATIONAL' })}>set-usd</button>
      <button onClick={() => update({ compactMode: true })}>compact-on</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <PreferencesProvider>
      <Consumer />
    </PreferencesProvider>,
  );
}

describe('PreferencesProvider', () => {
  it('exposes default preferences', () => {
    renderWithProvider();
    expect(screen.getByTestId('currency').textContent).toBe('INR');
  });

  it('updates, persists to localStorage, and drives the global formatter', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByText('set-usd'));

    expect(screen.getByTestId('currency').textContent).toBe('USD');
    const stored = JSON.parse(localStorage.getItem('ma.preferences.v1') ?? '{}');
    expect(stored.currency).toBe('USD');
    // The shared formatter should now reflect the new currency.
    expect(formatCurrency(1000).startsWith('$')).toBe(true);
  });

  it('reflects compact mode on the document element', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByText('compact-on'));
    expect(document.documentElement.dataset.compact).toBe('true');
  });
});
