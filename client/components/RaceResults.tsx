import React, { useState, useEffect } from 'react';

interface RaceStanding {
  position: number;
  driver: string;
  team: string;
  time: string;
  points: number;
  penalty: string;
}

interface LatestRaceResult {
  id: number;
  name: string;
  circuit: string;
  circuitLocation: string;
  circuitCountry: string;
  date: string;
  season: number;
  standings: RaceStanding[];
}

const RaceResults: React.FC = () => {
  const [latestRace, setLatestRace] = useState<LatestRaceResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestRace();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLatestRace, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLatestRace = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/races/latest-result', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched latest race:', data); // Debug log
        setLatestRace(data);
      } else {
        console.log('No race data available');
        setLatestRace(null);
      }
    } catch (error) {
      console.error('Error fetching latest race:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position: number): string => {
    switch (position) {
      case 1: return 'border-l-red-500';
      case 2: return 'border-l-orange-500';
      case 3: return 'border-l-cyan-400';
      case 4: return 'border-l-yellow-500';
      case 5: return 'border-l-green-500';
      case 6: return 'border-l-blue-500';
      default: return 'border-l-gray-600';
    }
  };

  if (loading) {
    return (
      <section id="race-results" className="py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-12 uppercase tracking-widest">Latest Race Results</h2>
          <p className="text-gray-400">Loading results...</p>
        </div>
      </section>
    );
  }

  if (!latestRace) {
    return (
      <section id="race-results" className="py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-12 uppercase tracking-widest">Latest Race Results</h2>
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Reviewed Results Available</h3>
            <p className="text-gray-500">Check back after races are completed and reviewed by stewards!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="race-results" className="py-20 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-12 uppercase tracking-widest">Latest Race Results</h2>
        
        {/* Race Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-6 rounded-t-lg">
          <h3 className="text-3xl font-bold uppercase text-white mb-2">{latestRace.name}</h3>
          <p className="text-red-100 text-lg">
            {latestRace.circuit}, {latestRace.circuitCountry} - {new Date(latestRace.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            })}
          </p>
        </div>

        {/* Results Table */}
        <div className="bg-gray-800 rounded-b-lg shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Pos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Driver</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Team</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Time</th>
                <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider text-gray-400">Points</th>
              </tr>
            </thead>
            <tbody>
              {latestRace.standings.map((standing) => (
                <tr 
                  key={standing.position} 
                  className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors border-l-4 ${getPositionColor(standing.position)}`}
                >
                  <td className="px-6 py-4">
                    <span className="text-xl font-bold text-white">{standing.position}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-lg text-white">{standing.driver}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{standing.team}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-white">{standing.time}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-red-500 font-bold text-lg">{standing.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RaceResults;