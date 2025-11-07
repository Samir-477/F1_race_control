import React, { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Award, Star, Activity, AlertCircle, RefreshCw } from 'lucide-react';

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
  team: {
    id: number;
    name: string;
    color: string;
  };
}

interface DriverRating {
  driverId: number;
  driverName: string;
  driverNumber: number;
  teamName: string;
  teamColor: string;
  rating: number;
  totalPoints: number;
  wins: number;
  podiums: number;
  racesParticipated: number;
  avgPosition: number;
  incidents: number;
}

export default function DriverRatings() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [ratings, setRatings] = useState<DriverRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSeasons();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (selectedSeason && drivers.length > 0) {
      fetchDriverRatings();
    }
  }, [selectedSeason, drivers]);

  const fetchSeasons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3002/api/seasons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch seasons');
      
      const data = await res.json();
      setSeasons(data);
      
      // Auto-select active season
      const activeSeason = data.find((s: Season) => s.isActive);
      if (activeSeason) {
        setSelectedSeason(activeSeason.id);
      } else if (data.length > 0) {
        setSelectedSeason(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching seasons:', err);
      setError('Failed to load seasons');
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3002/api/drivers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch drivers');
      
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load drivers');
    }
  };

  const fetchDriverRatings = async () => {
    if (!selectedSeason) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch ratings for all drivers
      const ratingPromises = drivers.map(async (driver) => {
        try {
          const res = await fetch(
            `http://localhost:3002/api/analytics/driver-performance/${driver.id}/${selectedSeason}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (!res.ok) {
            console.warn(`Failed to fetch rating for driver ${driver.id}`);
            return null;
          }
          
          const data = await res.json();
          
          // Also fetch race results to get additional stats
          const statsRes = await fetch(
            `http://localhost:3002/api/drivers/${driver.id}/race-results?seasonId=${selectedSeason}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          let stats = {
            totalPoints: 0,
            wins: 0,
            podiums: 0,
            racesParticipated: 0,
            avgPosition: 0,
            incidents: 0
          };
          
          if (statsRes.ok) {
            const results = await statsRes.json();
            if (results.length > 0) {
              stats.totalPoints = results.reduce((sum: number, r: any) => sum + (r.points || 0), 0);
              stats.wins = results.filter((r: any) => r.position === 1).length;
              stats.podiums = results.filter((r: any) => r.position <= 3).length;
              stats.racesParticipated = results.length;
              stats.avgPosition = results.reduce((sum: number, r: any) => sum + r.position, 0) / results.length;
            }
          }
          
          return {
            driverId: driver.id,
            driverName: driver.name,
            driverNumber: driver.number,
            teamName: driver.team.name,
            teamColor: driver.team.color,
            rating: Number(data.rating) || 0,
            ...stats
          };
        } catch (err) {
          console.error(`Error fetching rating for driver ${driver.id}:`, err);
          return null;
        }
      });
      
      const results = await Promise.all(ratingPromises);
      const validRatings = results.filter((r): r is DriverRating => r !== null && r.racesParticipated > 0);
      
      // Sort by rating descending
      validRatings.sort((a, b) => b.rating - a.rating);
      
      setRatings(validRatings);
    } catch (err) {
      console.error('Error fetching driver ratings:', err);
      setError('Failed to load driver ratings');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 80) return 'text-green-400';
    if (rating >= 60) return 'text-blue-400';
    if (rating >= 40) return 'text-yellow-400';
    if (rating >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingBgColor = (rating: number): string => {
    if (rating >= 80) return 'bg-green-500/20 border-green-500/50';
    if (rating >= 60) return 'bg-blue-500/20 border-blue-500/50';
    if (rating >= 40) return 'bg-yellow-500/20 border-yellow-500/50';
    if (rating >= 20) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 80) return 'Excellent';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Average';
    if (rating >= 20) return 'Below Average';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-yellow-500 flex items-center gap-3">
            <Star className="w-8 h-8" />
            Driver Performance Ratings
          </h2>
          <p className="text-gray-400 mt-2">
            Comprehensive performance ratings based on points, wins, podiums, and incidents
          </p>
        </div>
        <button
          onClick={fetchDriverRatings}
          disabled={loading || !selectedSeason}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Season Selector */}
      <div className="bg-[#161b22] p-4 rounded-lg border border-gray-700">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Select Season
        </label>
        <select
          value={selectedSeason || ''}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="w-full md:w-64 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">Choose a season...</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.year} - {season.name} {season.isActive ? '(Active)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Rating Formula Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400 mb-1">Rating Formula</h3>
            <p className="text-sm text-gray-300">
              Rating = (Points × 2) + (Wins × 10) + (Podiums × 5) - (Avg Position × 2) - (Incidents × 3)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Normalized to 0-100 scale. Higher ratings indicate better performance.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-400">Calculating driver ratings...</p>
        </div>
      )}

      {/* Ratings Table */}
      {!loading && ratings.length > 0 && (
        <div className="bg-[#161b22] rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Podiums
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Races
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Avg Pos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {ratings.map((rating, index) => (
                  <tr key={rating.driverId} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Award className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Award className="w-5 h-5 text-orange-600" />}
                        <span className="font-semibold text-gray-300">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: rating.teamColor }}
                        >
                          {rating.driverNumber}
                        </div>
                        <span className="font-semibold text-white">{rating.driverName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-300">{rating.teamName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`px-3 py-1 rounded-full border ${getRatingBgColor(rating.rating)}`}>
                          <span className={`font-bold text-lg ${getRatingColor(rating.rating)}`}>
                            {rating.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className={`text-xs ${getRatingColor(rating.rating)}`}>
                          {getRatingLabel(rating.rating)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-white">{rating.totalPoints}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-yellow-400">{rating.wins}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-blue-400">{rating.podiums}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-gray-300">{rating.racesParticipated}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-gray-300">{rating.avgPosition.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && ratings.length === 0 && selectedSeason && (
        <div className="text-center py-12 bg-[#161b22] rounded-lg border border-gray-700">
          <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No driver ratings available for this season</p>
          <p className="text-gray-500 text-sm mt-2">
            Drivers need to have participated in races to receive a rating
          </p>
        </div>
      )}

      {/* No Season Selected */}
      {!selectedSeason && (
        <div className="text-center py-12 bg-[#161b22] rounded-lg border border-gray-700">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Please select a season to view driver ratings</p>
        </div>
      )}
    </div>
  );
}
