'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, UserPlus, Check, X,
  ArrowLeftRight, Plus, Banknote, User, Users,
  PieChart, Camera, FileText
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
  getBorrowRate,
  DirectTransaction,
  CreateDirectExpenseRequest
} from '@/lib/services/direct';
import { getCategories, Category } from '@/lib/services/categories';
import { 
  getRazorpayKey, 
  createRazorpayOrder, 
  verifyRazorpayPayment 
} from '@/lib/services/payments';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import api from '@/lib/api';

/** Shape of a user returned by the `/users/search` endpoint. */
interface SearchUser {
  userId: string;
  name: string;
  phone: string;
  email: string;
  relationshipStatus: string;
}

/** Successful checkout callback payload from the Razorpay SDK. */
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    /** Receipt id stashed after an OCR upload, consumed on expense confirm. */
    lastReceiptId?: string | null;
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
}

export default function ContactsPage() {
  const { user } = useAuth();
  
  // Friends states
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Search modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQueryGlobal, setSearchQueryGlobal] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Direct expense states
  const [expenses, setExpenses] = useState<DirectTransaction[]>([]);
  const [netBalance, setNetBalance] = useState(0);
  const [borrowLend, setBorrowLend] = useState({ borrowCount: 0, lendCount: 0 });

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Modal form states
  const [expAmount, setExpAmount] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [paidBy, setPaidBy] = useState<'you' | 'friend'>('you');
  const [splitType, setSplitType] = useState<'EQUAL' | 'UNEQUAL'>('EQUAL');
  const [myShare, setMyShare] = useState('');
  const [otherShare, setOtherShare] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  
  const [payAmount, setPayAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchData = async () => {
    try {
      const loadCategories = async () => {
        try {
          const data = await getCategories();
          setCategories(data);
          if (data.length > 0) setSelectedCategoryId(data[0].id);
        } catch (err) {
          console.error('Failed to load categories', err);
        }
      };

      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getPendingRequests()
      ]);
      loadCategories();
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          const [history, balance, rate] = await Promise.all([
            getDirectExpenses(selectedFriend.userId),
            getNetBalance(selectedFriend.userId),
            getBorrowRate(selectedFriend.userId)
          ]);
          setExpenses(history);
          setNetBalance(balance);
          setBorrowLend(rate);
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
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectFriendRequest(id);
      toast.success('Request rejected');
      fetchData();
    } catch {
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
    } catch {
      toast.error('Failed to send request');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedFriend) {
      setIsScanning(true);
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // Step 1: Upload and Parse
        const res = await api.post('/receipts/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const data = res.data;
        setExpAmount(data.amount?.toString() || '');
        setExpTitle(data.merchant || 'Receipt Expense');
        if (data.suggestedCategoryId) setSelectedCategoryId(data.suggestedCategoryId);
        
        // Save the receipt ID to link it during confirm
        window.lastReceiptId = data.receiptId;
        
        toast.success('Receipt scanned successfully!');
      } catch (error) {
        console.error('OCR Failed:', error);
        toast.error('Failed to scan receipt');
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleAddExpense = async () => {
    if (!expAmount || !expTitle || !selectedFriend) { 
      toast.error('Fill all fields'); 
      return; 
    }

    const total = Number(expAmount);

    if (splitType === 'UNEQUAL') {
      const s1 = Number(myShare);
      const s2 = Number(otherShare);
      if (Math.abs((s1 + s2) - total) > 0.01) {
        toast.error('Shares must sum up to total amount');
        return;
      }
    }

    try {
      const receiptId = window.lastReceiptId;
      
      if (receiptId) {
        // If we have a receipt, use the confirm-group endpoint
        await api.post(`/receipts/${receiptId}/confirm-group`, {
          groupId: null, // null for direct expense
          otherUserId: selectedFriend.userId, 
          amount: total,
          title: expTitle,
          categoryId: selectedCategoryId,
          expenseDate: new Date().toISOString().split('T')[0],
          splitType: splitType,
          splits: splitType === 'UNEQUAL' ? [
            { userId: user?.id, amount: Number(myShare) },
            { userId: selectedFriend.userId, amount: Number(otherShare) }
          ] : []
        });
        window.lastReceiptId = null;
      } else {
        // Standard flow. `categoryId` is an extra field the backend accepts but
        // that isn't part of the base request type, so widen it locally.
        const expensePayload: CreateDirectExpenseRequest & { categoryId: string } = {
          friendId: selectedFriend.userId,
          totalAmount: total,
          title: expTitle,
          categoryId: selectedCategoryId,
          expenseDate: new Date().toISOString().split('T')[0],
          paidByUserId: (paidBy === 'you' ? user?.id : selectedFriend.userId) as string,
          splitType: splitType,
          myShare: splitType === 'UNEQUAL' ? Number(myShare) : undefined,
          otherShare: splitType === 'UNEQUAL' ? Number(otherShare) : undefined
        };
        await createDirectExpense(expensePayload);
      }
      
      toast.success(`Expense split with ${selectedFriend.name}!`);
      setExpAmount(''); setExpTitle('');
      setMyShare(''); setOtherShare('');
      setShowExpenseModal(false);
      
      const [history, balance, rate] = await Promise.all([
        getDirectExpenses(selectedFriend.userId),
        getNetBalance(selectedFriend.userId),
        getBorrowRate(selectedFriend.userId)
      ]);
      setExpenses(history);
      setNetBalance(balance);
      setBorrowLend(rate);
    } catch (error) {
      console.error('Add expense failed:', error);
      toast.error('Failed to record expense');
    }
  };

  const handlePayment = async () => {
    if (!payAmount || !selectedFriend) { toast.error('Enter amount'); return; }
    
    setIsProcessingPayment(true);
    try {
      await createDirectPayment(selectedFriend.userId, Number(payAmount), 'Manual Settlement');
      toast.success(`Payment recorded manually!`);
      setPayAmount('');
      setShowPaymentModal(false);
      
      const [history, balance, rate] = await Promise.all([
        getDirectExpenses(selectedFriend.userId),
        getNetBalance(selectedFriend.userId),
        getBorrowRate(selectedFriend.userId)
      ]);
      setExpenses(history);
      setNetBalance(balance);
      setBorrowLend(rate);
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!payAmount || !selectedFriend) { toast.error('Enter amount'); return; }
    
    const amount = Number(payAmount);
    
    // Restriction: Cannot pay more than owed
    if (amount > netBalance) {
      toast.error(`You can't pay more than what you owe (${formatCurrency(netBalance)})`);
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Check your connection.');
        return;
      }

      const keyId = await getRazorpayKey();
      const orderId = await createRazorpayOrder(amount);

      const options = {
        key: keyId,
        amount: amount * 100, // already in paise from backend? No, createOrder takes BigDecimal and converts.
        currency: 'INR',
        name: 'Money Audit',
        description: `Settlement with ${selectedFriend.name}`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: amount,
              toUserId: selectedFriend.userId,
              note: 'Razorpay Settlement'
            });
            
            toast.success('Payment successful and verified!');
            setShowPaymentModal(false);
            setPayAmount('');
            
            // Refresh data
            const [history, balance, rate] = await Promise.all([
              getDirectExpenses(selectedFriend.userId),
              getNetBalance(selectedFriend.userId),
              getBorrowRate(selectedFriend.userId)
            ]);
            setExpenses(history);
            setNetBalance(balance);
            setBorrowLend(rate);
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new window.Razorpay!(options);
      rzp.open();
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setIsProcessingPayment(false);
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-warning uppercase tracking-wider">
                  Pending Requests ({requests.length})
                </h3>
                <Link href="/notifications" className="text-[10px] font-bold text-primary hover:underline">
                  View Hub
                </Link>
              </div>
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
                      <p className="text-[10px] text-muted truncate">Friend since {f.since ? new Date(f.since).toLocaleDateString() : '—'}</p>
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
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold">Borrow / Lend</p>
                    <p className="text-lg font-black text-foreground">{borrowLend.borrowCount} : {borrowLend.lendCount}</p>
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
                              <p className="text-sm font-bold text-foreground truncate">{exp.title}</p>
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
                            <div className="max-h-0 group-hover:max-h-64 overflow-hidden transition-all duration-500 ease-in-out px-6 bg-black/10">
                              <div className="py-6 border-t border-white/10 space-y-6">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted uppercase font-bold tracking-wider">Total Bill</span>
                                  <span className="text-base font-bold text-foreground">{formatCurrency(totalBill)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-2">
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Your Share</p>
                                    <p className="text-sm font-bold text-foreground">{formatCurrency(yourShare)}</p>
                                  </div>
                                  <div className="space-y-1.5 text-right">
                                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">{selectedFriend.name}&apos;s Share</p>
                                    <p className="text-sm font-bold text-foreground">{formatCurrency(friendShare)}</p>
                                  </div>
                                </div>
                                {exp.receiptUrl && (
                                  <div className="pt-4 border-t border-white/5">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingReceiptUrl(exp.receiptUrl || null);
                                      }}
                                      className="btn-secondary w-full text-[10px] h-8 flex items-center justify-center gap-2 hover:bg-primary/20 hover:text-primary transition-all"
                                    >
                                      <FileText className="w-3.5 h-3.5" /> View Original Receipt
                                    </button>
                                  </div>
                                )}
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
          <div className="modal-content max-w-lg w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">Split with {selectedFriend?.name}</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-muted hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Optional OCR Upload */}
              <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-between transition-colors hover:border-primary/50 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Scan Receipt (Optional)</p>
                    <p className="text-xs text-muted">Auto-fill details from an image</p>
                  </div>
                </div>
                <label className="btn-secondary text-xs cursor-pointer py-2 px-4 shrink-0">
                  {isScanning ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white/80"></div>
                      Scanning...
                    </span>
                  ) : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isScanning} />
                </label>
              </div>

              {/* Title & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Title</label>
                  <input type="text" value={expTitle} onChange={e => setExpTitle(e.target.value)} placeholder="Dinner, Movie, etc." className="input-field py-3 text-base" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Total Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg">₹</span>
                    <input type="number" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0" className="input-field py-3 pl-10 text-base font-medium" />
                  </div>
                </div>
              </div>
 
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={selectedCategoryId} 
                  onChange={e => setSelectedCategoryId(e.target.value)}
                  className="input-field py-3 text-base appearance-none bg-white/5 border-white/10 text-foreground cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Who Paid */}
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Who Paid?</label>
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setPaidBy('you')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all
                      ${paidBy === 'you' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    You
                  </button>
                  <button 
                    onClick={() => setPaidBy('friend')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all
                      ${paidBy === 'friend' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    {selectedFriend?.name || 'Friend'}
                  </button>
                </div>
              </div>

              {/* Split Mode */}
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Split Mode</label>
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setSplitType('EQUAL')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all
                      ${splitType === 'EQUAL' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    Split Equally
                  </button>
                  <button 
                    onClick={() => setSplitType('UNEQUAL')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all
                      ${splitType === 'UNEQUAL' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                  >
                    Manual Split
                  </button>
                </div>
              </div>

              {/* Manual Shares */}
              {splitType === 'UNEQUAL' && (
                <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-muted">Your share</p>
                    <div className="relative w-36">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-xs">₹</span>
                      <input type="number" step="0.01" value={myShare} onChange={e => setMyShare(e.target.value)} placeholder="0" className="input-field py-2.5 pl-8 text-base font-medium" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-muted">{selectedFriend?.name}&apos;s share</p>
                    <div className="relative w-36">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-xs">₹</span>
                      <input type="number" step="0.01" value={otherShare} onChange={e => setOtherShare(e.target.value)} placeholder="0" className="input-field py-2.5 pl-8 text-base font-medium" />
                    </div>
                  </div>
                  {Number(expAmount) > 0 && (
                    <div className="pt-3 border-t border-white/10 mt-3">
                      <p className={`text-xs font-bold text-right ${Math.abs((Number(myShare) + Number(otherShare)) - Number(expAmount)) < 0.01 ? 'text-success' : 'text-danger'}`}>
                        Total: {formatCurrency(Number(myShare) + Number(otherShare))} / {formatCurrency(Number(expAmount))}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Note */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs text-primary/80 italic leading-relaxed">
                  {paidBy === 'you' 
                    ? `You paid ₹${expAmount || 0}. ${selectedFriend?.name} will owe you ₹${splitType === 'EQUAL' ? (Number(expAmount)/2).toFixed(2) : (otherShare || 0)}.`
                    : `${selectedFriend?.name} paid ₹${expAmount || 0}. You will owe them ₹${splitType === 'EQUAL' ? (Number(expAmount)/2).toFixed(2) : (myShare || 0)}.`
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
          <div className="modal-content max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">Settle Up</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted uppercase font-bold tracking-wider">Currently Owed</p>
                  <p className={`text-xl font-black ${netBalance > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(Math.abs(netBalance))}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Amount to Settle (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg font-medium">₹</span>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={e => setPayAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="input-field py-3 pl-10 text-xl font-black" 
                  />
                </div>
                <p className="text-[10px] text-muted mt-2 italic text-center">
                  Settling balance with {selectedFriend?.name}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                <button 
                  onClick={handleRazorpayPayment} 
                  disabled={isProcessingPayment || netBalance <= 0}
                  className={`btn-primary justify-center py-4 text-sm shadow-lg shadow-primary/20
                    ${(isProcessingPayment || netBalance <= 0) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  {isProcessingPayment ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white/80"></div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" /> Pay via Razorpay
                    </span>
                  )}
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-muted uppercase font-bold tracking-widest">OR</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={isProcessingPayment}
                  className="btn-secondary justify-center py-4 text-sm hover:bg-white/10"
                >
                  <Check className="w-4 h-4 mr-2" /> Record Manual Settlement
                </button>
              </div>
            </div>

            <p className="text-[10px] text-muted mt-6 text-center leading-relaxed">
              Use &quot;Pay via Razorpay&quot; for instant digital transfers.<br/>
              Use &quot;Record Manual Settlement&quot; if you&apos;ve already paid via UPI, Cash, etc.
            </p>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {viewingReceiptUrl && (
        <div className="modal-overlay z-[100]" onClick={() => setViewingReceiptUrl(null)}>
          <div className="max-w-4xl w-full p-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="w-full flex justify-end mb-4">
              <button onClick={() => setViewingReceiptUrl(null)} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl relative group">
              {/* Remote receipt image from an arbitrary storage host; using next/image
                  would require configuring remotePatterns, so keep a plain <img>. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingReceiptUrl}
                alt="Receipt"
                className="max-h-[85vh] object-contain"
              />
              <a 
                href={viewingReceiptUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
