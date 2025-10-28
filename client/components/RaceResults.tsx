import React from 'react';
import type { Race } from '../types';
import { TEAMS } from '../data/mockData';

interface RaceResultsProps {
  races: Race[];
}

const RaceResults: React.FC<RaceResultsProps> = ({ races }) => {
  return (
    <section id="race-results" className="py-20 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-12 uppercase tracking-widest">Race Results</h2>
        {races.filter(r => r.results.length > 0).map(race => (
          <div key={race.id} className="mb-16 bg-gray-800 rounded-lg p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <h3 className="text-3xl font-bold uppercase text-red-500">{race.name}</h3>
              <p className="text-gray-400">{race.location} - {race.date}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b-2 border-red-500">
                    <th className="p-3 text-sm font-semibold uppercase tracking-wider">Pos</th>
                    <th className="p-3 text-sm font-semibold uppercase tracking-wider">Driver</th>
                    <th className="p-3 text-sm font-semibold uppercase tracking-wider">Team</th>
                    <th className="p-3 text-sm font-semibold uppercase tracking-wider">Time</th>
                    <th className="p-3 text-sm font-semibold uppercase tracking-wider text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {race.results.map(result => {
                    const team = TEAMS.find(t => t.id === result.team.id);
                    return (
                      <tr key={result.position} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 font-bold text-lg">{result.position}</td>
                        <td className="p-3 flex items-center gap-3">
                          <div className={`w-1 h-8 ${team?.color || 'bg-gray-500'}`}></div>
                          <span className="font-semibold">{result.driver.name}</span>
                        </td>
                        <td className="p-3 text-gray-300">{result.team.name}</td>
                        <td className="p-3 text-gray-300">{result.time}</td>
                        <td className="p-3 font-bold text-lg text-right text-red-500">{result.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RaceResults;