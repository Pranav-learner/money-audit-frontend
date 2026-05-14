'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Users, Receipt, Scale, Banknote, Trash2, UserPlus, Camera, X, Check } from 'lucide-react';
import Link from 'next/link';
import { 
  getGroupById, 
  getGroupExpenses, 
  getGroupBalances, 
  addGroupMember, 
  createGroupExpense,
  inviteGroupMember,
  Group 
} from '@/lib/services/groups';
import { getFriends, Friend } from '@/lib/services/friends';
import toast from 'react-hot-toast';
import api from '@/lib/api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

type TabType = 'expenses' | 'balances' | 'members';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Settle form
  const [settleAmount, setSettleAmount] = useState('');
  const [settleTo, setSettleTo] = useState('');

  // Advanced Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [paidById, setPaidById] = useState('');
  const [splitType, setSplitType] = useState<'EQUAL' | 'UNEQUAL' | 'PERCENTAGE'>('EQUAL');
  const [memberShares, setMemberShares] = useState<{[key: string]: string}>({});
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Add Member form
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchGroupData = async () => {
    try {
      const [groupData, expensesData, friendsData, membersData, profileData] = await Promise.all([
        getGroupById(groupId),
        getGroupExpenses(groupId),
        getFriends(),
        api.get(`/groups/${groupId}/members`).then(res => res.data),
        api.get('/api/auth/me').then(res => res.data) // Corrected path
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setFriends(friendsData);
      setGroupMembers(membersData);
      setCurrentUser(profileData);
      
      if (membersData.length > 0) {
        if (!paidById) setPaidById(membersData[0].id);
        if (selectedMemberIds.size === 0) {
          setSelectedMemberIds(new Set(membersData.map((m: any) => m.id)));
        }
      }

      if (expensesData.length > 0 && !selectedExpense) {
        setSelectedExpense(expensesData[0]);
      }

      // Try to fetch balances if possible
      try {
        const balancesData = await getGroupBalances(groupId);
        setBalances(balancesData);
      } catch (e) {
        console.warn('Balances endpoint might not exist yet');
      }
    } catch (error) {
      console.error('Failed to fetch group details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleAddExpense = async () => {
    if (!expTitle || !expAmount) { toast.error('Fill title and amount'); return; }
    
    const amount = Number(expAmount);
    let splits: any[] = [];
    const involvedMembers = groupMembers.filter(m => selectedMemberIds.has(m.id));

    if (involvedMembers.length === 0) {
      toast.error('Select at least one member to split with');
      return;
    }

    if (splitType === 'UNEQUAL') {
      let sum = 0;
      splits = involvedMembers.map(m => {
        const val = Number(memberShares[m.id] || 0);
        sum += val;
        return { userId: m.id, amount: val };
      });
      if (Math.abs(sum - amount) > 0.01) {
        toast.error(`Total split (₹${sum.toFixed(2)}) must match expense amount (₹${amount.toFixed(2)})`);
        return;
      }
    } else if (splitType === 'PERCENTAGE') {
      let sumPct = 0;
      splits = involvedMembers.map(m => {
        const val = Number(memberShares[m.id] || 0);
        sumPct += val;
        return { userId: m.id, percentage: val };
      });
      if (Math.abs(sumPct - 100) > 0.01) {
        toast.error(`Percentages must sum to 100% (currently ${sumPct.toFixed(2)}%)`);
        return;
      }
    } else {
      // EQUAL Split - Backend handles it, but we can pass explicit splits if we want to exclude some members
      // If we exclude some members, we MUST pass the splits explicitly or backend must handle "selected members"
      // Let's pass them explicitly for consistency since we are already doing it for UNEQUAL/PERCENTAGE
      const splitAmt = amount / involvedMembers.length;
      splits = involvedMembers.map(m => ({ userId: m.id, amount: splitAmt }));
    }

    setIsSubmittingExpense(true);
    try {
      await createGroupExpense(groupId, {
        title: expTitle,
        amount: amount,
        splitType: splitType,
        paidById: paidById,
        splits: splits.length > 0 ? splits : undefined,
        receiptUrl: receiptUrl
      });
      
      setExpTitle(''); setExpAmount(''); setMemberShares({}); setReceiptUrl('');
      setShowExpenseModal(false);
      toast.success('Expense added successfully!');
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleSettle = () => {
    // Settle logic can be implemented when backend supports it
    toast.success('Settle up logic coming soon!');
    setShowSettleModal(false);
  };

  const handleAddMember = async (friendId: string) => {
    try {
      await inviteGroupMember(groupId, friendId);
      toast.success('Invitation sent to friend!');
      setShowAddMemberModal(false);
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const handleInviteByIdentifier = async () => {
    if (!memberIdentifier) { toast.error('Enter email or phone'); return; }
    setIsInviting(true);
    try {
      await inviteGroupMember(groupId, undefined, memberIdentifier);
      toast.success('Invitation sent!');
      setMemberIdentifier('');
      setShowAddMemberModal(false);
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to send invitation. Make sure user exists.');
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading || !group) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { key: 'expenses' as TabType, label: 'Expenses', icon: Receipt },
    { key: 'balances' as TabType, label: 'Balances', icon: Scale },
    { key: 'members' as TabType, label: 'Members', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/groups" className="w-10 h-10 rounded-xl bg-white/50 border border-white/60 flex items-center justify-center hover:bg-white/70 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
          <p className="text-sm text-muted">{(group.members || []).length} members • {formatCurrency(group.totalExpenses)} total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1 flex gap-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.key ? 'bg-white/70 text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* History List */}
          <div className="lg:col-span-7 space-y-4">
            <button onClick={() => setShowExpenseModal(true)} className="btn-primary w-full sm:w-auto"><Plus className="w-4 h-4" /> Add Group Expense</button>
            {expenses.length === 0 ? (
              <div className="glass-card text-center py-12">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-muted">No expenses yet in this group</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map(exp => (
                  <div 
                    key={exp.id} 
                    onClick={() => setSelectedExpense(exp)}
                    className={`glass-card group/item relative flex items-center gap-4 py-4 px-5 cursor-pointer transition-all border
                      ${selectedExpense?.id === exp.id ? 'bg-white/80 border-primary/40 shadow-lg scale-[1.02]' : 'hover:bg-white/70 border-white/5 hover:border-primary/20'}`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner transition-colors
                      ${selectedExpense?.id === exp.id ? 'bg-primary/20' : 'bg-gradient-to-br from-primary/15 to-accent/15'}`}>
                      <Receipt className={`w-5 h-5 ${selectedExpense?.id === exp.id ? 'text-primary' : 'text-primary/70'}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold text-foreground truncate">{exp.title}</p>
                      <p className="text-[11px] text-muted font-medium">{exp.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-foreground">{formatCurrency(exp.amount)}</span>
                      <p className="text-[10px] text-primary/70 font-bold uppercase tracking-wider">{exp.splitType}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Box */}
          <div className="lg:col-span-5 sticky top-6">
            {selectedExpense ? (
              <div className="glass-card p-6 border-primary/20 bg-white/40 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground leading-tight">{selectedExpense.title}</h3>
                      <p className="text-xs text-muted font-medium">{selectedExpense.date}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 bg-white/50 rounded-3xl border border-white/60">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Paid by</p>
                          <p className="text-base font-bold text-foreground">{selectedExpense.paidBy}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total</p>
                          <p className="text-2xl font-black text-foreground">{formatCurrency(selectedExpense.amount)}</p>
                        </div>
                      </div>

                      {/* User's Context */}
                      <div className={`mt-4 pt-4 border-t border-white/20 flex items-center justify-between`}>
                        {selectedExpense.paidById === currentUser?.id ? (
                          <>
                            <span className="text-xs font-bold text-success flex items-center gap-1.5 uppercase tracking-wider">
                              <div className="w-2 h-2 rounded-full bg-success"></div> You lent
                            </span>
                            <span className="text-xl font-black text-success">
                              {formatCurrency(selectedExpense.amount)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-danger flex items-center gap-1.5 uppercase tracking-wider">
                              <div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div> You owe
                            </span>
                            <span className="text-xl font-black text-danger">
                              {formatCurrency(selectedExpense.splits?.find((s: any) => s.userId === currentUser?.id)?.amountOwed || 0)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        Member Breakdown <div className="flex-1 h-px bg-white/10"></div>
                      </h4>
                      <div className="space-y-2.5">
                        {selectedExpense.splits?.map((s: any) => (
                          <div key={s.userId} className="flex justify-between items-center group/member">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-[10px] font-bold">
                                {s.userName.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-foreground/80">{s.userName}</span>
                            </div>
                            <span className={`text-sm font-bold ${s.userId === selectedExpense.paidById ? 'text-success' : 'text-foreground'}`}>
                              {formatCurrency(s.amountOwed)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedExpense.receiptUrl && (
                      <div className="pt-4 mt-6 border-t border-white/20">
                        <a 
                          href={selectedExpense.receiptUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-white/30 rounded-2xl text-xs font-bold text-primary hover:bg-white/50 transition-all border border-white/40"
                        >
                          <Camera className="w-4 h-4" /> View Receipt Image
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center border-dashed border-2 border-white/20">
                <p className="text-muted text-sm">Select an expense to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <button onClick={() => setShowSettleModal(true)} className="btn-primary"><Banknote className="w-4 h-4" /> Settle Up</button>
          <div className="space-y-2">
            {balances.length === 0 ? (
              <div className="glass-card text-center py-12 text-muted">No balances to settle</div>
            ) : (
              balances.map(b => (
                <div key={b.userId} className="glass-card flex items-center gap-4 py-3 px-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center font-bold text-sm text-foreground">
                    {b.userName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{b.userName}</p>
                  </div>
                  <span className={`text-base font-bold ${b.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {b.balance >= 0 ? '+' : ''}{formatCurrency(b.balance)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Group Members</h3>
            <button onClick={() => setShowAddMemberModal(true)} className="btn-primary py-2 px-4 h-auto text-sm">
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          </div>
          <div className="space-y-2">
            {(group.members || []).map((member, idx) => (
              <div key={idx} className="glass-card flex items-center gap-4 py-3 px-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center font-bold text-sm text-foreground">
                  {member.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{member}</p>
                  <p className="text-xs text-muted">{idx === 0 ? 'You (Admin)' : 'Member'}</p>
                </div>
                {idx !== 0 && (
                  <button className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-muted hover:text-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">Add Group Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-muted hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Title</label>
                  <input type="text" value={expTitle} onChange={e => setExpTitle(e.target.value)} placeholder="Dinner, Movie, Rent..." className="input-field py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Total Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">₹</span>
                    <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" className="input-field pl-8 py-3 text-lg font-black" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Who Paid?</label>
                  <select 
                    value={paidById} 
                    onChange={e => setPaidById(e.target.value)} 
                    className="input-field py-3 text-sm"
                  >
                    {groupMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} {m.id === currentUser?.id ? '(You)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">Receipt URL (Optional)</label>
                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                    <input type="text" value={receiptUrl} onChange={e => setReceiptUrl(e.target.value)} placeholder="https://image-link.com/receipt" className="input-field pl-10 py-3 text-sm" />
                  </div>
                </div>
              </div>

            <div className="space-y-5 bg-white/30 rounded-3xl p-6 border border-white/40">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-widest">Included Members</label>
                  <button 
                    onClick={() => setSelectedMemberIds(new Set(groupMembers.map(m => m.id)))}
                    className="text-[9px] font-bold text-primary hover:underline"
                  >
                    Select All
                  </button>
                </div>

                <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-4">
                  {groupMembers.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => {
                        const next = new Set(selectedMemberIds);
                        if (next.has(m.id)) next.delete(m.id);
                        else next.add(m.id);
                        setSelectedMemberIds(next);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all
                        ${selectedMemberIds.has(m.id) ? 'bg-primary/5 border-primary/20' : 'bg-white/30 border-white/60 opacity-50 grayscale'}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedMemberIds.has(m.id) ? 'bg-primary border-primary' : 'bg-white border-muted/30'}`}>
                        {selectedMemberIds.has(m.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[11px] font-bold text-foreground">{m.name}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">Split Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['EQUAL', 'UNEQUAL', 'PERCENTAGE'] as const).map(type => (
                      <button 
                        key={type}
                        onClick={() => setSplitType(type)}
                        className={`py-2 rounded-xl text-[10px] font-black transition-all border
                          ${splitType === type ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/50 text-muted border-white/60 hover:border-primary/30'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                    {splitType === 'EQUAL' ? 'Split Details' : 'Member Shares'}
                  </label>
                  
                  <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {splitType === 'EQUAL' ? (
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                        <p className="text-xs text-muted leading-relaxed">
                          Splitting <span className="font-bold text-foreground">₹{Number(expAmount || 0).toFixed(2)}</span> equally among <span className="font-bold text-foreground">{selectedMemberIds.size}</span> selected members.
                        </p>
                        <p className="text-lg font-black text-primary mt-2">
                          ₹{(Number(expAmount || 0) / (selectedMemberIds.size || 1)).toFixed(2)} / each
                        </p>
                      </div>
                    ) : (
                      groupMembers.filter(m => selectedMemberIds.has(m.id)).map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-2 bg-white/50 rounded-xl border border-white/60">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-foreground flex-1 truncate">{m.name}</span>
                          <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted">
                              {splitType === 'PERCENTAGE' ? '%' : '₹'}
                            </span>
                            <input 
                              type="number" 
                              value={memberShares[m.id] || ''} 
                              onChange={e => setMemberShares({...memberShares, [m.id]: e.target.value})}
                              placeholder="0"
                              className="input-field py-1.5 pl-5 pr-2 text-xs font-bold text-right" 
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {splitType !== 'EQUAL' && (
                    <div className="pt-2 border-t border-white/20 flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-muted uppercase">Total {splitType === 'PERCENTAGE' ? 'Percentage' : 'Amount'}</span>
                      <span className={`text-xs font-black ${
                        Math.abs((Object.values(memberShares).reduce((a, b) => a + Number(b || 0), 0)) - (splitType === 'PERCENTAGE' ? 100 : Number(expAmount))) < 0.01 
                        ? 'text-success' : 'text-danger'
                      }`}>
                        {Object.values(memberShares).reduce((a, b) => a + Number(b || 0), 0).toFixed(2)}
                        {splitType === 'PERCENTAGE' ? '%' : ' / ₹' + Number(expAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setShowExpenseModal(false)} className="btn-secondary flex-1 justify-center py-4 rounded-2xl">Cancel</button>
              <button 
                onClick={handleAddExpense} 
                disabled={isSubmittingExpense}
                className="btn-primary flex-1 justify-center py-4 rounded-2xl shadow-xl shadow-primary/30"
              >
                {isSubmittingExpense ? 'Adding...' : 'Add Expense & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Up Modal */}
      {showSettleModal && (
        <div className="modal-overlay" onClick={() => setShowSettleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Settle Up</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Pay To</label>
                <select value={settleTo} onChange={e => setSettleTo(e.target.value)} className="input-field">
                  <option value="">Select member</option>
                  {(group.members || []).filter(m => m !== 'Pranav').map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
                <input type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)} placeholder="0" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSettleModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSettle} className="btn-primary flex-1 justify-center">Settle</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-1">Invite Member</h3>
            <p className="text-sm text-muted mb-6">Send an invitation to join "{group.name}"</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Invite by Email or Phone</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={memberIdentifier} 
                    onChange={e => setMemberIdentifier(e.target.value)} 
                    placeholder="email@example.com" 
                    className="input-field py-2" 
                  />
                  <button 
                    onClick={handleInviteByIdentifier}
                    disabled={isInviting}
                    className="btn-primary py-2 px-4 h-auto text-xs shrink-0"
                  >
                    {isInviting ? '...' : 'Invite'}
                  </button>
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted bg-transparent px-2"><span className="bg-background px-2">Or select a friend</span></div>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {friends.length === 0 ? (
                  <p className="text-[10px] text-muted text-center py-4">No friends found. Add friends first!</p>
                ) : (
                  friends.map(f => (
                    <button key={f.userId} onClick={() => handleAddMember(f.userId)}
                      className="w-full glass-card flex items-center gap-3 py-2 px-3 hover:bg-white/70 transition-all border border-white/5 hover:border-primary/20">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center text-xs font-bold shadow-sm">
                        {f.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                        <p className="text-[10px] text-muted truncate">{f.email || f.phone}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-primary" />
                    </button>
                  ))
                )}
              </div>
            </div>
            <button onClick={() => setShowAddMemberModal(false)} className="btn-secondary w-full mt-4 justify-center">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
