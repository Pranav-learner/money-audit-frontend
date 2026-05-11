'use client';

import { useEffect, useState } from 'react';
import { Search, UserPlus, UserCheck, UserX, Check, X } from 'lucide-react';
import { 
  getFriends, 
  getPendingRequests, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  sendFriendRequest,
  Friend,
  FriendRequest
} from '@/lib/services/friends';
import toast from 'react-hot-toast';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriendsData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getPendingRequests()
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const filteredFriends = friends.filter(f =>
    (f.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (f.phone || '').includes(searchQuery)
  );

  const handleAccept = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      toast.success('Friend request accepted!');
      fetchFriendsData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectFriendRequest(id);
      toast.success('Request rejected');
      fetchFriendsData();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleSendRequest = async () => {
    if (!searchPhone.trim()) { toast.error('Enter a phone number'); return; }
    try {
      await sendFriendRequest(searchPhone);
      toast.success('Friend request sent!');
      setSearchPhone('');
      setShowSearchModal(false);
      fetchFriendsData();
    } catch (error) {
      toast.error('Failed to send request. User may not exist.');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Friends</h2>
          <p className="text-sm text-muted">Manage your network</p>
        </div>
        <button onClick={() => setShowSearchModal(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Add Friend</button>
      </div>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div className="glass-card border-l-4 border-warning">
          <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-warning" />
            Pending Requests ({requests.length})
          </h3>
          <div className="space-y-2">
            {requests.map(req => (
              <div key={req.id} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning/20 to-amber-200 flex items-center justify-center font-bold text-sm text-foreground">
                  {req.senderName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{req.senderName}</p>
                  <p className="text-xs text-muted">{req.senderPhone}</p>
                </div>
                <button onClick={() => handleAccept(req.id)} className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center text-success hover:bg-success/25 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => handleReject(req.id)} className="w-9 h-9 rounded-xl bg-danger/15 flex items-center justify-center text-danger hover:bg-danger/25 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search friends..." className="input-field pl-11" />
      </div>

      {/* Friends List */}
      {filteredFriends.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="text-lg font-semibold text-foreground">No friends found</h3>
          <p className="text-sm text-muted mt-1">Add friends to start splitting expenses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredFriends.map(f => (
            <div key={f.id} className="glass-card flex items-center gap-4 py-3 px-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/25 to-primary/25 flex items-center justify-center text-base font-bold text-foreground">
                {f.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted truncate">{f.phone}</p>
              </div>
              <span className="badge badge-success text-[10px]">Friends</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Friend Modal */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Add Friend</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <input type="tel" value={searchPhone} onChange={e => setSearchPhone(e.target.value)}
                placeholder="+91 9876543210" className="input-field" />
              <p className="text-xs text-muted mt-2">Enter your friend&apos;s phone number to send a request</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSearchModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSendRequest} className="btn-primary flex-1 justify-center">Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
