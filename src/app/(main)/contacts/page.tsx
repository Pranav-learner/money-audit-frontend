'use client';

import { useEffect, useState } from 'react';
import { 
  Search, UserPlus, UserCheck, UserX, Check, X, 
  ArrowLeftRight, Plus, Banknote, User, Users,
  MessageSquare
} from 'lucide-react';
import { 
  getFriends, 
  getPendingRequests, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  sendFriendRequest,
  searchUsers,
  Friend,
  FriendRequest
} from '@/lib/services/friends';
import { 
  getDirectExpenses, 
  createDirectExpense, 
  createDirectPayment, 
  getNetBalance, 
  DirectTransaction 
} from '@/lib/services/direct';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function ContactsPage() {
  const { user } = useAuth();
  
  // Friends states
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQueryGlobal, setSearchQueryGlobal] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Direct expense states
  const [expenses, setExpenses] = useState<DirectTransaction[]>([]);
  const [netBalance, setNetBalance] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Modal form states
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [paidBy, setPaidBy] = useState<'you' | 'friend'>('you');
  const [splitType, setSplitType] = useState<'EQUAL' | 'UNEQUAL'>('EQUAL');
  const [myShare, setMyShare] = useState('');
  const [otherShare, setOtherShare] = useState('');
  
  const [payAmount, setPayAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getPendingRequests()
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live search for new friends
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQueryGlobal.length >= 3) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQueryGlobal);
          setSearchSuggestions(results);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQueryGlobal]);

  // Fetch history when friend is selected
  useEffect(() => {
    if (selectedFriend) {
      const fetchHistory = async () => {
        try {
          const [history, balance] = await Promise.all([
            getDirectExpenses(selectedFriend.userId),
            getNetBalance(selectedFriend.userId)
          ]);
          setExpenses(history);
          setNetBalance(balance);
        } catch (error) {
          console.error('Failed to fetch history:', error);
        }
      };
      fetchHistory();
    }
  }, [selectedFriend]);

  const filteredFriends = friends.filter(f =>
    (f.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (f.phone || '').includes(searchQuery)
  );

  const handleAccept = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      toast.success('Friend request accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectFriendRequest(id);
      toast.success('Request rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleSendRequest = async (identifier: string) => {
    try {
      await sendFriendRequest(identifier);
      toast.success('Friend request sent!');
      setSearchQueryGlobal('');
      setSearchSuggestions([]);
      setShowSearchModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  const handleAddExpense = async () => {
    if (!expAmount || !expDesc || !selectedFriend) { 
      toast.error('Fill all fields'); 
      return; 
    }

    const total = Number(expAmount);
    let payloadShare: any = {};

    if (splitType === 'UNEQUAL') {
      const s1 = Number(myShare);
      const s2 = Number(otherShare);
      if (Math.abs((s1 + s2) - total) > 0.01) {
        toast.error('Shares must sum up to total amount');
        return;
      }
      payloadShare = { myShare: s1, otherShare: s2 };
    }

    try {
      await createDirectExpense({
        friendId: selectedFriend.userId,
        title: expDesc,
        totalAmount: total,
        expenseDate: new Date().toISOString().split('T')[0],
        splitType: splitType,
        paidByUserId: paidBy === 'you' ? user?.id?.toString()! : selectedFriend.userId,
        ...payloadShare
      });
      
      toast.success('Direct expense recorded!');
      setExpAmount(''); setExpDesc('');
      setMyShare(''); setOtherShare('');
      setShowExpenseModal(false);
      
      const [history, balance] = await Promise.all([
        getDirectExpenses(selectedFriend.userId),
        getNetBalance(selectedFriend.userId)
      ]);
      setExpenses(history);
      setNetBalance(balance);
    } catch (error) {
      toast.error('Failed to record expense');
    }
  };

  const handlePayment = async () => {
    if (!payAmount || !selectedFriend) { toast.error('Enter amount'); return; }
    try {
      await createDirectPayment(selectedFriend.userId, Number(payAmount), 'Payment Settlement');
      toast.success(`Payment recorded!`);
      setPayAmount('');
      setShowPaymentModal(false);
      const [history, balance] = await Promise.all([
        getDirectExpenses(selectedFriend.userId),
        getNetBalance(selectedFriend.userId)
      ]);
      setExpenses(history);
      setNetBalance(balance);
    } catch (error) {
      toast.error('Failed to record payment');
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
          <h2 className="text-2xl font-bold text-foreground">Contacts</h2>
          <p className="text-sm text-muted">Manage friends and direct splits</p>
        </div>
        <button onClick={() => setShowSearchModal(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left: Friends List & Requests */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
          {/* Pending Requests */}
          {requests.length > 0 && (
            <div className="glass-card border-l-4 border-warning shrink-0">
              <h3 className="text-xs font-bold text-warning uppercase tracking-wider mb-3">
                Pending Requests ({requests.length})
              </h3>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {requests.map(req => (
                  <div key={req.friendshipId} className="flex items-center gap-2 py-1.5 border-b border-white/20 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center font-bold text-xs">
                      {(req.name || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{req.name}</p>
                    </div>
                    <button onClick={() => handleAccept(req.friendshipId)} className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center text-success hover:bg-success/25">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleReject(req.friendshipId)} className="w-7 h-7 rounded-lg bg-danger/15 flex items-center justify-center text-danger hover:bg-danger/25">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List Container */}
          <div className="glass-card flex flex-col flex-1 overflow-hidden">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search contacts..." 
                className="input-field search-input" 
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-10 text-muted">
                  <User className="w-10 h-10 mx-auto opacity-20 mb-2" />
                  <p className="text-xs">No contacts found</p>
                </div>
              ) : (
                filteredFriends.map(f => (
                  <button 
                    key={f.friendshipId} 
                    onClick={() => setSelectedFriend(f)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                      ${selectedFriend?.friendshipId === f.friendshipId 
                        ? 'bg-primary/15 border border-primary/20 shadow-sm' 
                        : 'hover:bg-white/40 border border-transparent'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                      ${selectedFriend?.friendshipId === f.friendshipId 
                        ? 'bg-primary text-white' 
                        : 'bg-gradient-to-br from-accent/20 to-primary/20 text-foreground'}`}>
                      {(f.name || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                      <p className="text-[10px] text-muted truncate">Friend since {new Date(f.since).toLocaleDateString()}</p>
                    </div>
                    {selectedFriend?.friendshipId === f.friendshipId && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: History & Actions */}
        <div className="lg:col-span-2 overflow-hidden flex flex-col gap-4">
          {selectedFriend ? (
            <>
              {/* Profile Bar */}
              <div className="glass-card flex items-center justify-between py-3 px-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {(selectedFriend.name || '?').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{selectedFriend.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-muted truncate max-w-[150px]">{selectedFriend.email}</p>
                      <span className="badge badge-success text-[10px] py-0 px-2 h-4">Connected</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowExpenseModal(true)} className="btn-secondary text-xs h-9">
                    <Plus className="w-3.5 h-3.5" /> Split
                  </button>
                  <button onClick={() => setShowPaymentModal(true)} className="btn-primary text-xs h-9">
                    <Banknote className="w-3.5 h-3.5" /> Settle
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="glass-card flex items-center gap-4 py-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm
                    ${netBalance > 0 ? 'bg-danger/20 text-danger' : netBalance < 0 ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted'}`}>
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${netBalance > 0 ? 'text-danger' : netBalance < 0 ? 'text-success' : 'text-muted'}`}>
                      {netBalance > 0 ? 'You owe' : netBalance < 0 ? 'You lent' : 'Settled Up'}
                    </p>
                    <p className={`text-lg font-black ${netBalance > 0 ? 'text-danger' : netBalance < 0 ? 'text-success' : 'text-muted'}`}>
                      {formatCurrency(Math.abs(netBalance))}
                    </p>
                  </div>
                </div>
                <div className="glass-card flex items-center gap-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shadow-sm text-accent">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold">History</p>
                    <p className="text-lg font-black text-foreground">{expenses.length} records</p>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="glass-card flex-1 flex flex-col overflow-hidden">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 shrink-0">Recent Transactions</h4>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {expenses.length === 0 ? (
                    <div className="text-center py-20 text-muted opacity-50">
                      <ArrowLeftRight className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm italic">No shared expenses yet</p>
                    </div>
                  ) : (
                    expenses.map(exp => {
                      const isYou = exp.paidByUserId === user?.id?.toString();
                      const payerName = isYou ? 'You' : selectedFriend.name;
                      const isPayment = exp.type === 'PAYMENT';

                      // Backend now returns totalAmount as 'amount' + individual shares
                      const totalBill = exp.amount;

                      // Use exact shares from backend (always present after backend fix)
                      const yourShare  = exp.myShare    ?? totalBill / 2;
                      const friendShare = exp.otherShare ?? totalBill / 2;

                      // Net impact on balance:
                      // If YOU paid → friend owes you their share (green)
                      // If THEY paid → you owe them your share (red)
                      const netImpact = isYou ? friendShare : yourShare;

                      return (
                        <div key={exp.id} className="flex flex-col rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 group overflow-hidden border border-white/5 hover:border-white/20">
                          <div className="flex items-center gap-4 p-3">
                            <div className={`w-1 h-10 rounded-full shrink-0 ${isPayment ? 'bg-primary' : (isPayment || netImpact === 0) ? 'bg-muted' : isYou ? 'bg-success' : 'bg-danger'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{exp.description}</p>
                              <p className="text-[10px] text-muted">
                                {isPayment ? `Settlement by ${payerName}` : `Paid by ${payerName}`} • {new Date(exp.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-black ${isPayment ? 'text-primary' : netImpact === 0 ? 'text-muted' : isYou ? 'text-success' : 'text-danger'}`}>
                                {isPayment ? '' : netImpact === 0 ? '' : (isYou ? '+' : '-')}{formatCurrency(isPayment ? exp.amount : netImpact)}
                              </p>
                            </div>
                          </div>

                          {/* Hover Detail Dropdown */}
                          {!isPayment && (
                            <div className="max-h-0 group-hover:max-h-48 overflow-hidden transition-all duration-500 ease-in-out px-4 bg-black/10">
                              <div className="py-4 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Bill</span>
                                  <span className="text-sm font-bold text-foreground">{formatCurrency(totalBill)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-1">
                                  <div className="space-y-1">
                                    <p className="text-[9px] text-muted uppercase font-bold tracking-wider">Your Share</p>
                                    <p className="text-xs font-bold text-foreground">{formatCurrency(yourShare)}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                    <p className="text-[9px] text-muted uppercase font-bold tracking-wider">{selectedFriend.name}&apos;s Share</p>
                                    <p className="text-xs font-bold text-foreground">{formatCurrency(friendShare)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-primary opacity-40" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Select a contact</h3>
              <p className="text-sm text-muted mt-2 max-w-[280px] mx-auto">
                Choose a friend from the list to view your shared history and manage direct splits.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-foreground">Find Contacts</h3>
              <button onClick={() => setShowSearchModal(false)} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQueryGlobal}
                  onChange={e => setSearchQueryGlobal(e.target.value)}
                  placeholder="Name, email or phone..."
                  className="input-field search-input"
                  autoFocus
                />
              </div>

              <div className="min-h-[250px] max-h-[350px] overflow-y-auto pr-2 space-y-2">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mb-2"></div>
                    <p className="text-xs">Searching users...</p>
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  searchSuggestions.map(user => (
                    <div key={user.userId} className="glass-card flex items-center gap-3 p-3 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-[10px] text-muted truncate">{user.phone || user.email}</p>
                      </div>
                      {user.relationshipStatus === 'NONE' ? (
                        <button
                          onClick={() => handleSendRequest(user.phone || user.email)}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          Add
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-muted bg-white/5 px-2 py-1 rounded-lg capitalize">
                          {user.relationshipStatus.toLowerCase().replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  ))
                ) : searchQueryGlobal.length >= 3 ? (
                  <div className="text-center py-10 text-muted">
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted">
                    <p className="text-xs">Start typing to find people</p>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setShowSearchModal(false)} className="btn-secondary w-full justify-center mt-6">Close</button>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Split with {selectedFriend?.name}</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Description & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Description</label>
                  <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Dinner, Movie, etc." className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Total Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₹</span>
                    <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0" className="input-field pl-10" />
                  </div>
                </div>
              </div>

              {/* Who Paid */}
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Who Paid?</label>
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setPaidBy('you')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                      ${paidBy === 'you' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    You
                  </button>
                  <button 
                    onClick={() => setPaidBy('friend')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                      ${paidBy === 'friend' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    {selectedFriend?.name || 'Friend'}
                  </button>
                </div>
              </div>

              {/* Split Mode */}
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Split Mode</label>
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setSplitType('EQUAL')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                      ${splitType === 'EQUAL' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    Split Equally
                  </button>
                  <button 
                    onClick={() => setSplitType('UNEQUAL')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                      ${splitType === 'UNEQUAL' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    Manual Split
                  </button>
                </div>
              </div>

              {/* Manual Shares */}
              {splitType === 'UNEQUAL' && (
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-muted">Your share</p>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[10px]">₹</span>
                      <input type="number" value={myShare} onChange={e => setMyShare(e.target.value)} placeholder="0" className="input-field py-1.5 pl-8 text-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-muted">{selectedFriend?.name}&apos;s share</p>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[10px]">₹</span>
                      <input type="number" value={otherShare} onChange={e => setOtherShare(e.target.value)} placeholder="0" className="input-field py-1.5 pl-8 text-sm" />
                    </div>
                  </div>
                  {Number(expAmount) > 0 && (
                    <div className="pt-2 border-t border-white/10 mt-2">
                      <p className={`text-[10px] font-bold text-right ${Math.abs((Number(myShare) + Number(otherShare)) - Number(expAmount)) < 0.01 ? 'text-success' : 'text-danger'}`}>
                        Total: {formatCurrency(Number(myShare) + Number(otherShare))} / {formatCurrency(Number(expAmount))}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Note */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] text-primary/80 italic leading-relaxed">
                  {paidBy === 'you' 
                    ? `You paid ₹${expAmount || 0}. ${selectedFriend?.name} will owe you ₹${splitType === 'EQUAL' ? (Number(expAmount)/2).toFixed(0) : (otherShare || 0)}.`
                    : `${selectedFriend?.name} paid ₹${expAmount || 0}. You will owe them ₹${splitType === 'EQUAL' ? (Number(expAmount)/2).toFixed(0) : (myShare || 0)}.`
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowExpenseModal(false)} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
              <button onClick={handleAddExpense} className="btn-primary flex-1 justify-center py-3 shadow-lg shadow-primary/20">Record Split</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Settle Balance</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0" className="input-field" />
              <p className="text-xs text-muted mt-2">Record a settlement with {selectedFriend?.name}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handlePayment} className="btn-primary flex-1 justify-center">Settle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
