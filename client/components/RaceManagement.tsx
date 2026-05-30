import React, { useState, useEffect } from 'react';
import API_URL from '../lib/config';
import toast from 'react-hot-toast';
import type { Team, Driver } from '../types';
import { useAuth } from '../contexts/AuthContext';

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

interface Race {
  id: number;
  name: string;
  date: string;
  status: string;
  circuit: Circuit;
  season: Season;
  participations: Array<{
    team: Team;
  }>;
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

const RaceManagement: React.FC = () => {
  const { user } = useAuth();
  const guard = (action: () => void) => { if (user?.isDemo) { demoToast(); return; } action(); };
  const [races, setRaces] = useState<Race[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    circuitId: '',
    seasonId: '',
    teamIds: [] as number[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [racesRes, circuitsRes, seasonsRes, teamsRes] = await Promise.all([
        fetch(`${API_URL}/api/races`, { headers }),
        fetch(`${API_URL}/api/circuits`, { headers }),
        fetch(`${API_URL}/api/seasons`, { headers }),
        fetch(`${API_URL}/api/teams`, { headers })
      ]);

      if (racesRes.ok) setRaces(await racesRes.json());
      if (circuitsRes.ok) setCircuits(await circuitsRes.json());
      if (seasonsRes.ok) setSeasons(await seasonsRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());

    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/races`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Race created successfully!');
        setShowCreateForm(false);
        setFormData({ name: '', date: '', circuitId: '', seasonId: '', teamIds: [] });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create race');
      }
    } catch (error) {
      console.error('Create race error:', error);
      toast.error('Failed to create race');
    }
  };

  const handleTeamToggle = (teamId: number) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId]
    }));
  };

  const handleRaceSelect = async (raceId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/races/${raceId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const race = await response.json();
        setSelectedRace(race);
      } else {
        toast.error('Failed to fetch race details');
      }
    } catch (error) {
      console.error('Fetch race error:', error);
      toast.error('Failed to fetch race details');
    }
  };

  const handleDeleteRace = (raceId: number, raceName: string) => {
    toast.custom((t) => (
      <div className="bg-[#1f2937] border border-gray-600 rounded-lg p-4 shadow-xl flex flex-col gap-3 min-w-[280px]">
        <p className="text-white text-sm">
          Delete <span className="font-bold text-red-400">"{raceName}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/races/${raceId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                  toast.success('Race deleted successfully');
                  fetchData();
                } else {
                  const error = await response.json();
                  toast.error(error.error || 'Failed to delete race');
                }
              } catch (error) {
                console.error('Delete race error:', error);
                toast.error('Failed to delete race');
              }
            }}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (loading) {
    return (
      <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700/60">
      <div className="px-6 py-5 border-b border-gray-700/60 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
          <h2 className="text-xl font-bold tracking-wide uppercase">Race Management</h2>
        </div>
        <button
          onClick={() => guard(() => setShowCreateForm(true))}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider transition-colors"
        >
          + New Race
        </button>
      </div>

      {/* Existing Races Table */}
      {races.length > 0 && (
        <div className="mb-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/60">
                  <th className="text-left py-3 px-6 text-gray-500 font-semibold text-xs uppercase tracking-widest">Race</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Circuit</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Season</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-widest">Teams</th>
                  <th className="text-right py-3 px-6 text-gray-500 font-semibold text-xs uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {races.map(race => (
                  <tr key={race.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{race.name}</td>
                    <td className="py-4 px-4 text-gray-400 text-sm">{race.circuit.name}</td>
                    <td className="py-4 px-4 text-gray-400 text-sm">{new Date(race.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-gray-400 text-sm">{race.season.year}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-sm ring-1 ${
                        race.status === 'COMPLETED'   ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' :
                        race.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/30' :
                        race.status === 'SCHEDULED'   ? 'bg-sky-500/10 text-sky-400 ring-sky-500/30' :
                                                        'bg-gray-500/10 text-gray-400 ring-gray-500/30'
                      }`}>
                        {race.status || 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">{race.participations.length} teams</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleRaceSelect(race.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all duration-200"
                        >
                          Details →
                        </button>
                        {race.status === 'COMPLETED' && (
                          <button
                            onClick={() => guard(() => handleDeleteRace(race.id, race.name))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Race Form */}
      {showCreateForm && (
        <div className="border-t border-gray-700/60 px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 bg-yellow-500 rounded-full"></div>
            <h3 className="text-base font-bold uppercase tracking-wide text-yellow-400">Create New Race</h3>
          </div>
          <form onSubmit={handleCreateRace} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-300 mb-1">Race Name *</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base"
                  placeholder="e.g., Monaco Grand Prix"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-300 mb-1">Race Date *</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-300 mb-1">Circuit *</label>
                <select 
                  value={formData.circuitId}
                  onChange={(e) => setFormData(prev => ({ ...prev, circuitId: e.target.value }))}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base"
                >
                  <option value="">Select Circuit</option>
                  {circuits.map(circuit => (
                    <option key={circuit.id} value={circuit.id}>
                      {circuit.name} - {circuit.location}, {circuit.country}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-300 mb-1">Season *</label>
                <select 
                  value={formData.seasonId}
                  onChange={(e) => setFormData(prev => ({ ...prev, seasonId: e.target.value }))}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base"
                >
                  <option value="">Select Season</option>
                  {seasons.map(season => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">Participating Teams *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teams.map(team => (
                  <label key={team.id} className="flex items-center space-x-2 p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.teamIds.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                      className="text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-sm">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Create Race
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-5 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Race Participants Display */}
      {selectedRace && (
        <div className="border-t border-gray-700/60 px-6 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-yellow-500 rounded-full"></div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-wide text-white">{selectedRace.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{selectedRace.circuit.name} · {selectedRace.season.year}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-bold text-base">Team</th>
                  <th className="text-left py-3 px-4 font-bold text-base">Drivers</th>
                  <th className="text-left py-3 px-4 font-bold text-base">Car</th>
                  <th className="text-left py-3 px-4 font-bold text-base">Sponsors</th>
                </tr>
              </thead>
              <tbody>
                {selectedRace.participations.map((participation) => (
                  <tr key={participation.team.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: participation.team.color }}
                        ></div>
                        <div>
                          <p className="font-bold">{participation.team.name}</p>
                          <p className="text-sm text-gray-400">{participation.team.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {participation.team.drivers.map(driver => (
                        <div key={driver.id} className="text-sm">
                          <span className="font-semibold">#{driver.number}</span> {driver.name} ({driver.nationality})
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      {participation.team.car ? (
                        <div className="text-sm">
                          <p className="font-semibold">{participation.team.car.model}</p>
                          <p className="text-gray-400">Engine: {participation.team.car.engine}</p>
                          <p className="text-gray-400">Chassis: {participation.team.car.chassis}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">No car data</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {participation.team.sponsors.map(sponsor => (
                          <span key={sponsor.id} className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {sponsor.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedRace && races.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4 opacity-20">🏁</div>
          <p className="text-gray-400 font-semibold">No races yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first race using the button above</p>
        </div>
      )}
    </div>
  );
};

export default RaceManagement;