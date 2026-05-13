'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, PiggyBank, TrendingUp } from 'lucide-react';
import { getSavings, createSaving, updateSaving, deleteSaving, Saving } from '@/lib/services/savings';
import toast from 'react-hot-toast';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function SavingsPage() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Saving | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTitle, setFormTitle] = useState('');

  const fetchSavings = async () => {
    try {
      const data = await getSavings();
      setSavings(data);
    } catch (error) {
      console.error('Failed to fetch savings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

  const openAdd = () => {
    setEditing(null);
    setFormAmount(''); setFormDate(new Date().toISOString().split('T')[0]); setFormTitle('');
    setShowModal(true);
  };

  const openEdit = (s: Saving) => {
    setEditing(s);
    setFormAmount(s.amount.toString()); setFormDate(s.savingDate); setFormTitle(s.title);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formAmount || !formDate) { toast.error('Fill in amount and date'); return; }
    
    const payload = {
      amount: Number(formAmount),
      savingDate: formDate,
      title: formTitle || 'Saving'
    };

    try {
      if (editing) {
        await updateSaving(editing.id, payload);
        toast.success('Saving updated!');
      } else {
        await createSaving(payload);
        toast.success('Saving added!');
      }
      setShowModal(false);
      fetchSavings();
    } catch (error) {
      toast.error('Failed to save saving');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this saving entry?')) {
      try {
        await deleteSaving(id);
        toast.success('Saving deleted');
        fetchSavings();
      } catch (error) {
        toast.error('Failed to delete saving');
      }
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
          <h2 className="text-2xl font-bold text-foreground">Saving/Income</h2>
          <p className="text-sm text-muted">Track your income and saving goals</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Saving/Income</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-violet-400 flex items-center justify-center text-white shadow-lg">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-medium">Total Balance Impact</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-medium">This Month</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(savings.filter(s => s.savingDate.startsWith(new Date().toISOString().slice(0, 7))).reduce((a, b) => a + b.amount, 0))}</p>
          </div>
        </div>
      </div>

      {/* List */}
      {savings.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-foreground">No entries yet</h3>
          <p className="text-sm text-muted mt-1">Start tracking your income and savings!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savings.map(s => (
            <div key={s.id} className="glass-card flex items-center gap-4 py-3 px-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/15 to-primary/15 flex items-center justify-center text-lg">💰</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{s.title || 'Saving'}</p>
                <p className="text-xs text-muted">{s.savingDate}</p>
              </div>
              <span className="text-base font-bold text-success whitespace-nowrap">+{formatCurrency(s.amount)}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-white/60 transition-colors text-muted hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">{editing ? 'Edit Entry' : 'Add Saving/Income'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
                <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="E.g. Monthly Salary" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
