'use client';

import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getNotifications } from '@/lib/services/notifications';

export default function TopBar() {
  const { user } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const notifs = await getNotifications();
        setNotifCount(notifs.filter(n => !n.read).length);
      } catch (e) {}
    };
    fetchCount();
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 mb-2">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
        </h2>
        <p className="text-sm text-muted mt-0.5">
          Here&apos;s your financial overview
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/60">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-40 placeholder:text-muted"
          />
        </div>
        <Link href="/notifications" className="relative w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 flex items-center justify-center hover:bg-white/70 transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          {notifCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger animate-pulse" />
          )}
        </Link>
        <div className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.charAt(0) || 'P'}
        </div>
      </div>
    </header>
  );
}
