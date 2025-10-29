import React, { useState, useEffect } from 'react';
import RaceStandingsTable from './RaceStandingsTable';
import IncidentReviewPanel from './IncidentReviewPanel';
import AddIncidentModal, { IncidentFormData } from './AddIncidentModal';
import ConfirmationModal from './ConfirmationModal';
import toast from 'react-hot-toast';

interface Race {
  id: number;
  name: string;
  date: string;
  status: string;
  isReviewed?: boolean;
  circuit: {
    name: string;
    laps: number;
  };
  season: {
    year: number;
  };
}

interface RaceMonitoringViewProps {
  race: Race;
  onClose: () => void;
  onFinalize: () => void;
  onReview?: () => void;
}

const RaceMonitoringView: React.FC<RaceMonitoringViewProps> = ({ race, onClose, onFinalize, onReview }) => {
  const [standings, setStandings] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isAddIncidentModalOpen, setIsAddIncidentModalOpen] = useState(false);
  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
  const [isConfirmReviewOpen, setIsConfirmReviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLogs, setHasLogs] = useState(false);

  useEffect(() => {
    fetchRaceData();
  }, [race.id]);

  const fetchRaceData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch race standings
      const standingsRes = await fetch(`http://localhost:3002/api/races/${race.id}/standings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (standingsRes.ok) {
        const standingsData = await standingsRes.json();
        setStandings(standingsData.standings || []);
        setHasLogs(true);
      } else {
        setHasLogs(false);
      }

      // Fetch incidents
      const incidentsRes = await fetch(`http://localhost:3002/api/races/${race.id}/race-incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setIncidents(incidentsData);
      }

      // Fetch race details to get drivers
      const raceRes = await fetch(`http://localhost:3002/api/races/${race.id}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (raceRes.ok) {
        const raceData = await raceRes.json();
        const allDrivers = raceData.participations.flatMap((p: any) =>
          p.team.drivers.map((d: any) => ({ ...d, team: p.team }))
        );
        setDrivers(allDrivers);
      }
    } catch (error) {
      console.error('Error fetching race data:', error);
      toast.error('Failed to load race data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLogs = async () => {
    const token = localStorage.getItem('token');
    const loadingToast = toast.loading('Generating race logs...');
    
    try {
      const response = await fetch(`http://localhost:3002/api/races/${race.id}/generate-race-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Race logs generated successfully!', { id: loadingToast });
        await fetchRaceData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate race logs', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error generating race logs:', error);
      toast.error('Failed to generate race logs', { id: loadingToast });
    }
  };

  const handleAddIncident = async (incidentData: IncidentFormData) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3002/api/races/${race.id}/create-incident`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(incidentData),
      });

      if (response.ok) {
        toast.success('Incident created successfully!');
        await fetchRaceData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create incident');
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error('Failed to create incident');
    }
  };

  const handleFinalizeRace = async () => {
    const token = localStorage.getItem('token');
    const loadingToast = toast.loading('Finalizing race...');
    
    try {
      const response = await fetch(`http://localhost:3002/api/races/${race.id}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Race finalized and published successfully!', { id: loadingToast });
        onFinalize();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to finalize race', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error finalizing race:', error);
      toast.error('Failed to finalize race', { id: loadingToast });
    }
  };

  const handleReviewRace = async () => {
    const token = localStorage.getItem('token');
    const loadingToast = toast.loading('Reviewing race...');
    
    try {
      const response = await fetch(`http://localhost:3002/api/races/${race.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Race reviewed and accepted successfully!', { id: loadingToast });
        if (onReview) onReview();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to review race', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error reviewing race:', error);
      toast.error('Failed to review race', { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white mt-4">Loading race data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-[#0d1117] border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{race.name}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {race.circuit.name} • {new Date(race.date).toLocaleDateString()} • {race.season.year}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!hasLogs && (
              <button
                onClick={handleGenerateLogs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Generate Race Logs
              </button>
            )}
            {hasLogs && race.status !== 'COMPLETED' && (
              <button
                onClick={() => setIsConfirmFinalizeOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Finalize & Publish Results
              </button>
            )}
            {race.status === 'COMPLETED' && !race.isReviewed && (
              <button
                onClick={() => setIsConfirmReviewOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Review & Accept Race
              </button>
            )}
            {race.status === 'COMPLETED' && race.isReviewed && (
              <div className="bg-green-900/30 border border-green-600 text-green-400 px-4 py-2 rounded-lg font-semibold">
                ✓ Reviewed & Published
              </div>
            )}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)] overflow-hidden">
        {!hasLogs ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-24 h-24 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">No Race Logs Generated</h2>
              <p className="text-gray-400 mb-6">
                Generate race logs to view standings and manage incidents
              </p>
              <button
                onClick={handleGenerateLogs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Generate Race Logs
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-3 gap-6 p-6">
            {/* Left: Race Standings (2/3 width) */}
            <div className="col-span-2 overflow-y-auto">
              <RaceStandingsTable standings={standings} />
            </div>

            {/* Right: Incident Review (1/3 width) */}
            <div className="overflow-y-auto">
              <IncidentReviewPanel
                incidents={incidents}
                onAddIncident={() => setIsAddIncidentModalOpen(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Incident Modal */}
      <AddIncidentModal
        isOpen={isAddIncidentModalOpen}
        onClose={() => setIsAddIncidentModalOpen(false)}
        onSubmit={handleAddIncident}
        drivers={drivers}
        totalLaps={race.circuit.laps}
      />

      {/* Confirmation Modal for Finalize */}
      <ConfirmationModal
        isOpen={isConfirmFinalizeOpen}
        title="Finalize & Publish Results?"
        message="This will mark the race as completed and publish the results to the landing page. This action cannot be undone."
        confirmText="Publish Results"
        cancelText="Cancel"
        type="warning"
        onConfirm={() => {
          setIsConfirmFinalizeOpen(false);
          handleFinalizeRace();
        }}
        onCancel={() => setIsConfirmFinalizeOpen(false)}
      />

      {/* Confirmation Modal for Review */}
      <ConfirmationModal
        isOpen={isConfirmReviewOpen}
        title="Review & Accept Race?"
        message="This will mark the race as reviewed and make it visible on the landing page. Are you sure all incidents have been properly handled?"
        confirmText="Accept & Publish"
        cancelText="Cancel"
        type="success"
        onConfirm={() => {
          setIsConfirmReviewOpen(false);
          handleReviewRace();
        }}
        onCancel={() => setIsConfirmReviewOpen(false)}
      />
    </div>
  );
};

export default RaceMonitoringView;
