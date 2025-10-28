import React, { useState, useEffect } from 'react';

interface CompletedRace {
  id: number;
  name: string;
  circuit: string;
  circuitLocation: string;
  circuitCountry: string;
  date: string;
  season: number;
  topThree: Array<{
    position: number;
    driver: string;
    team: string;
    time: string;
    penalty: string;
  }>;
}

const RaceResults: React.FC = () => {
  const [completedRaces, setCompletedRaces] = useState<CompletedRace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedRaces();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCompletedRaces, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCompletedRaces = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/races/completed');
      if (response.ok) {
        const data = await response.json();
        setCompletedRaces(data);
      }
    } catch (error) {
      console.error('Error fetching completed races:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPodiumEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
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

  return (
    <section id="race-results" className="py-20 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-12 uppercase tracking-widest">Latest Race Results</h2>
        
        {completedRaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Results Yet</h3>
            <p className="text-gray-500">Check back after races are completed and finalized by stewards!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {completedRaces.map(race => (
              <div key={race.id} className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
                {/* Race Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4">
                  <h3 className="text-2xl font-bold uppercase text-white mb-1">{race.name}</h3>
                  <p className="text-red-100">
                    {race.circuit}, {race.circuitLocation} • {new Date(race.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Results Table */}
                {race.topThree.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-red-500 bg-gray-900">
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Position</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Driver</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Team</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Time</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-400">Penalty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {race.topThree.map((result, index) => (
                          <tr 
                            key={result.position} 
                            className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                              index === 0 ? 'bg-yellow-900/10' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getPodiumEmoji(result.position)}</span>
                                <span className="text-xl font-bold text-white">{result.position}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-lg text-white">{result.driver}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-300">{result.team}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-white font-semibold">{result.time}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-mono font-bold ${
                                result.penalty !== '0s' ? 'text-red-400' : 'text-gray-500'
                              }`}>
                                {result.penalty !== '0s' ? `+${result.penalty}` : '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">Results not available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RaceResults;