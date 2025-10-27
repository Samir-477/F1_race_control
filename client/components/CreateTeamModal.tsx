import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface CreateTeamModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    description: '',
    base: '',
    teamChief: '',
    color: '#FF0000'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      console.log('Creating team with data:', formData);
      
      const response = await fetch('http://localhost:4000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create team');
      }

      const result = await response.json();
      console.log('Team created:', result);
      
      toast.success('Team created successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Create team error:', err);
      toast.error(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6 uppercase">Create New Team</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Team Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Red Bull"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Oracle Red Bull Racing"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Team description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Base *
              </label>
              <input
                type="text"
                name="base"
                value={formData.base}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., Milton Keynes, UK"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Team Chief *
              </label>
              <input
                type="text"
                name="teamChief"
                value={formData.teamChief}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., Christian Horner"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Team Color *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className="h-12 w-16 bg-gray-700 border border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                placeholder="#FF0000"
                className="flex-1 bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Select a color or enter hex code</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
