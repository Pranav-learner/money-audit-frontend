'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftRight, Plus, Search, Banknote } from 'lucide-react';
import { getFriends, Friend } from '@/lib/services/friends';
import { getDirectExpenses, createDirectExpense, createDirectPayment, getNetBalance, DirectTransaction } from '@/lib/services/direct';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function DirectPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [expenses, setExpenses] = useState<DirectTransaction[]>([]);
  const [netBalance, setNetBalance] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriends();
        setFriends(data);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      const fetchHistory = async () => {
        try {
          const [history, balance] = await Promise.all([
            getDirectExpenses(selectedFriend.id),
            getNetBalance(selectedFriend.id)
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
    (f.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleAddExpense = async () => {
    if (!expAmount || !expDesc || !selectedFriend) { toast.error('Fill all fields'); return; }
    try {
      await createDirectExpense(selectedFriend.id, Number(expAmount), expDesc);
      toast.success('Direct expense recorded!');
      setExpAmount(''); setExpDesc('');
      setShowExpenseModal(false);
      // Refresh
      const [history, balance] = await Promise.all([
        getDirectExpenses(selectedFriend.id),
        getNetBalance(selectedFriend.id)
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
      await createDirectPayment(selectedFriend.id, Number(payAmount), 'Payment Settlement');
      toast.success(`Payment of ${formatCurrency(Number(payAmount))} recorded!`);
      setPayAmount('');
      setShowPaymentModal(false);
      // Refresh
      const [history, balance] = await Promise.all([
        getDirectExpenses(selectedFriend.id),
        getNetBalance(selectedFriend.id)
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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Direct Expenses</h2>
        <p className="text-sm text-muted">Track 1-to-1 expenses with friends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="glass-card lg:col-span-1">
          <h3 className="text-base font-semibold text-foreground mb-3">Select Friend</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..." className="input-field pl-10 text-sm" />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredFriends.map(f => (
              <button key={f.id} onClick={() => setSelectedFriend(f)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                  ${selectedFriend?.id === f.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-white/50'}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/25 to-primary/25 flex items-center justify-center text-sm font-bold">{f.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted">Net: {formatCurrency(300)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Expense History */}
        <div className="lg:col-span-2 space-y-4">
          {selectedFriend ? (
            <>
              <div className="glass-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/25 to-primary/25 flex items-center justify-center font-bold">{selectedFriend.name.charAt(0)}</div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{selectedFriend.name}</p>
                    <p className="text-xs text-muted">{selectedFriend.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowExpenseModal(true)} className="btn-secondary text-xs"><Plus className="w-3 h-3" /> Add Expense</button>
                  <button onClick={() => setShowPaymentModal(true)} className="btn-primary text-xs"><Banknote className="w-3 h-3" /> Record Payment</button>
                </div>
              </div>

              {/* Net Balance */}
              <div className="glass-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
                  <ArrowLeftRight className={`w-5 h-5 ${netBalance >= 0 ? 'text-success' : 'text-danger'}`} />
                </div>
                <div>
                  <p className="text-xs text-muted">Net Balance</p>
                  <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
                  </p>
                  <p className="text-xs text-muted">
                    {netBalance >= 0 ? `${selectedFriend.name} owes you` : `You owe ${selectedFriend.name}`}
                  </p>
                </div>
              </div>

              {/* History */}
              <div className="space-y-2">
                {expenses.map(exp => {
                  const isYou = exp.paidByUserId === user?.id?.toString();
                  const payerName = isYou ? 'You' : selectedFriend.name;
                  return (
                    <div key={exp.id} className="glass-card flex items-center gap-4 py-3 px-4">
                      <div className={`w-2 h-2 rounded-full ${isYou ? 'bg-success' : 'bg-danger'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{exp.description}</p>
                        <p className="text-xs text-muted">Paid by {payerName} • {new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-sm font-bold ${isYou ? 'text-success' : 'text-danger'}`}>
                        {isYou ? '+' : '-'}{formatCurrency(exp.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="glass-card text-center py-16">
              <div className="text-5xl mb-4">👈</div>
              <h3 className="text-lg font-semibold text-foreground">Select a friend</h3>
              <p className="text-sm text-muted mt-1">Choose a friend to view or add direct expenses</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Direct Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="What was it for?" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
                <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0" className="input-field" />
              </div>
              <p className="text-xs text-muted">You paid • split with {selectedFriend?.name}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowExpenseModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddExpense} className="btn-primary flex-1 justify-center">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Record Payment</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0" className="input-field" />
              <p className="text-xs text-muted mt-2">Settle with {selectedFriend?.name}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handlePayment} className="btn-primary flex-1 justify-center">Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
