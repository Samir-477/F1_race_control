import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Users } from 'lucide-react';

interface TeamData {
  teamName: string;
  color: string;
  totalPoints: number;
  wins: number;
  podiums: number;
}

export default function TeamPerformance() {
  const [teamData, setTeamData] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      
      // Fetch team standings for season 2 (2025)
      const response = await fetch(
        'http://localhost:3002/api/analytics/championship-standings/2/team',
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch team performance data');
      }

      const data = await response.json();
      setTeamData(data.standings || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch team performance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          Team Performance Report
          <span className="text-sm text-gray-400 font-normal">(2025 Season)</span>
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading team performance data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Team Performance Chart */}
        {!loading && !error && teamData.length > 0 && (
          <div className="space-y-6">
            {/* Points Bar Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Championship Points by Team
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={teamData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="teamName" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                  <Bar 
                    dataKey="totalPoints" 
                    fill="#10B981" 
                    name="Points"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Wins and Podiums Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Wins & Podiums Comparison
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="teamName" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                  <Bar 
                    dataKey="wins" 
                    fill="#F59E0B" 
                    name="Wins"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="podiums" 
                    fill="#8B5CF6" 
                    name="Podiums"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Team Statistics Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">Team Statistics</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Points</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Wins</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Podiums</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {teamData.map((team, index) => (
                    <tr key={team.teamName} className="hover:bg-gray-700/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-white font-medium">{team.teamName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full font-bold">
                          {team.totalPoints}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-yellow-400 font-bold">
                        {team.wins}
                      </td>
                      <td className="px-4 py-3 text-center text-purple-400 font-bold">
                        {team.podiums}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300">
                        {team.wins > 0 ? `${((team.wins / 1) * 100).toFixed(0)}%` : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && teamData.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No team performance data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
