'use client';

import { useEffect, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { getBudgets, setBudget as apiSetBudget, Budget } from '@/lib/services/budgets';
import { getCategories, Category } from '@/lib/services/categories';
import toast from 'react-hot-toast';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Budget form
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const fetchBudgetData = async () => {
    try {
      const [budgetsData, categoriesData] = await Promise.all([
        getBudgets(),
        getCategories()
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const handleSetBudget = async () => {
    if (!budgetCategory || !budgetLimit) { toast.error('Fill all fields'); return; }
    try {
      await apiSetBudget(budgetCategory, Number(budgetLimit));
      setBudgetCategory(''); setBudgetLimit('');
      setShowBudgetModal(false);
      toast.success('Budget set!');
      fetchBudgetData();
    } catch (error) {
      toast.error('Failed to set budget');
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Budgets</h2>
            <p className="text-sm text-muted">Manage your spending limits</p>
          </div>
        </div>
        <button onClick={() => setShowBudgetModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Set Budget</button>
      </div>

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="glass-card text-center py-12">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-muted">No budgets set yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(b => {
              const pct = b.percentageUsed;
              const isOver = b.status === 'OVER_BUDGET';
              const isWarning = b.status === 'NEAR_LIMIT';
              return (
                <div key={b.category} className="glass-card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">{b.category}</p>
                    <span className={`badge text-[10px] ${isOver ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/40 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-primary'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted">Spent</span>
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(b.spent)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-muted">Limit</span>
                      <span className="text-sm font-semibold text-muted">{formatCurrency(b.budget)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Set Budget</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <select value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} className="input-field">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon || '📁'} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Monthly Limit (₹)</label>
                <input type="number" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} placeholder="0" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBudgetModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSetBudget} className="btn-primary flex-1 justify-center">Set Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
