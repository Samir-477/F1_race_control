import React, { useState, useEffect } from 'react';
import { FileText, Calendar, MapPin, Flag } from 'lucide-react';

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
}

interface RaceInfo {
  raceName: string;
  date: string;
  status: string;
  circuitName: string;
  location: string;
  country: string;
  circuitLength: number;
  laps: number;
  season: number;
  totalFinishers: number;
  totalIncidents: number;
  totalPenalties: number;
}

interface RaceResult {
  position: number;
  driverName: string;
  number: number;
  teamName: string;
  time: string;
  points: number;
  penalty: string;
  fastestLap: string;
}

interface Incident {
  lap: number;
  driverName: string;
  teamName: string;
  description: string;
  penaltyType: string | null;
  penaltyValue: string | null;
  penaltyStatus: string | null;
  stewardName: string | null;
}

export default function RaceReportView() {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [report, setReport] = useState<{
    raceInfo: RaceInfo | null;
    results: RaceResult[];
    incidents: Incident[];
  }>({ raceInfo: null, results: [], incidents: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    if (selectedRace) {
      fetchRaceReport();
    }
  }, [selectedRace]);

  const fetchRaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/races', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setRaces(data.filter((race: Race) => race.status === 'COMPLETED'));
      if (data.length > 0) {
        const completedRaces = data.filter((race: Race) => race.status === 'COMPLETED');
        if (completedRaces.length > 0) {
          setSelectedRace(completedRaces[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch races:', err);
    }
  };

  const fetchRaceReport = async () => {
    if (!selectedRace) return;
    
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3002/api/race-report/${selectedRace}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch race report');
      }

      const data = await response.json();
      setReport({
        raceInfo: data.raceInfo || null,
        results: data.results || [],
        incidents: data.incidents || []
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch race report:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedRaceData = races.find(r => r.id === selectedRace);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          Race Report
          <span className="text-sm text-gray-400 font-normal">(Using Stored Procedure)</span>
        </h1>

        {/* Race Selector */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Completed Race
          </label>
          <select
            value={selectedRace || ''}
            onChange={(e) => setSelectedRace(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name} - {new Date(race.date).toLocaleDateString()} ({race.status})
              </option>
            ))}
          </select>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Generating race report...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Race Report Content */}
        {!loading && !error && report.raceInfo && (
          <div className="space-y-6">
            {/* Race Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Flag className="w-6 h-6 text-blue-500" />
                {report.raceInfo.raceName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(report.raceInfo.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{report.raceInfo.circuitName}, {report.raceInfo.country}</span>
                </div>
                <div>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-sm">
                    {report.raceInfo.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-blue-400">{report.raceInfo.totalFinishers}</div>
                  <div className="text-xs text-gray-400">Finishers</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-yellow-400">{report.raceInfo.totalIncidents}</div>
                  <div className="text-xs text-gray-400">Incidents</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-red-400">{report.raceInfo.totalPenalties}</div>
                  <div className="text-xs text-gray-400">Penalties</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-green-400">{report.raceInfo.laps}</div>
                  <div className="text-xs text-gray-400">Laps</div>
                </div>
              </div>
            </div>

            {/* Race Results */}
            {report.results.length > 0 && (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-xl font-bold text-white">Race Results</h3>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Pos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Driver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Time</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Points</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Penalty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {report.results.map((result) => (
                      <tr key={`${result.position}-${result.driverName}`} className="hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3 text-white font-bold">{result.position}</td>
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">{result.driverName}</div>
                          <div className="text-xs text-gray-400">#{result.number}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{result.teamName}</td>
                        <td className="px-4 py-3 text-center text-white font-mono">{result.time}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full font-bold">
                            {result.points}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-red-400">{result.penalty || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Incidents */}
            {report.incidents.length > 0 && (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-xl font-bold text-white">Race Incidents</h3>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Lap</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Driver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Penalty</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {report.incidents.map((incident, index) => (
                      <tr key={index} className="hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3 text-white font-bold">{incident.lap}</td>
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">{incident.driverName}</div>
                          <div className="text-xs text-gray-400">{incident.teamName}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{incident.description}</td>
                        <td className="px-4 py-3 text-center">
                          {incident.penaltyType ? (
                            <span className="text-red-400">{incident.penaltyType}: {incident.penaltyValue}</span>
                          ) : (
                            <span className="text-gray-500">No Penalty</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            incident.penaltyStatus === 'APPROVED' ? 'bg-green-900/30 text-green-400' :
                            incident.penaltyStatus === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-gray-700 text-gray-400'
                          }`}>
                            {incident.penaltyStatus || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !report.raceInfo && selectedRace && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No report data available for this race.</p>
          </div>
        )}
      </div>
    </div>
  );
}
