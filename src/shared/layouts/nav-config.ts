import {
  BarChart3,
  Bell,
  BrainCircuit,
  FolderTree,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Scale,
  Settings,
  Target,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary sidebar navigation. Adding a milestone's feature = add one entry here. */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Categories', href: '/categories', icon: FolderTree },
  { label: 'Budgets', href: '/budgets', icon: Target },
  { label: 'Savings', href: '/savings', icon: PiggyBank },
  { label: 'Groups', href: '/groups', icon: Users },
  { label: 'Friends', href: '/friends', icon: UserRound },
  { label: 'Settlements', href: '/settlements', icon: Scale },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Financial Intelligence', href: '/intelligence', icon: BrainCircuit },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

/** Condensed navigation for the mobile bottom bar. */
export const MOBILE_NAV: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Budgets', href: '/budgets', icon: Target },
  { label: 'Insights', href: '/intelligence', icon: BrainCircuit },
  { label: 'Settings', href: '/settings', icon: Settings },
];

/** Human-readable labels for breadcrumb segments not covered by nav items. */
export const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  expenses: 'Expenses',
  categories: 'Categories',
  budgets: 'Budgets',
  savings: 'Savings',
  groups: 'Groups',
  settlements: 'Settlements',
  analytics: 'Analytics',
  intelligence: 'Financial Intelligence',
  insights: 'Spending Insights',
  risk: 'Risk Analysis',
  health: 'Financial Health',
  recommendations: 'Recommendations',
  forecast: 'Forecast',
  goals: 'Goals',
  assistant: 'AI Assistant',
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Profile',
  contacts: 'Contacts',
  friends: 'Friends',
  direct: 'Direct',
};

/** Active-route matcher shared by the sidebar and mobile nav. */
export function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
