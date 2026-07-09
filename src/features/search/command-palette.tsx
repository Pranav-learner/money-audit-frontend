'use client';

import { Command } from 'cmdk';
import {
  ArrowRight,
  Bell,
  LayoutDashboard,
  Plus,
  Search,
  Sparkles,
  Target,
  UsersRound,
  Clock,
  CornerDownLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchIndex } from '@/features/search/use-search-index';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/components/ui/dialog';
import { PRIMARY_NAV } from '@/shared/layouts/nav-config';
import { useUiState } from '@/shared/providers/ui-state-provider';

const RECENT_KEY = 'ma.recent-searches';
const RECENT_MAX = 5;

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/**
 * Global command palette (Ctrl/⌘+K): navigate, run quick actions, and search
 * across expenses, groups, friends, goals, categories, budgets, insights and
 * recommendations. Mounted once in the app shell.
 */
export function CommandPalette() {
  const { commandOpen, setCommandOpen, setNotificationsOpen } = useUiState();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  const index = useSearchIndex(commandOpen);

  // Global keyboard shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandOpen, setCommandOpen]);

  useEffect(() => {
    // Sync local UI state to the open/close transition (external trigger).
    /* eslint-disable react-hooks/set-state-in-effect */
    if (commandOpen) setRecent(readRecent());
    else setQuery('');
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [commandOpen]);

  const pushRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...readRecent().filter((r) => r !== t)].slice(0, RECENT_MAX);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setRecent(next);
  }, []);

  const run = useCallback(
    (action: () => void) => {
      if (query.trim()) pushRecent(query);
      setCommandOpen(false);
      action();
    },
    [query, pushRecent, setCommandOpen],
  );

  const go = useCallback((href: string) => run(() => router.push(href)), [run, router]);

  const entries = useMemo(() => index.data ?? [], [index.data]);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const arr = map.get(e.group) ?? [];
      arr.push(e);
      map.set(e.group, arr);
    }
    // Cap each group so the list stays snappy; cmdk filters what's rendered.
    return Array.from(map.entries()).map(([group, items]) => ({ group, items: items.slice(0, 30) }));
  }, [entries]);

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent
        className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById('command-input')?.focus();
        }}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Search and quick actions</DialogDescription>

        <Command label="Command palette" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Command.Input
              id="command-input"
              value={query}
              onValueChange={setQuery}
              placeholder="Search or jump to…"
              className="h-12 w-full bg-transparent pr-6 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              {index.isLoading ? 'Searching…' : 'No results found.'}
            </Command.Empty>

            {!query && recent.length > 0 && (
              <Command.Group heading="Recent searches">
                {recent.map((r) => (
                  <PaletteItem key={`recent:${r}`} value={`recent ${r}`} icon={Clock} label={r} onSelect={() => setQuery(r)} />
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Quick actions">
              <PaletteItem value="new expense create add" icon={Plus} label="New expense" onSelect={() => go('/expenses')} />
              <PaletteItem value="new group create" icon={UsersRound} label="New group" onSelect={() => go('/groups')} />
              <PaletteItem value="ask ai assistant chat" icon={Sparkles} label="Ask the AI assistant" onSelect={() => go('/intelligence/assistant')} />
              <PaletteItem value="dashboard home" icon={LayoutDashboard} label="Open dashboard" onSelect={() => go('/dashboard')} />
              <PaletteItem value="goals" icon={Target} label="Open goals" onSelect={() => go('/intelligence/goals')} />
              <PaletteItem
                value="notifications alerts bell"
                icon={Bell}
                label="Open notifications"
                onSelect={() => run(() => setNotificationsOpen(true))}
              />
            </Command.Group>

            <Command.Group heading="Navigation">
              {PRIMARY_NAV.map((item) => (
                <PaletteItem
                  key={item.href}
                  value={`go ${item.label} ${item.href}`}
                  icon={item.icon}
                  label={item.label}
                  onSelect={() => go(item.href)}
                />
              ))}
            </Command.Group>

            {grouped.map(({ group, items }) => (
              <Command.Group key={group} heading={group}>
                {items.map((e) => (
                  <PaletteItem
                    key={e.id}
                    value={e.id}
                    keywords={[e.label, e.group, e.sublabel ?? '']}
                    icon={ArrowRight}
                    label={e.label}
                    sublabel={e.sublabel}
                    onSelect={() => go(e.href)}
                  />
                ))}
              </Command.Group>
            ))}
          </Command.List>

          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="size-3" /> to select
            </span>
            <span>
              <kbd className="rounded border border-border px-1 py-0.5">Ctrl</kbd> +{' '}
              <kbd className="rounded border border-border px-1 py-0.5">K</kbd>
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function PaletteItem({
  value,
  keywords,
  icon: Icon,
  label,
  sublabel,
  onSelect,
}: {
  value: string;
  keywords?: string[];
  icon: typeof Plus;
  label: string;
  sublabel?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground data-[selected=true]:bg-secondary"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {sublabel && <span className="shrink-0 truncate text-xs text-muted-foreground">{sublabel}</span>}
    </Command.Item>
  );
}
