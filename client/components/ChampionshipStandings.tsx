import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

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

interface Race {
  id: number;
  name: string;
  results?: RaceResult[];
}

interface RaceResult {
  driverId: number;
  teamId: number;
  position: number;
  points: number;
  driver?: { name: string; number: number };
  team?: { name: string; fullName: string; color: string };
}

interface Season {
  id: number;
  year: number;
  name: string;
  isActive: boolean;
}

export default function ChampionshipStandings() {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRaces();
  }, []);

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

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      // Instead of using stored procedure, fetch race results directly
      const response = await fetch(
        `http://localhost:3002/api/races?seasonId=${selectedSeason}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch races');
      }

      const races: Race[] = await response.json();
      
      // Calculate standings from race results
      const standingsMap = new Map();
      
      for (const race of races) {
        if (race.results && race.results.length > 0) {
          for (const result of race.results) {
            if (type === 'driver') {
              const key = result.driverId;
              if (!standingsMap.has(key)) {
                standingsMap.set(key, {
                  id: result.driverId,
                  driverName: result.driver?.name || 'Unknown',
                  number: result.driver?.number || 0,
                  teamName: result.team?.name || 'Unknown',
                  teamColor: result.team?.color || '#000000',
                  totalPoints: 0,
                  wins: 0,
                  podiums: 0,
                  racesParticipated: 0
                });
              }
              const standing = standingsMap.get(key);
              standing.totalPoints += result.points || 0;
              standing.racesParticipated += 1;
              if (result.position === 1) standing.wins += 1;
              if (result.position <= 3) standing.podiums += 1;
            } else {
              // Team standings
              const key = result.teamId;
              if (!standingsMap.has(key)) {
                standingsMap.set(key, {
                  id: result.teamId,
                  teamName: result.team?.name || 'Unknown',
                  fullName: result.team?.fullName || 'Unknown',
                  teamColor: result.team?.color || '#000000',
                  totalPoints: 0,
                  wins: 0,
                  podiums: 0,
                  racesParticipated: 0
                });
              }
              const standing = standingsMap.get(key);
              standing.totalPoints += result.points || 0;
              if (result.position === 1) standing.wins += 1;
              if (result.position <= 3) standing.podiums += 1;
            }
          }
        }
      }
      
      // Convert to array and sort
      const standingsArray = Array.from(standingsMap.values())
        .sort((a, b) => b.totalPoints - a.totalPoints);
      
      setStandings(standingsArray);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch standings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSeason) {
      fetchStandings();
    }
  }, [selectedSeason, type]);

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return null;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Championship Standings
          <span className="text-sm text-gray-400 font-normal ml-2">
            (Using Stored Procedure)
          </span>
        </h1>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Season
            </label>
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

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Championship Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('driver')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  type === 'driver'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Driver
              </button>
              <button
                onClick={() => setType('team')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  type === 'team'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Team
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchStandings}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Standings Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-red-600"></div>
            <p className="text-gray-400 mt-4">Loading standings...</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">No standings data available for this season.</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {type === 'driver' ? 'Driver' : 'Team'}
                    </th>
                    {type === 'driver' && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Number
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Wins
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Podiums
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Races
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {standings.map((standing, index) => (
                    <tr
                      key={standing.id}
                      className={`hover:bg-gray-700/50 transition ${
                        index < 3 ? 'bg-gray-750' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPositionIcon(index + 1)}
                          <span className="text-lg font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-12 rounded"
                            style={{ backgroundColor: standing.teamColor }}
                          />
                          <span className="text-white font-medium">
                            {type === 'driver' ? standing.driverName : standing.teamName}
                          </span>
                        </div>
                      </td>
                      {type === 'driver' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300 font-mono">
                            #{standing.number}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-300">
                          {type === 'driver' ? standing.teamName : standing.fullName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-xl font-bold text-white">
                          {standing.totalPoints}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-300">{standing.wins}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-300">{standing.podiums}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-300">{standing.racesParticipated}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
