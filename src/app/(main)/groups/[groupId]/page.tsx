'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Users, Receipt, Scale, Banknote, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { 
  getGroupById, 
  getGroupExpenses, 
  getGroupBalances, 
  addGroupMember, 
  createGroupExpense,
  Group 
} from '@/lib/services/groups';
import { getFriends, Friend } from '@/lib/services/friends';
import toast from 'react-hot-toast';

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

  // Expense form
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');

  // Settle form
  const [settleAmount, setSettleAmount] = useState('');
  const [settleTo, setSettleTo] = useState('');

  const fetchGroupData = async () => {
    try {
      const [groupData, expensesData, friendsData] = await Promise.all([
        getGroupById(groupId),
        getGroupExpenses(groupId),
        getFriends()
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setFriends(friendsData);
      
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
    if (!expDesc || !expAmount) { toast.error('Fill description and amount'); return; }
    try {
      await createGroupExpense(groupId, {
        description: expDesc,
        amount: Number(expAmount),
        title: expDesc
      });
      setExpDesc(''); setExpAmount('');
      setShowExpenseModal(false);
      toast.success('Expense added & split equally!');
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleSettle = () => {
    // Settle logic can be implemented when backend supports it
    toast.success('Settle up logic coming soon!');
    setShowSettleModal(false);
  };

  const handleAddMember = async (friendId: string) => {
    try {
      await addGroupMember(groupId, friendId);
      toast.success('Member added to group!');
      setShowAddMemberModal(false);
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to add member');
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
          <p className="text-sm text-muted">{group.members.length} members • {formatCurrency(group.totalExpenses)} total</p>
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
        <div className="space-y-4">
          <button onClick={() => setShowExpenseModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Group Expense</button>
          {expenses.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-muted">No expenses yet in this group</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map(exp => (
                <div key={exp.id} className="glass-card flex items-center gap-4 py-3 px-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{exp.title}</p>
                    <p className="text-xs text-muted">Paid by {exp.paidBy} • {exp.date}</p>
                  </div>
                  <span className="text-base font-bold text-foreground">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
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
        <div className="space-y-4">
          <button onClick={() => setShowAddMemberModal(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Add Member</button>
          <div className="space-y-2">
            {group.members.map((member, idx) => (
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
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Add Group Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="What's this for?" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
                <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0" className="input-field" />
              </div>
              <p className="text-xs text-muted">Split equally among all {group.members.length} members</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowExpenseModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddExpense} className="btn-primary flex-1 justify-center">Add & Split</button>
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
                  {group.members.filter(m => m !== 'Pranav').map(m => <option key={m} value={m}>{m}</option>)}
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
            <h3 className="text-xl font-bold text-foreground mb-5">Add Member</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Select Friend</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {friends.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">No friends found. Add friends first!</p>
                ) : (
                  friends.map(f => (
                    <button key={f.id} onClick={() => handleAddMember(f.id)}
                      className="w-full glass-card flex items-center gap-3 py-2 px-3 hover:bg-white/70 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center text-xs font-bold">{f.name?.charAt(0) || 'U'}</div>
                      <span className="text-sm font-medium text-foreground">{f.name}</span>
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
