import React, { useState } from 'react';

interface Incident {
  id: number;
  lap: number;
  driver: {
    id: number;
    name: string;
    team: {
      name: string;
    };
  };
  description: string;
  penalty?: {
    type: string;
    value: string;
  };
}

interface IncidentReviewPanelProps {
  incidents: Incident[];
  onAddIncident: () => void;
  onEditIncident?: (incidentId: number) => void;
  onDeleteIncident?: (incidentId: number) => void;
}

const IncidentReviewPanel: React.FC<IncidentReviewPanelProps> = ({
  incidents,
  onAddIncident,
  onEditIncident,
  onDeleteIncident,
}) => {
  const [expandedIncident, setExpandedIncident] = useState<number | null>(null);

  const toggleIncident = (incidentId: number) => {
    setExpandedIncident(expandedIncident === incidentId ? null : incidentId);
  };

  const getPenaltyColor = (type?: string) => {
    switch (type) {
      case 'TimePenalty':
        return 'text-red-500';
      case 'GridPenalty':
        return 'text-orange-500';
      case 'Warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatPenaltyType = (type?: string) => {
    switch (type) {
      case 'TimePenalty':
        return 'Time Penalty';
      case 'GridPenalty':
        return 'Grid Penalty';
      case 'Warning':
        return 'Warning';
      case 'NoFurtherAction':
        return 'No Further Action';
      default:
        return 'No Penalty';
    }
  };

  return (
    <div className="bg-[#1a1f2e] rounded-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Incident Review</h2>
        <button
          onClick={onAddIncident}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          Add Incident
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {incidents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No incidents reported yet.</p>
            <p className="text-sm mt-2">Click "Add Incident" to report an incident.</p>
          </div>
        ) : (
          incidents.map((incident, index) => (
            <div
              key={incident.id}
              className="bg-[#0d1117] rounded-lg border border-gray-700 overflow-hidden"
            >
              {/* Incident Header */}
              <button
                onClick={() => toggleIncident(incident.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">
                    Incident #{index + 1}: {incident.driver.name}
                  </span>
                  <span className="text-gray-400 text-sm">(Lap {incident.lap})</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedIncident === incident.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Incident Details (Expanded) */}
              {expandedIncident === incident.id && (
                <div className="px-4 pb-4 border-t border-gray-700">
                  <div className="mt-3 space-y-3">
                    {/* Driver Info */}
                    <div>
                      <p className="text-gray-400 text-xs uppercase mb-1">Driver</p>
                      <p className="text-white">
                        {incident.driver.name}{' '}
                        <span className="text-gray-400">({incident.driver.team.name})</span>
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-gray-400 text-xs uppercase mb-1">Description</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    {/* Penalty */}
                    <div>
                      <p className="text-gray-400 text-xs uppercase mb-1">Penalty</p>
                      {incident.penalty ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getPenaltyColor(incident.penalty.type)}`}>
                            {formatPenaltyType(incident.penalty.type)}
                          </span>
                          <span className="text-gray-400">-</span>
                          <span className="text-white font-mono">{incident.penalty.value}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No penalty assigned</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                      {onEditIncident && (
                        <button
                          onClick={() => onEditIncident(incident.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {onDeleteIncident && (
                        <button
                          onClick={() => onDeleteIncident(incident.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncidentReviewPanel;
