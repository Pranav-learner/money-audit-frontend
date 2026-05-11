'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Filter } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense, Expense } from '@/lib/services/expenses';
import { getCategories, Category } from '@/lib/services/categories';
import toast from 'react-hot-toast';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(true);

  // Modal form state
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fetchExpensesData = async () => {
    try {
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(selectedMonth),
        getCategories()
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
  }, [selectedMonth]);

  const filteredExpenses = expenses.filter(e =>
    (e.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (e.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalMonthly = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormAmount('');
    setFormCategory('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setShowModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setFormAmount(expense.amount.toString());
    setFormCategory(expense.categoryId);
    setFormDate(expense.date);
    setFormDescription(expense.description);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formAmount || !formCategory || !formDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const payload = {
      amount: Number(formAmount),
      categoryId: formCategory,
      expenseDate: formDate,
      description: formDescription,
      title: formDescription // Backend might expect title
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        toast.success('Expense updated!');
      } else {
        await createExpense(payload);
        toast.success('Expense added!');
      }
      setShowModal(false);
      fetchExpensesData();
    } catch (error) {
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        toast.success('Expense deleted');
        fetchExpensesData();
      } catch (error) {
        toast.error('Failed to delete expense');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
          <p className="text-sm text-muted">Track and manage your spending</p>
        </div>
        <button onClick={openAddModal} className="btn-primary" id="add-expense-btn">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field pl-10 w-full sm:w-48"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-muted" />
          <span className="font-semibold text-foreground">Total: {formatCurrency(totalMonthly)}</span>
        </div>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="text-5xl mb-4">💸</div>
          <h3 className="text-lg font-semibold text-foreground">No expenses found</h3>
          <p className="text-sm text-muted mt-1">Click the &quot;+ Add Expense&quot; button to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="glass-card flex items-center gap-4 py-3 px-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-lg shrink-0">
                {categories.find(c => c.id === expense.categoryId)?.icon || '💸'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{expense.description}</p>
                <p className="text-xs text-muted">{expense.category} • {expense.date}</p>
              </div>
              <span className="text-base font-bold text-danger whitespace-nowrap">-{formatCurrency(expense.amount)}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEditModal(expense)} className="p-2 rounded-lg hover:bg-white/60 transition-colors text-muted hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(expense.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-muted hover:text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
                <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0" className="input-field" id="expense-amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="input-field" id="expense-category">
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon || '📁'} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                  className="input-field" id="expense-date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What was it for?" className="input-field" id="expense-description" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center" id="expense-save">
                {editingExpense ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
