import React, { useState, useEffect } from 'react';
import API_URL from '../lib/config';
import toast, { type Toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Steward {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

const demoToast = () => toast.custom((t) => (
  <div className="bg-[#1f2937] border border-yellow-500/40 rounded-lg p-4 shadow-xl flex items-start gap-3 max-w-xs">
    <span className="text-yellow-400 text-lg mt-0.5">🔒</span>
    <div className="flex-1">
      <p className="text-white font-bold text-sm">Demo Account</p>
      <p className="text-gray-400 text-xs mt-0.5">Log in as admin or steward to make changes.</p>
    </div>
    <button onClick={() => toast.dismiss(t.id)} className="text-gray-500 hover:text-white text-xs">✕</button>
  </div>
), { duration: 3000 });

const StewardManagement: React.FC = () => {
  const { user } = useAuth();
  const guard = (action: () => void) => { if (user?.isDemo) { demoToast(); return; } action(); };
  const [stewards, setStewards] = useState<Steward[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStewards();
  }, []);

  const fetchStewards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/stewards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStewards(data);
      } else {
        toast.error('Failed to fetch stewards');
      }
    } catch (error) {
      console.error('Fetch stewards error:', error);
      toast.error('Failed to fetch stewards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.isDemo) { demoToast(); return; }

    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `${API_URL}/api/stewards/${editingId}`
        : `${API_URL}/api/stewards`;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingId ? 'Steward updated successfully!' : 'Steward created successfully!');
        setFormData({ username: '', password: '' });
        setEditingId(null);
        fetchStewards();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save steward');
      }
    } catch (error: any) {
      console.error('Save steward error:', error);
      toast.error(error.message || 'Failed to save steward');
    }
  };

  const handleDelete = (id: number, username: string) => {
    toast.custom((t) => (
      <div className="bg-[#1f2937] border border-gray-600 rounded-lg p-4 shadow-xl flex flex-col gap-3 min-w-[280px]">
        <p className="text-white text-sm">
          Delete steward <span className="font-bold text-red-400">"{username}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/stewards/${id}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                  toast.success('Steward deleted successfully!');
                  fetchStewards();
                } else {
                  const errorData = await response.json();
                  toast.error(errorData.error || 'Failed to delete steward');
                }
              } catch (error: any) {
                toast.error(error.message || 'Failed to delete steward');
              }
            }}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleEdit = (steward: Steward) => {
    setEditingId(steward.id);
    setFormData({ username: steward.username, password: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ username: '', password: '' });
  };

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700/60">
      <div className="px-6 py-5 border-b border-gray-700/60 flex items-center gap-3">
        <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
        <h2 className="text-xl font-bold tracking-wide uppercase">Steward Management</h2>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create/Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#0d1117] rounded-lg border border-gray-700/60 p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              {editingId ? 'Edit Steward' : 'Add New Steward'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm rounded-sm bg-gray-800 border border-gray-700 focus:outline-none focus:border-yellow-500 transition text-white placeholder-gray-600"
                  placeholder="steward@f1control.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Password {editingId && <span className="text-gray-600 normal-case">(leave blank to keep)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                  className="w-full px-3 py-2 text-sm rounded-sm bg-gray-800 border border-gray-700 focus:outline-none focus:border-yellow-500 transition text-white placeholder-gray-600"
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-2 border border-gray-600 text-gray-400 hover:bg-gray-700 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Stewards List */}
        <div className="lg:col-span-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Active Stewards</p>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : stewards.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500 text-sm">No stewards added yet</p>
            </div>
          ) : (
            <div className="bg-[#0d1117] rounded-lg border border-gray-700/60 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/60">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Username</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Added</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {stewards.map((steward) => (
                    <tr key={steward.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-white">{steward.username}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(steward.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => guard(() => handleEdit(steward))}
                            className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => guard(() => handleDelete(steward.id, steward.username))}
                            className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StewardManagement;
