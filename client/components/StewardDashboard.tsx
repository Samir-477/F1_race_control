import React, { useState, useEffect } from 'react';
import API_URL from '../lib/config';
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
  isReviewed?: boolean;
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
      const allRacesRes = await fetch(`${API_URL}/api/races`, { headers });
      if (allRacesRes.ok) {
        const races = await allRacesRes.json();
        setAllRaces(races);
      }

      // Fetch current race
      const raceRes = await fetch(`${API_URL}/api/races/active`, { headers });
      if (raceRes.ok) {
        const race = await raceRes.json();
        setCurrentRace(race);
        
        // Fetch race logs and incidents
        if (race) {
          const [logsRes, incidentsRes] = await Promise.all([
            fetch(`${API_URL}/api/races/${race.id}/logs`, { headers }),
            fetch(`${API_URL}/api/races/${race.id}/incidents`, { headers })
          ]);
          
          if (logsRes.ok) setRaceLogs(await logsRes.json());
          if (incidentsRes.ok) setIncidents(await incidentsRes.json());
        }
      } else if (raceRes.status === 404) {
        // No active race found - this is okay
        setCurrentRace(null);
      }

      // Fetch race history
      const historyRes = await fetch(`${API_URL}/api/steward/history`, { headers });
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
      const response = await fetch(`${API_URL}/api/races/${currentRace.id}/generate-logs`, {
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
      const response = await fetch(`${API_URL}/api/races/${currentRace.id}/incidents`, {
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
      const response = await fetch(`${API_URL}/api/races/${currentRace.id}/logs`, {
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
      const response = await fetch(`${API_URL}/api/incidents/${incidentId}/penalties`, {
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
      const response = await fetch(`${API_URL}/api/penalties/${assignmentId}/approve`, {
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
      // Filter for completed races only
      const completedRaces = allRaces.filter(race => race.status === 'COMPLETED');
      
      return (
        <div className="bg-[#161b22] rounded-lg border border-gray-700/60">
          <div className="px-6 py-5 border-b border-gray-700/60 flex items-center gap-3">
            <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
            <h2 className="text-xl font-bold tracking-wide uppercase">Race History</h2>
          </div>

          {completedRaces.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-20">🏁</div>
              <p className="text-gray-400 font-semibold">No completed races yet</p>
              <p className="text-gray-600 text-sm mt-1">Completed races will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/60">
                    <th className="text-left py-3 px-6 text-gray-500 font-semibold text-xs uppercase tracking-widest">Race</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Circuit</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Date</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Season</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Status</th>
                    <th className="text-right py-3 px-6 text-gray-500 font-semibold text-xs uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {completedRaces.map(race => (
                    <tr key={race.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 font-semibold text-white">{race.name}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{race.circuit.name}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{new Date(race.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{race.season.year}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-sm bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
                            {race.status}
                          </span>
                          {race.isReviewed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-sm bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30">
                              ✓ Reviewed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedRace(race)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all duration-200"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    // Race Monitoring View
    // Filter races for monitoring: exclude reviewed races
    const monitoringRaces = allRaces.filter(race => 
      race.status !== 'COMPLETED' || !race.isReviewed
    );

    return (
      <div className="bg-[#161b22] rounded-lg border border-gray-700/60">
        <div className="px-6 py-5 border-b border-gray-700/60 flex items-center gap-3">
          <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
          <h2 className="text-xl font-bold tracking-wide uppercase">Race Monitoring</h2>
        </div>

        {monitoringRaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-20">🏎</div>
            <p className="text-gray-400 font-semibold">No races to monitor</p>
            <p className="text-gray-600 text-sm mt-1">All races have been reviewed or no races are available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/60">
                  <th className="text-left py-3 px-6 text-gray-500 font-semibold text-xs uppercase tracking-widest">Race</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Circuit</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Status</th>
                  <th className="text-right py-3 px-6 text-gray-500 font-semibold text-xs uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {monitoringRaces.map((race) => {
                  const hasLogs = race.logs && race.logs.length > 0;
                  return (
                    <tr key={race.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">{race.name}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{race.circuit.name}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{new Date(race.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-sm ring-1 ${
                          race.status === 'COMPLETED'   ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' :
                          race.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/30' :
                          race.status === 'SCHEDULED'   ? 'bg-sky-500/10 text-sky-400 ring-sky-500/30' :
                                                          'bg-gray-500/10 text-gray-400 ring-gray-500/30'
                        }`}>
                          {race.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedRace(race)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                            hasLogs
                              ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                              : 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500 hover:text-black'
                          }`}
                        >
                          {hasLogs ? 'View Race Log →' : 'Generate Logs →'}
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
      <div className="min-h-screen bg-[#0d1117] px-4 sm:px-8 pb-8 text-gray-200 font-inter">
        <div className="h-20"></div> {/* Spacer for fixed navbar */}
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
        onReview={() => {
          setSelectedRace(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 sm:px-8 pb-8 text-gray-200 font-inter">
      <div className="h-20"></div> {/* Spacer for fixed navbar */}
      {user?.isDemo && (
        <div className="-mx-4 sm:-mx-8 bg-yellow-500 text-black text-center text-sm font-bold py-2 tracking-wide mb-6">
          DEMO MODE — Read Only. Actions are disabled.
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">FIA Race Control</p>
          <h1 className="text-4xl font-black uppercase tracking-wide">Steward Dashboard</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          <aside className="md:w-56 lg:w-52 flex-shrink-0">
            <nav className="bg-[#161b22] rounded-lg border border-gray-700/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700/60">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Navigation</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <SidebarButton viewName="monitoring" label="Race Monitoring" />
                <SidebarButton viewName="history" label="Race History" />
              </div>
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