import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Steward {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

const StewardManagement: React.FC = () => {
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
      const response = await fetch('http://localhost:4000/api/stewards', {
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
        ? `http://localhost:4000/api/stewards/${editingId}`
        : 'http://localhost:4000/api/stewards';
      
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

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete steward "${username}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/stewards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Steward deleted successfully!');
        fetchStewards();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete steward');
      }
    } catch (error: any) {
      console.error('Delete steward error:', error);
      toast.error(error.message || 'Failed to delete steward');
    }
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
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
      <h2 className="text-3xl font-bold mb-6">Steward Management</h2>

      {/* Create/Edit Form */}
      <div className="bg-[#0d1117] p-6 rounded-lg border border-gray-700 mb-6">
        <h3 className="text-xl font-bold mb-4">
          {editingId ? 'Edit Steward' : 'Create New Steward'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base"
              placeholder="e.g., steward1@f1control.com"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-300 mb-1">
              Password * {editingId && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingId}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base"
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded transition-colors text-base"
            >
              {editingId ? 'Update Steward' : 'Create Steward'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stewards List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Existing Stewards</h3>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : stewards.length === 0 ? (
          <p className="text-gray-400">No stewards created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-bold text-base">Username</th>
                  <th className="text-left py-3 px-4 font-bold text-base">Created</th>
                  <th className="text-right py-3 px-4 font-bold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stewards.map((steward) => (
                  <tr key={steward.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-base">{steward.username}</td>
                    <td className="py-3 px-4 text-base text-gray-400">
                      {new Date(steward.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(steward)}
                        className="text-yellow-500 hover:text-yellow-400 font-semibold mr-4 text-base"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(steward.id, steward.username)}
                        className="text-red-500 hover:text-red-400 font-semibold text-base"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StewardManagement;
