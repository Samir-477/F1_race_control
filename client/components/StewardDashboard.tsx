import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import RaceMonitoringView from './RaceMonitoringView';

interface Circuit {
  id: number;
  name: string;
  location: string;
  country: string;
  length: number;
  laps: number;
}

interface Season {
  id: number;
  year: number;
  name: string;
  isActive: boolean;
}

interface Driver {
  id: number;
  name: string;
  number: number;
  nationality: string;
  team: {
    id: number;
    name: string;
    color: string;
  };
}

interface Team {
  id: number;
  name: string;
  fullName: string;
  color: string;
  drivers: Driver[];
  car: {
    id: number;
    model: string;
    engine: string;
    chassis: string;
  } | null;
  sponsors: Array<{
    id: number;
    name: string;
  }>;
}

interface Race {
  id: number;
  name: string;
  date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  circuit: Circuit;
  season: Season;
  participations: Array<{
    team: Team;
  }>;
}

interface RaceLog {
  id: number;
  lap: number;
  timestamp: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  driver?: Driver;
  team?: Team;
}

interface RaceIncident {
  id: number;
  lap: number;
  description: string;
  driver: Driver;
  penalty?: {
    id: number;
    type: 'TimePenalty' | 'GridPenalty' | 'Warning' | 'NoFurtherAction';
    value: string;
  };
  penaltyAssignments: Array<{
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    steward: {
      id: number;
      username: string;
    };
    approvedBy?: {
      id: number;
      username: string;
    };
  }>;
}

const StewardDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'monitoring' | 'history'>('monitoring');
  const [currentRace, setCurrentRace] = useState<Race | null>(null);
  const [allRaces, setAllRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [raceLogs, setRaceLogs] = useState<RaceLog[]>([]);
  const [incidents, setIncidents] = useState<RaceIncident[]>([]);
  const [raceHistory, setRaceHistory] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [isGeneratingLogs, setIsGeneratingLogs] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all races
      const allRacesRes = await fetch('http://localhost:3002/api/races', { headers });
      if (allRacesRes.ok) {
        const races = await allRacesRes.json();
        setAllRaces(races);
      }

      // Fetch current race
      const raceRes = await fetch('http://localhost:3002/api/races/active', { headers });
      if (raceRes.ok) {
        const race = await raceRes.json();
        setCurrentRace(race);
        
        // Fetch race logs and incidents
        if (race) {
          const [logsRes, incidentsRes] = await Promise.all([
            fetch(`http://localhost:3002/api/races/${race.id}/logs`, { headers }),
            fetch(`http://localhost:3002/api/races/${race.id}/incidents`, { headers })
          ]);
          
          if (logsRes.ok) setRaceLogs(await logsRes.json());
          if (incidentsRes.ok) setIncidents(await incidentsRes.json());
        }
      }

      // Fetch race history
      const historyRes = await fetch('http://localhost:3002/api/steward/history', { headers });
      if (historyRes.ok) {
        setRaceHistory(await historyRes.json());
      }

    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLogs = async () => {
    if (!currentRace) return;
    
    try {
      setIsGeneratingLogs(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/races/${currentRace.id}/generate-logs`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Generated ${result.count} race logs!`);
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to generate race logs');
      }
    } catch (error) {
      console.error('Generate logs error:', error);
      toast.error('Failed to generate race logs');
    } finally {
      setIsGeneratingLogs(false);
    }
  };

  const handleAddIncident = async (data: { lap: number; description: string; driverId: number }) => {
    if (!currentRace) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/races/${currentRace.id}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Incident added successfully!');
        setShowAddIncident(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add incident');
      }
    } catch (error) {
      console.error('Add incident error:', error);
      toast.error('Failed to add incident');
    }
  };

  const handleAddLog = async (data: { lap: number; description: string; severity: string; driverId?: number; teamId?: number }) => {
    if (!currentRace) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/races/${currentRace.id}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Race log added successfully!');
        setShowAddLog(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add race log');
      }
    } catch (error) {
      console.error('Add log error:', error);
      toast.error('Failed to add race log');
    }
  };

  const handleAssignPenalty = async (incidentId: number, penaltyType: string, penaltyValue: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/incidents/${incidentId}/penalties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ penaltyType, penaltyValue })
      });

      if (response.ok) {
        toast.success('Penalty assigned successfully!');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign penalty');
      }
    } catch (error) {
      console.error('Assign penalty error:', error);
      toast.error('Failed to assign penalty');
    }
  };

  const handleApprovePenalty = async (assignmentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/penalties/${assignmentId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Penalty approved successfully!');
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to approve penalty');
      }
    } catch (error) {
      console.error('Approve penalty error:', error);
      toast.error('Failed to approve penalty');
    }
  };

  const SidebarButton: React.FC<{ viewName: string; label: string; icon?: string }> = ({ viewName, label, icon }) => (
    <button
      onClick={() => setActiveView(viewName as any)}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
        activeView === viewName
          ? 'bg-yellow-500 text-black font-semibold'
          : 'text-gray-300 hover:bg-gray-700/50'
      }`}
    >
      {label}
    </button>
  );

  const renderMainContent = () => {
    if (activeView === 'history') {
      return (
        <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
          <h2 className="text-3xl font-bold mb-6">Race History</h2>
          
          {raceHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No previous races found</p>
              <p className="text-gray-500 text-sm mt-2">Races you've monitored will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {raceHistory.map(race => (
                <div key={race.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{race.name}</h3>
                      <p className="text-gray-400">{race.circuit.name} - {race.season.year}</p>
                      <p className="text-sm text-gray-500">{new Date(race.date).toLocaleDateString()}</p>
                    </div>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      {race.status}
                    </span>
                  </div>
                  
                  {race.incidents && race.incidents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Incidents Monitored:</h4>
                      <div className="space-y-2">
                        {race.incidents.map(incident => (
                          <div key={incident.id} className="bg-gray-700 p-3 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Lap {incident.lap}: {incident.driver.name}</p>
                                <p className="text-sm text-gray-300">{incident.description}</p>
                              </div>
                              {incident.penalty && (
                                <span className="bg-yellow-600 text-black px-2 py-1 rounded text-sm">
                                  {incident.penalty.value}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Race Monitoring View
    return (
      <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
        <h2 className="text-3xl font-bold mb-6">Race Monitoring</h2>
        
        {allRaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No races found</p>
            <p className="text-gray-500 text-sm mt-2">Wait for an admin to create a race</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Race Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Circuit</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {allRaces.map((race) => {
                  const hasLogs = race.logs && race.logs.length > 0;
                  return (
                    <tr
                      key={race.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-white font-medium">{race.name}</td>
                      <td className="py-4 px-4 text-gray-300">{race.circuit.name}</td>
                      <td className="py-4 px-4 text-gray-300">{new Date(race.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          race.status === 'COMPLETED' ? 'bg-green-600 text-white' :
                          race.status === 'IN_PROGRESS' ? 'bg-yellow-600 text-black' :
                          race.status === 'SCHEDULED' ? 'bg-blue-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {race.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setSelectedRace(race)}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            hasLogs
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {hasLogs ? 'View Race Log' : 'Generate Race Logs'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] p-4 sm:p-8 text-gray-200 pt-28 font-inter">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Loading steward dashboard...</p>
        </div>
      </div>
    );
  }

  // Show Race Monitoring View if a race is selected
  if (selectedRace) {
    return (
      <RaceMonitoringView
        race={selectedRace}
        onClose={() => setSelectedRace(null)}
        onFinalize={() => {
          setSelectedRace(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 sm:p-8 text-gray-200 pt-28 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-8 uppercase tracking-wide">Steward Dashboard</h1>
        
        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          <aside className="md:w-1/3 lg:w-1/4 bg-[#161b22] p-4 rounded-lg border border-gray-700 self-stretch">
            <nav className="flex flex-col gap-2">
              <SidebarButton viewName="monitoring" label="Race Monitoring" />
              <SidebarButton viewName="history" label="Race History" />
            </nav>
          </aside>
          <main className="flex-1">
            {renderMainContent()}
          </main>
        </div>

        {/* Add Incident Modal */}
        {showAddIncident && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add Incident</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  lap: parseInt(formData.get('lap') as string),
                  description: formData.get('description') as string,
                  driverId: parseInt(formData.get('driverId') as string)
                };
                handleAddIncident(data);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Driver</label>
                    <select name="driverId" required className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                      <option value="">Select driver</option>
                      {currentRace?.participations.flatMap(p => p.team.drivers).map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} (#{driver.number}) - {driver.team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lap</label>
                    <input type="number" name="lap" required className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" required rows={3} className="w-full p-2 rounded bg-gray-700 border border-gray-600"></textarea>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex-1">
                    Add Incident
                  </button>
                  <button type="button" onClick={() => setShowAddIncident(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Log Modal */}
        {showAddLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add Race Log</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  lap: parseInt(formData.get('lap') as string),
                  description: formData.get('description') as string,
                  severity: formData.get('severity') as string,
                  driverId: formData.get('driverId') ? parseInt(formData.get('driverId') as string) : undefined,
                  teamId: formData.get('teamId') ? parseInt(formData.get('teamId') as string) : undefined
                };
                handleAddLog(data);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lap</label>
                    <input type="number" name="lap" required className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" required rows={3} className="w-full p-2 rounded bg-gray-700 border border-gray-600"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select name="severity" required className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                      <option value="INFO">Info</option>
                      <option value="WARNING">Warning</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Driver (Optional)</label>
                    <select name="driverId" className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                      <option value="">Select driver</option>
                      {currentRace?.participations.flatMap(p => p.team.drivers).map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} (#{driver.number}) - {driver.team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex-1">
                    Add Log
                  </button>
                  <button type="button" onClick={() => setShowAddLog(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StewardDashboard;