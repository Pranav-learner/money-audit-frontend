'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { getCategories, createCategory, deleteCategory, Category } from '@/lib/services/categories';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category form
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('');

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!catName.trim()) { toast.error('Enter category name'); return; }
    try {
      await createCategory(catName, catIcon || '📁');
      setCatName(''); setCatIcon('');
      setShowCatModal(false);
      toast.success('Category created!');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category?')) {
      try {
        await deleteCategory(id);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted">Manage categories</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Expense Categories</h3>
            <button onClick={() => setShowCatModal(true)} className="btn-primary py-2 px-3 text-sm h-auto"><Plus className="w-4 h-4" /> Add Category</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(c => (
            <div key={c.id} className="glass-card flex items-center gap-3 py-3 px-4 group/cat">
              <span className="text-2xl">{c.icon}</span>
              <p className="text-sm font-semibold text-foreground flex-1">{c.name}</p>
              <button onClick={() => handleDeleteCategory(c.id)}
                className="p-2 rounded-lg opacity-0 group-hover/cat:opacity-100 hover:bg-danger/10 transition-all text-muted hover:text-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Add Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category Name</label>
                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="E.g. Subscriptions" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Icon (Emoji)</label>
                <input type="text" value={catIcon} onChange={e => setCatIcon(e.target.value)} placeholder="📁" className="input-field w-24" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCatModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddCategory} className="btn-primary flex-1 justify-center">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

