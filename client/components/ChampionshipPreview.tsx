import React, { useState, useEffect } from 'react';
import API_URL from '../lib/config';
import { Trophy, Medal, Award } from 'lucide-react';

interface Standing {
  driverId: number;
  driverName: string;
  driverNumber: number;
  teamName: string;
  teamColor: string;
  totalPoints: number;
  wins: number;
  podiums: number;
  racesParticipated: number;
  avgPosition: number;
}

const ChampionshipPreview: React.FC = () => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSeason, setCurrentSeason] = useState<number | null>(null);

  useEffect(() => {
    fetchCurrentSeason();
  }, []);

  useEffect(() => {
    if (currentSeason) {
      fetchStandings();
      // Auto-refresh every 10 seconds to catch updates after steward reviews
      const interval = setInterval(fetchStandings, 10000);
      return () => clearInterval(interval);
    }
  }, [currentSeason]);

  const fetchCurrentSeason = async () => {
    try {
      const response = await fetch(`${API_URL}/api/seasons`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const seasons = await response.json();
      // Find active season or use the latest one
      const activeSeason = seasons.find((s: any) => s.isActive) || seasons[0];
      if (activeSeason) {
        setCurrentSeason(activeSeason.id);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchStandings = async () => {
    if (!currentSeason) return;

    try {
      const response = await fetch(
        `${API_URL}/api/races?seasonId=${currentSeason}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch races');
      }

      const races = await response.json();
      
      // Calculate standings from race results (only reviewed races)
      const standingsMap = new Map<number, Standing>();
      
      for (const race of races) {
        // Only include reviewed races
        if (race.isReviewed && race.results && race.results.length > 0) {
          for (const result of race.results) {
            const key = result.driverId;
            if (!standingsMap.has(key)) {
              standingsMap.set(key, {
                driverId: result.driverId,
                driverName: result.driver?.name || 'Unknown',
                driverNumber: result.driver?.number || 0,
                teamName: result.team?.name || 'Unknown',
                teamColor: result.team?.color || '#000000',
                totalPoints: 0,
                wins: 0,
                podiums: 0,
                racesParticipated: 0,
                avgPosition: 0
              });
            }
            const standing = standingsMap.get(key)!;
            standing.totalPoints += result.points || 0;
            standing.racesParticipated += 1;
            if (result.position === 1) standing.wins += 1;
            if (result.position <= 3) standing.podiums += 1;
          }
        }
      }
      
      // Calculate average position
      for (const race of races) {
        if (race.isReviewed && race.results && race.results.length > 0) {
          for (const result of race.results) {
            const standing = standingsMap.get(result.driverId);
            if (standing) {
              standing.avgPosition += result.position;
            }
          }
        }
      }

      // Finalize average position
      standingsMap.forEach((standing) => {
        if (standing.racesParticipated > 0) {
          standing.avgPosition = standing.avgPosition / standing.racesParticipated;
        }
      });
      
      // Convert to array and sort by points
      const standingsArray = Array.from(standingsMap.values())
        .sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.podiums - a.podiums;
        });
      
      setStandings(standingsArray.slice(0, 10)); // Top 10 drivers
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return null;
  };

  if (loading) {
    return (
      <section id="championship-standings" className="py-20 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-12 uppercase tracking-widest">Driver Championship</h2>
          <p className="text-gray-400">Loading standings...</p>
        </div>
      </section>
    );
  }

  if (standings.length === 0) {
    return (
      <section id="championship-standings" className="py-20 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-12 uppercase tracking-widest">Driver Championship</h2>
          <div className="text-center py-16">
            <div className="mb-6">
              <Trophy className="w-24 h-24 text-gray-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Championship Data Available</h3>
            <p className="text-gray-500">Check back after races are completed and reviewed!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="championship-standings" className="py-20 px-4 bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-4 uppercase tracking-widest">Driver Championship</h2>
        <p className="text-center text-gray-400 mb-12">Top 10 Drivers - Current Season</p>
        
        {/* Standings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standings.map((standing, index) => (
            <div
              key={standing.driverId}
              className="bg-gray-900 rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-300 border-l-4"
              style={{ borderLeftColor: standing.teamColor }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getPositionIcon(index + 1)}
                    <span className="text-3xl font-bold text-white">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{standing.driverName}</h3>
                    <p className="text-sm text-gray-400">#{standing.driverNumber} • {standing.teamName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-500">{standing.totalPoints}</div>
                  <div className="text-xs text-gray-400">POINTS</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-500">{standing.wins}</div>
                  <div className="text-xs text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-500">{standing.podiums}</div>
                  <div className="text-xs text-gray-400">Podiums</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-500">{standing.racesParticipated}</div>
                  <div className="text-xs text-gray-400">Races</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            ⟳ Auto-refreshes every 10 seconds • Updates after steward reviews
          </p>
        </div>
      </div>
    </section>
  );
};

export default ChampionshipPreview;
