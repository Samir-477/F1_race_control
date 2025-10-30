import React, { useState } from 'react';
import { FileText, X, Download, Flag, AlertCircle, Award } from 'lucide-react';

interface RaceReportProps {
  raceId: number;
  raceName: string;
  onClose: () => void;
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

export default function RaceReport({ raceId, raceName, onClose }: RaceReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{
    raceInfo: RaceInfo | null;
    results: RaceResult[];
    incidents: Incident[];
  } | null>(null);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:3002/api/analytics/race-report/${raceId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error('Failed to generate report');

      const data = await res.json();
      setReport({
        raceInfo: data.raceInfo,
        results: data.results,
        incidents: data.incidents
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch race report:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport();
  }, [raceId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Race Report</h2>
              <p className="text-gray-400 text-sm">
                {raceName} • Generated using Stored Procedure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-blue-600"></div>
              <p className="text-gray-400 mt-4">Generating comprehensive report...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Race Information */}
              {report.raceInfo && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-green-500" />
                    Race Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Circuit</p>
                      <p className="text-white font-medium">{report.raceInfo.circuitName}</p>
                      <p className="text-gray-500 text-xs">{report.raceInfo.location}, {report.raceInfo.country}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">{formatDate(report.raceInfo.date)}</p>
                      <p className="text-gray-500 text-xs">Season {report.raceInfo.season}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Circuit Details</p>
                      <p className="text-white font-medium">{report.raceInfo.circuitLength} km</p>
                      <p className="text-gray-500 text-xs">{report.raceInfo.laps} laps</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p className={`font-medium ${
                        report.raceInfo.status === 'COMPLETED' ? 'text-green-400' :
                        report.raceInfo.status === 'IN_PROGRESS' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {report.raceInfo.status}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{report.raceInfo.totalFinishers}</p>
                      <p className="text-gray-400 text-sm">Finishers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-500">{report.raceInfo.totalIncidents}</p>
                      <p className="text-gray-400 text-sm">Incidents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{report.raceInfo.totalPenalties}</p>
                      <p className="text-gray-400 text-sm">Penalties</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Race Results */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Final Classification
                </h3>
                {report.results.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No results available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Pos</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Driver</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Time</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase">Points</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Penalty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Fastest Lap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {report.results.map((result) => (
                          <tr key={result.position} className="hover:bg-gray-800/50">
                            <td className="px-4 py-2 text-white font-bold">{result.position}</td>
                            <td className="px-4 py-2">
                              <div className="text-white font-medium">{result.driverName}</div>
                              <div className="text-xs text-gray-400">#{result.number}</div>
                            </td>
                            <td className="px-4 py-2 text-gray-300">{result.teamName}</td>
                            <td className="px-4 py-2 text-gray-300 font-mono">{result.time}</td>
                            <td className="px-4 py-2 text-center text-white font-semibold">{result.points}</td>
                            <td className="px-4 py-2 text-red-400">{result.penalty}</td>
                            <td className="px-4 py-2 text-purple-400 font-mono">{result.fastestLap}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Incidents and Penalties */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Incidents & Penalties
                </h3>
                {report.incidents.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No incidents reported</p>
                ) : (
                  <div className="space-y-3">
                    {report.incidents.map((incident, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4 border-l-4 border-orange-500">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-gray-400 text-sm">Lap {incident.lap}</span>
                            <h4 className="text-white font-medium">{incident.driverName}</h4>
                            <p className="text-gray-400 text-sm">{incident.teamName}</p>
                          </div>
                          {incident.penaltyType && (
                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                              incident.penaltyType === 'TimePenalty' ? 'bg-red-900/50 text-red-300' :
                              incident.penaltyType === 'GridPenalty' ? 'bg-orange-900/50 text-orange-300' :
                              incident.penaltyType === 'Warning' ? 'bg-yellow-900/50 text-yellow-300' :
                              'bg-green-900/50 text-green-300'
                            }`}>
                              {incident.penaltyType}
                              {incident.penaltyValue && `: ${incident.penaltyValue}`}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{incident.description}</p>
                        {incident.stewardName && (
                          <p className="text-gray-500 text-xs">
                            Reviewed by: {incident.stewardName} • Status: {incident.penaltyStatus}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
