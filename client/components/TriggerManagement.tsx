import React, { useState, useEffect } from 'react';
import { Zap, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Trigger {
  name: string;
  event: string;
  tableName: string;
  timing: string;
  statement: string;
}

interface TriggerLog {
  id: number;
  lap: number;
  timestamp: string;
  description: string;
  severity: string;
  race: {
    name: string;
    circuit: { name: string };
    season: { year: number };
  };
  driver?: {
    name: string;
    team: { name: string };
  };
}

export default function TriggerManagement() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTriggers();
    fetchTriggerLogs();
  }, []);

  const fetchTriggers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3002/api/analytics/triggers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch triggers');
      
      const data = await res.json();
      setTriggers(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch triggers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTriggerLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3002/api/analytics/trigger-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch trigger logs');
      
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to fetch trigger logs:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-500" />
          Database Triggers
          <span className="text-sm text-gray-400 font-normal ml-2">
            (Automated Database Actions)
          </span>
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Active Triggers */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            Active Triggers
          </h2>
          
          {loading ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-600"></div>
            </div>
          ) : triggers.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">No triggers found in database.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {triggers.map((trigger, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {trigger.name}
                      </h3>
                      <div className="flex gap-3 text-sm">
                        <span className="text-gray-400">
                          <span className="font-medium text-blue-400">{trigger.timing}</span>{' '}
                          {trigger.event}
                        </span>
                        <span className="text-gray-400">
                          on <span className="font-medium text-green-400">{trigger.tableName}</span>
                        </span>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  
                  <div className="bg-gray-900 rounded p-3 mt-3">
                    <p className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                      {trigger.statement.substring(0, 200)}
                      {trigger.statement.length > 200 && '...'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trigger Execution Logs */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Trigger Execution History
            <span className="text-sm text-gray-400 font-normal ml-2">
              (Last 50 executions)
            </span>
          </h2>

          {logs.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No trigger execution logs yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Logs will appear when penalties are assigned to incidents.
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Race
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Lap
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Driver
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <div>
                            <div className="font-medium text-white">{log.race.name}</div>
                            <div className="text-xs text-gray-500">
                              {log.race.circuit.name} • {log.race.season.year}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          Lap {log.lap}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {log.driver ? (
                            <div>
                              <div className="font-medium text-white">{log.driver.name}</div>
                              <div className="text-xs text-gray-500">{log.driver.team.name}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {log.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              log.severity === 'CRITICAL'
                                ? 'bg-red-900/50 text-red-300'
                                : log.severity === 'WARNING'
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'bg-blue-900/50 text-blue-300'
                            }`}
                          >
                            {log.severity}
                          </span>
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
    </div>
  );
}
