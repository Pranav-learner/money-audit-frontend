'use client';

import { useEffect, useState } from 'react';
import { 
  Bell, UserPlus, Users, Receipt, Check, X, 
  ArrowLeft, Clock, Trash2, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';
import { getNotifications, Notification } from '@/lib/services/notifications';
import { acceptFriendRequest, rejectFriendRequest } from '@/lib/services/friends';
import { acceptGroupInvitation, rejectGroupInvitation } from '@/lib/services/groups';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAccept = async (notif: Notification) => {
    try {
      if (notif.type === 'FRIEND_REQUEST') {
        await acceptFriendRequest(notif.id);
        toast.success('Friend request accepted!');
      } else if (notif.type === 'GROUP_INVITE') {
        await acceptGroupInvitation(notif.id);
        toast.success('Group invitation accepted!');
      }
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleReject = async (notif: Notification) => {
    try {
      if (notif.type === 'FRIEND_REQUEST') {
        await rejectFriendRequest(notif.id);
        toast.success('Request rejected');
      } else if (notif.type === 'GROUP_INVITE') {
        await rejectGroupInvitation(notif.id);
        toast.success('Invitation declined');
      }
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST': return <UserPlus className="w-5 h-5 text-primary" />;
      case 'GROUP_INVITE': return <Users className="w-5 h-5 text-accent" />;
      case 'EXPENSE_ADDED': return <Receipt className="w-5 h-5 text-warning" />;
      default: return <Bell className="w-5 h-5 text-muted" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/50 border border-white/60 flex items-center justify-center hover:bg-white/70 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <p className="text-sm text-muted">Stay updated with your social finance activities</p>
          </div>
        </div>
        <button 
          onClick={() => setNotifications([])}
          className="text-xs font-semibold text-muted hover:text-danger flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted opacity-30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
            <p className="text-sm text-muted max-w-[250px] mx-auto mt-1">
              No new notifications at the moment. We'll let you know when something happens.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`glass-card group flex items-start gap-4 p-4 transition-all hover:bg-white/60
                ${!notif.read ? 'border-l-4 border-primary' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                ${notif.type === 'FRIEND_REQUEST' ? 'bg-primary/10' : 
                  notif.type === 'GROUP_INVITE' ? 'bg-accent/10' : 'bg-white/50'}`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground leading-tight">{notif.title}</h4>
                  <span className="text-[10px] text-muted flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" /> Just now
                  </span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{notif.message}</p>
                
                {/* Actions for specific types */}
                {(notif.type === 'FRIEND_REQUEST' || notif.type === 'GROUP_INVITE') && (
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => handleAccept(notif)}
                      className="flex-1 h-9 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary-dark transition-all shadow-md active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button 
                      onClick={() => handleReject(notif)}
                      className="flex-1 h-9 bg-white/80 text-foreground text-xs font-bold rounded-xl border border-white/60 flex items-center justify-center gap-1.5 hover:bg-white transition-all active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
              </div>

              {/* Mark as read dot */}
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Security Tip */}
      <div className="glass-card bg-emerald-400/5 border-emerald-400/20 p-4 flex gap-4 items-center">
        <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <p className="text-xs text-muted leading-relaxed">
          <span className="font-bold text-emerald-600">Privacy First:</span> We only show notifications from people in your contact list or those who invite you to collaborate.
        </p>
      </div>
    </div>
  );
}
