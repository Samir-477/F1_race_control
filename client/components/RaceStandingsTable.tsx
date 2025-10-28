import React from 'react';

interface Standing {
  position: number;
  driverName: string;
  driverNumber: number;
  teamName: string;
  totalTime: string;
  penalty: string;
  fastestLap: string;
  penaltySeconds?: number;
}

interface RaceStandingsTableProps {
  standings: Standing[];
  onDriverClick?: (driverId: number) => void;
}

const RaceStandingsTable: React.FC<RaceStandingsTableProps> = ({ standings, onDriverClick }) => {
  return (
    <div className="bg-[#1a1f2e] rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Race Standings</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                POS
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                DRIVER
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                TEAM
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                TOTAL TIME
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                PENALTY
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                FASTEST LAP
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr
                key={index}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => onDriverClick && onDriverClick(standing.driverNumber)}
              >
                <td className="py-4 px-4">
                  <span className="text-white font-bold text-lg">{standing.position}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white font-medium">{standing.driverName}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-300">{standing.teamName}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white font-mono">{standing.totalTime}</span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`font-mono font-bold ${
                      standing.penalty !== '0s' ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {standing.penalty}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-300 font-mono text-sm">{standing.fastestLap}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {standings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No standings available. Generate race logs first.</p>
        </div>
      )}
    </div>
  );
};

export default RaceStandingsTable;
