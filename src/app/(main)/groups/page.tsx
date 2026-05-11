'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, ArrowRight, Trash2 } from 'lucide-react';
import { getGroups, createGroup, deleteGroup, Group } from '@/lib/services/groups';
import toast from 'react-hot-toast';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async () => {
    if (!groupName.trim()) { toast.error('Enter a group name'); return; }
    try {
      await createGroup(groupName);
      setGroupName('');
      setShowModal(false);
      toast.success('Group created!');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this group?')) {
      try {
        await deleteGroup(id);
        toast.success('Group deleted');
        fetchGroups();
      } catch (error) {
        toast.error('Failed to delete group');
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

  const colors = [
    'from-primary to-emerald-400',
    'from-accent to-violet-400',
    'from-amber-400 to-orange-400',
    'from-rose-400 to-pink-400',
    'from-cyan-400 to-blue-400',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Groups</h2>
          <p className="text-sm text-muted">Split expenses with friends</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Group</button>
      </div>

      {groups.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-foreground">No groups yet</h3>
          <p className="text-sm text-muted mt-1">Create a group to start splitting expenses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, idx) => (
            <div key={group.id} className="glass-card flex flex-col gap-4 group/card">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-white shadow-lg`}>
                  <Users className="w-6 h-6" />
                </div>
                <button onClick={() => handleDelete(group.id)} className="p-2 rounded-lg opacity-0 group-hover/card:opacity-100 hover:bg-danger/10 transition-all text-muted hover:text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{group.name}</h3>
                <p className="text-xs text-muted mt-1">{group.members.length} members • Created {group.createdAt}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div>
                  <p className="text-xs text-muted">Total Expenses</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(group.totalExpenses)}</p>
                </div>
                <Link href={`/groups/${group.id}`} className="btn-secondary text-xs px-3 py-2">
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center gap-1">
                {group.members.slice(0, 4).map((member, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center text-[10px] font-bold text-foreground -ml-1 first:ml-0 border-2 border-white/60">
                    {member.charAt(0)}
                  </div>
                ))}
                {group.members.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-[10px] font-bold text-muted -ml-1 border-2 border-white/60">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-5">Create Group</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Group Name</label>
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="E.g. Flat Expenses" className="input-field" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleCreate} className="btn-primary flex-1 justify-center">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
