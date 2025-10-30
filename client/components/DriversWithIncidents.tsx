import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';

interface DriverIncident {
  id: number;
  driverName: string;
  number: number;
  teamName: string;
  teamColor: string;
  totalIncidents: number;
  racesWithIncidents: number;
  timePenalties: number;
  gridPenalties: number;
  warnings: number;
}

interface Season {
  id: number;
  year: number;
  name: string;
}

export default function DriversWithIncidents() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<DriverIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    fetchDriversWithIncidents();
  }, [selectedSeason]);

  const fetchSeasons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3002/api/seasons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSeasons(data);
    } catch (err) {
      console.error('Failed to fetch seasons:', err);
    }
  };

  const fetchDriversWithIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const seasonParam = selectedSeason ? `?seasonId=${selectedSeason}` : '';
      const res = await fetch(
        `http://localhost:3002/api/analytics/drivers-with-incidents${seasonParam}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error('Failed to fetch data');

      const data = await res.json();
      setDrivers(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch drivers with incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          Drivers with Incidents in Completed Races
          <span className="text-sm text-gray-400 font-normal ml-2">
            (Nested Query)
          </span>
        </h1>

        {/* Filter */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Season
            </label>
            <select
              value={selectedSeason || ''}
              onChange={(e) => setSelectedSeason(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full max-w-md px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Seasons</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.year} - {season.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchDriversWithIncidents}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-orange-600"></div>
            <p className="text-gray-400 mt-4">Analyzing incident data...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No drivers with incidents found.</p>
            <p className="text-gray-500 text-sm mt-2">
              This query finds drivers who have incidents in completed races.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Total Incidents
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Races Affected
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Time Penalties
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Grid Penalties
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Warnings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {drivers.map((driver, index) => (
                    <tr
                      key={driver.id}
                      className={`hover:bg-gray-700/50 transition ${
                        driver.totalIncidents >= 5 ? 'bg-red-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-white">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-12 rounded"
                            style={{ backgroundColor: driver.teamColor }}
                          />
                          <div>
                            <div className="text-white font-medium">{driver.driverName}</div>
                            <div className="text-xs text-gray-400">#{driver.number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-300">{driver.teamName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-xl font-bold ${
                          driver.totalIncidents >= 5 ? 'text-red-400' :
                          driver.totalIncidents >= 3 ? 'text-orange-400' :
                          'text-yellow-400'
                        }`}>
                          {driver.totalIncidents}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-300">{driver.racesWithIncidents}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-red-400 font-semibold">{driver.timePenalties}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-orange-400 font-semibold">{driver.gridPenalties}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-yellow-400 font-semibold">{driver.warnings}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Query Explanation */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            Nested Query Explanation
          </h3>
          <p className="text-gray-300 text-sm mb-2">
            This page demonstrates a <span className="text-blue-400 font-semibold">nested SQL query</span> that finds:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
            <li>Drivers who have incidents in races</li>
            <li>WHERE those races are in the subquery: <code className="text-green-400 bg-gray-900 px-2 py-1 rounded">SELECT id FROM Race WHERE status = 'COMPLETED'</code></li>
            <li>Grouped by driver with aggregate counts of penalty types</li>
            <li>Ordered by total incidents (descending)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
