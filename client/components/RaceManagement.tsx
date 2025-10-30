import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Team, Driver } from '../types';

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

const RaceManagement: React.FC = () => {
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
        fetch('http://localhost:3002/api/races', { headers }),
        fetch('http://localhost:3002/api/circuits', { headers }),
        fetch('http://localhost:3002/api/seasons', { headers }),
        fetch('http://localhost:3002/api/teams', { headers })
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
      const response = await fetch('http://localhost:3002/api/races', {
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
      const response = await fetch(`http://localhost:3002/api/races/${raceId}/participants`, {
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

  const handleDeleteRace = async (raceId: number, raceName: string) => {
    if (!confirm(`Are you sure you want to delete "${raceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/races/${raceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Race deleted successfully');
        fetchData(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete race');
      }
    } catch (error) {
      console.error('Delete race error:', error);
      toast.error('Failed to delete race');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Race Management</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors text-base"
        >
          Create New Race
        </button>
      </div>

      {/* Existing Races Table */}
      {races.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Existing Races</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Race Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Circuit</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Season</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Teams</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {races.map(race => (
                  <tr key={race.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{race.name}</td>
                    <td className="py-4 px-4 text-gray-300">{race.circuit.name}</td>
                    <td className="py-4 px-4 text-gray-300">{new Date(race.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-gray-300">{race.season.year}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        race.status === 'COMPLETED' ? 'bg-green-600 text-white' :
                        race.status === 'IN_PROGRESS' ? 'bg-yellow-600 text-black' :
                        race.status === 'SCHEDULED' ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {race.status || 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{race.participations.length} teams</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRaceSelect(race.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                        >
                          View Details
                        </button>
                        {race.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleDeleteRace(race.id, race.name)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                            title="Delete completed race"
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
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-xl font-bold mb-4 text-yellow-500">Create New Race</h3>
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

            <div className="flex gap-4">
              <button 
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors text-base"
              >
                Create Race
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Race Participants Display */}
      {selectedRace && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-yellow-500">
            {selectedRace.name} - {selectedRace.circuit.name} ({selectedRace.season.year})
          </h3>
          
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
        <p className="text-gray-400">No races created yet. Create your first race above!</p>
      )}
    </div>
  );
};

export default RaceManagement;