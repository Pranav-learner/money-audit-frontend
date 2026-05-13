'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Wallet,
  ArrowLeftRight,
  Target,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/savings', label: 'Saving/Income', icon: PiggyBank },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/friends', label: 'Friends', icon: UserPlus },
  { href: '/direct', label: 'Direct', icon: ArrowLeftRight },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-[260px] min-h-screen p-4 glass-sidebar">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">MoneyAudit</h1>
          <p className="text-xs text-muted">Finance Tracker</p>
        </div>
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary-dark shadow-sm'
                  : 'text-muted hover:bg-white/40 hover:text-foreground'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/30 pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 w-full rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
