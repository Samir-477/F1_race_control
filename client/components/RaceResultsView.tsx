import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Calendar } from 'lucide-react';

interface RaceResult {
  id: number;
  position: number;
  time: string;
  points: number;
  fastestLap: string;
  penalty: string;
  driver: {
    id: number;
    name: string;
    number: number;
  };
  team: {
    id: number;
    name: string;
    color: string;
  };
}

interface Race {
  id: number;
  name: string;
  date: string;
  status: string;
  circuit: {
    name: string;
    location: string;
    country: string;
  };
  results?: RaceResult[];
}

interface Standing {
  id: number;
  driverName?: string;
  number?: number;
  teamName: string;
  teamColor?: string;
  fullName?: string;
  color?: string;
  totalPoints: number;
  wins: number;
  podiums: number;
  racesParticipated: number;
}

interface Season {
  id: number;
  year: number;
  name: string;
}

export default function RaceResultsView() {
  const [viewMode, setViewMode] = useState<'race' | 'championship'>('race');
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Championship standings state
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [championshipType, setChampionshipType] = useState<'driver' | 'team'>('driver');
  const [standings, setStandings] = useState<Standing[]>([]);

  useEffect(() => {
    fetchRaces();
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (selectedRace && viewMode === 'race') {
      fetchRaceResults();
    }
  }, [selectedRace, viewMode]);

  useEffect(() => {
    if (selectedSeason && viewMode === 'championship') {
      fetchChampionshipStandings();
    }
  }, [selectedSeason, championshipType, viewMode]);

  const fetchRaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/races', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setRaces(data);
      if (data.length > 0) {
        setSelectedRace(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch races:', err);
    }
  };

  const fetchSeasons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/seasons', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setSeasons(data);
      if (data.length > 0) {
        setSelectedSeason(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch seasons:', err);
    }
  };

  const fetchRaceResults = async () => {
    if (!selectedRace) return;
    
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3002/api/races/${selectedRace}/results`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch race results');
      }

      const data = await response.json();
      setResults(data.sort((a: RaceResult, b: RaceResult) => a.position - b.position));
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch race results:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChampionshipStandings = async () => {
    if (!selectedSeason) return;

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3002/api/analytics/championship-standings/${selectedSeason}/${championshipType}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch championship standings');
      }

      const data = await response.json();
      setStandings(data.standings || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch championship standings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const selectedRaceData = races.find(r => r.id === selectedRace);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            {viewMode === 'race' ? 'Race Results' : 'Championship Standings'}
            {viewMode === 'championship' && (
              <span className="text-sm text-gray-400 font-normal">(Using Stored Procedure)</span>
            )}
          </h1>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('race')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                viewMode === 'race'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Race Results
            </button>
            <button
              onClick={() => setViewMode('championship')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                viewMode === 'championship'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Championship Standings
            </button>
          </div>
        </div>

        {/* Race Selector - Only show in race mode */}
        {viewMode === 'race' && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Race
          </label>
          <select
            value={selectedRace || ''}
            onChange={(e) => setSelectedRace(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name} - {new Date(race.date).toLocaleDateString()} ({race.status})
              </option>
            ))}
          </select>
          </div>
        )}

        {/* Race Info */}
        {viewMode === 'race' && selectedRaceData && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedRaceData.name}</h2>
            <div className="flex gap-4 text-gray-300">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(selectedRaceData.date).toLocaleDateString()}
              </span>
              <span>📍 {selectedRaceData.circuit?.name}, {selectedRaceData.circuit?.country}</span>
              <span className="px-2 py-1 bg-gray-700 rounded text-sm">{selectedRaceData.status}</span>
            </div>
          </div>
        )}

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="text-gray-400 mt-4">Loading results...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Championship Standings Controls */}
        {viewMode === 'championship' && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
              <select
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.year} - {season.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setChampionshipType('driver')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    championshipType === 'driver'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Driver
                </button>
                <button
                  onClick={() => setChampionshipType('team')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    championshipType === 'team'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Championship Standings Table */}
        {viewMode === 'championship' && !loading && !error && standings.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Pos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    {championshipType === 'driver' ? 'Driver' : 'Team'}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Points</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Wins</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Podiums</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Races</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {standings.map((standing, index) => (
                  <tr key={standing.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getPositionIcon(index + 1)}
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-12 rounded" style={{ backgroundColor: standing.teamColor || standing.color || '#000' }} />
                        <div>
                          <div className="text-white font-medium">
                            {championshipType === 'driver' ? standing.driverName : standing.teamName}
                          </div>
                          {championshipType === 'driver' && (
                            <div className="text-xs text-gray-400">#{standing.number} - {standing.teamName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full font-bold text-lg">
                        {standing.totalPoints}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-yellow-400 font-bold">{standing.wins}</td>
                    <td className="px-4 py-3 text-center text-orange-400 font-bold">{standing.podiums}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{standing.racesParticipated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'championship' && !loading && !error && standings.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No standings data available for this season.</p>
          </div>
        )}

        {/* Results Table */}
        {viewMode === 'race' && !loading && !error && results.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Pos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Time</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Points</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Fastest Lap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getPositionIcon(result.position)}
                        <span className="text-white font-bold text-lg">{result.position}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-12 rounded" style={{ backgroundColor: result.team.color }} />
                        <div>
                          <div className="text-white font-medium">{result.driver.name}</div>
                          <div className="text-xs text-gray-400">#{result.driver.number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{result.team.name}</td>
                    <td className="px-4 py-3 text-center text-white font-mono">{result.time}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full font-bold">
                        {result.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-purple-400 font-mono">
                      {result.fastestLap || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'race' && !loading && !error && results.length === 0 && selectedRace && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No results available for this race yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
