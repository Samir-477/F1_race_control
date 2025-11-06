import React, { useState } from 'react';

interface Driver {
  id: number;
  name: string;
  number: number;
  team: {
    name: string;
  };
}

interface AddIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentFormData) => void;
  drivers: Driver[];
  totalLaps: number;
}

export interface IncidentFormData {
  driverId: number;
  lap: number;
  description: string;
  penaltyType?: string;
  penaltyValue?: string;
}

const AddIncidentModal: React.FC<AddIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  drivers,
  totalLaps,
}) => {
  const [formData, setFormData] = useState<IncidentFormData>({
    driverId: 0,
    lap: 1,
    description: '',
    penaltyType: '',
    penaltyValue: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.driverId || !formData.lap) {
      alert('Please select a driver and enter a lap number');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        driverId: 0,
        lap: 1,
        description: '',
        penaltyType: '',
        penaltyValue: '',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting incident:', error);
      alert('Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1f2e] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Add Race Incident</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Driver Selection */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              Driver <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: parseInt(e.target.value) })}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              required
            >
              <option value={0}>Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  #{driver.number} {driver.name} ({driver.team.name})
                </option>
              ))}
            </select>
          </div>

          {/* Lap Number */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              Lap Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={totalLaps}
              value={formData.lap}
              onChange={(e) => setFormData({ ...formData, lap: parseInt(e.target.value) })}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              required
            />
            <p className="text-gray-500 text-sm mt-1">Total laps: {totalLaps}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe the incident in detail..."
              className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
              required
            />
          </div>

          {/* Penalty Type */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Penalty Type</label>
            <select
              value={formData.penaltyType}
              onChange={(e) => setFormData({ ...formData, penaltyType: e.target.value })}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="">No Penalty</option>
              <option value="TimePenalty">Time Penalty</option>
              <option value="Warning">Warning</option>
              <option value="NoFurtherAction">No Further Action</option>
            </select>
          </div>

          {/* Penalty Value */}
          {formData.penaltyType && formData.penaltyType !== 'NoFurtherAction' && (
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Penalty Value</label>
              <input
                type="text"
                value={formData.penaltyValue}
                onChange={(e) => setFormData({ ...formData, penaltyValue: e.target.value })}
                placeholder={
                  formData.penaltyType === 'TimePenalty'
                    ? 'e.g., 5 seconds, 10 seconds'
                    : 'e.g., Official Warning'
                }
                className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncidentModal;
