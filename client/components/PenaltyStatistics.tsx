import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Shield, AlertTriangle } from 'lucide-react';

interface DriverStats {
  driverId: number;
  driverName: string;
  number: number;
  teamName: string;
  teamColor: string;
  totalIncidents: number;
  totalPenalties: number;
  timePenalties: number;
  gridPenalties: number;
  warnings: number;
  noFurtherActions: number;
  avgTimePenaltySeconds: number;
}

interface TeamStats {
  teamId: number;
  teamName: string;
  teamColor: string;
  totalIncidents: number;
  totalPenalties: number;
  timePenalties: number;
  gridPenalties: number;
  warnings: number;
  noFurtherActions: number;
  driversInvolved: number;
}

interface TypeStats {
  penaltyType: string;
  count: number;
  driversAffected: number;
  racesAffected: number;
  avgPenaltyValue: number | null;
}

interface Season {
  id: number;
  year: number;
  name: string;
}

export default function PenaltyStatistics() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [view, setView] = useState<'driver' | 'team' | 'type'>('driver');
  const [driverStats, setDriverStats] = useState<DriverStats[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [selectedSeason, view]);

  const fetchSeasons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3002/api/seasons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSeasons(data);
      if (data.length > 0) {
        setSelectedSeason(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch seasons:', err);
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const seasonParam = selectedSeason ? `?seasonId=${selectedSeason}` : '';
      
      if (view === 'driver') {
        const res = await fetch(
          `http://localhost:3002/api/analytics/penalty-statistics/by-driver${seasonParam}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        setDriverStats(data);
      } else if (view === 'team') {
        const res = await fetch(
          `http://localhost:3002/api/analytics/penalty-statistics/by-team${seasonParam}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        setTeamStats(data);
      } else {
        const res = await fetch(
          `http://localhost:3002/api/analytics/penalty-statistics/by-type${seasonParam}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        setTypeStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-500" />
          Penalty Statistics
          <span className="text-sm text-gray-400 font-normal ml-2">
            (Aggregate Query Analysis)
          </span>
        </h1>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Season Filter
            </label>
            <select
              value={selectedSeason || ''}
              onChange={(e) => setSelectedSeason(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Seasons</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.year} - {season.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              View By
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setView('driver')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  view === 'driver'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Driver
              </button>
              <button
                onClick={() => setView('team')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  view === 'team'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-1" />
                Team
              </button>
              <button
                onClick={() => setView('type')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  view === 'type'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Type
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-purple-600"></div>
            <p className="text-gray-400 mt-4">Loading statistics...</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {view === 'driver' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Driver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Incidents</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Penalties</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Time</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Grid</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Warnings</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Avg Time (s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {driverStats.map((stat, index) => (
                      <tr key={stat.driverId} className="hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3 text-white font-bold">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-10 rounded" style={{ backgroundColor: stat.teamColor }} />
                            <div>
                              <div className="text-white font-medium">{stat.driverName}</div>
                              <div className="text-xs text-gray-400">#{stat.number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{stat.teamName}</td>
                        <td className="px-4 py-3 text-center text-white font-semibold">{stat.totalIncidents}</td>
                        <td className="px-4 py-3 text-center text-red-400 font-semibold">{stat.totalPenalties}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{stat.timePenalties}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{stat.gridPenalties}</td>
                        <td className="px-4 py-3 text-center text-yellow-400">{stat.warnings}</td>
                        <td className="px-4 py-3 text-center text-gray-300">
                          {stat.avgTimePenaltySeconds ? stat.avgTimePenaltySeconds.toFixed(1) : '0.0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {driverStats.length === 0 && (
                  <div className="p-8 text-center text-gray-400">No penalty data available.</div>
                )}
              </div>
            )}

            {view === 'team' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Incidents</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Penalties</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Time</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Grid</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Warnings</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Drivers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {teamStats.map((stat, index) => (
                      <tr key={stat.teamId} className="hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3 text-white font-bold">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-10 rounded" style={{ backgroundColor: stat.teamColor }} />
                            <span className="text-white font-medium">{stat.teamName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-white font-semibold">{stat.totalIncidents}</td>
                        <td className="px-4 py-3 text-center text-red-400 font-semibold">{stat.totalPenalties}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{stat.timePenalties}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{stat.gridPenalties}</td>
                        <td className="px-4 py-3 text-center text-yellow-400">{stat.warnings}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{stat.driversInvolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {teamStats.length === 0 && (
                  <div className="p-8 text-center text-gray-400">No penalty data available.</div>
                )}
              </div>
            )}

            {view === 'type' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Penalty Type</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Total Count</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Drivers Affected</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Races Affected</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {typeStats.map((stat) => (
                      <tr key={stat.penaltyType} className="hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded font-medium ${
                            stat.penaltyType === 'TimePenalty' ? 'bg-red-900/50 text-red-300' :
                            stat.penaltyType === 'GridPenalty' ? 'bg-orange-900/50 text-orange-300' :
                            stat.penaltyType === 'Warning' ? 'bg-yellow-900/50 text-yellow-300' :
                            'bg-green-900/50 text-green-300'
                          }`}>
                            {stat.penaltyType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-white font-bold text-xl">{stat.count}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{stat.driversAffected}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{stat.racesAffected}</td>
                        <td className="px-4 py-3 text-center text-gray-300">
                          {stat.avgPenaltyValue ? `${stat.avgPenaltyValue.toFixed(1)}s` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {typeStats.length === 0 && (
                  <div className="p-8 text-center text-gray-400">No penalty data available.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
