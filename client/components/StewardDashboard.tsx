import React, { useState, useMemo } from 'react';
import type { Race, RaceIncident, Penalty, RaceResult, Driver } from '../types';
import { LIVE_RACE_DATA, RACES, TEAMS } from '../data/mockData';
import ChevronDownIcon from '../assets/ChevronDownIcon';
import PlusIcon from '../assets/PlusIcon';
import { useAuth } from '../contexts/AuthContext';


const AddIncidentForm: React.FC<{ drivers: Driver[], onAddIncident: (incident: Omit<RaceIncident, 'id'>) => void, onCancel: () => void }> = ({ drivers, onAddIncident, onCancel }) => {
  const [driverId, setDriverId] = useState<string>('');
  const [lap, setLap] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = drivers.find(d => d.id === parseInt(driverId));
    if (driver && lap && description) {
      onAddIncident({
        driver,
        lap: parseInt(lap),
        description
      });
    }
  };

  return (
     <div className="p-4 bg-gray-900/50 rounded-lg mb-3">
      <form onSubmit={handleSubmit}>
        <h3 className="font-bold mb-3 text-xl">Log New Incident</h3>
         <div className="space-y-3">
            <div>
              <label className="block text-base font-medium mb-1 text-gray-400">Driver</label>
              <select value={driverId} onChange={e => setDriverId(e.target.value)} required className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-base">
                <option value="" disabled>Select a driver</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-base font-medium mb-1 text-gray-400">Lap Number</label>
              <input type="number" value={lap} onChange={e => setLap(e.target.value)} required placeholder="e.g., 25" className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-base" />
            </div>
            <div>
              <label className="block text-base font-medium mb-1 text-gray-400">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Describe the incident..." className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-base" rows={2}></textarea>
            </div>
         </div>
         <div className="flex items-center gap-2 mt-4">
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors flex-1 text-base">
              Add Incident
            </button>
            <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors text-base">
              Cancel
            </button>
         </div>
      </form>
    </div>
  );
};


const IncidentReviewCard: React.FC<{ incident: RaceIncident; onToggle: () => void; isOpen: boolean; onApplyPenalty: (incidentId: number, penaltyValue: string) => void; }> = ({ incident, onToggle, isOpen, onApplyPenalty }) => {
  const [penaltyValue, setPenaltyValue] = useState('');
  
  const handlePenaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(penaltyValue) {
      onApplyPenalty(incident.id, penaltyValue);
      setPenaltyValue(''); // Reset after applying
    }
  };

  return (
    <div className="bg-[#2d3748] rounded-lg overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg"
        aria-expanded={isOpen}
      >
        <span>Incident #{incident.id}: {incident.driver.name} (Lap {incident.lap})</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-600">
          <p className="text-gray-300 mb-4 text-base">{incident.description}</p>
          <form onSubmit={handlePenaltySubmit}>
            <div className="mb-3">
              <label className="block text-base font-medium mb-1 text-gray-400">Penalty Type</label>
              <select className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-base">
                <option>Time Penalty</option>
                <option>Warning</option>
                <option>No Further Action</option>
              </select>
            </div>
            <div className="mb-4">
               <label className="block text-base font-medium mb-1 text-gray-400">Penalty Value</label>
              <input type="text" value={penaltyValue} onChange={e => setPenaltyValue(e.target.value)} placeholder="e.g., 5s" className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-base" />
            </div>
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors w-full text-base">
              Approve Penalty
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const allRaces = [LIVE_RACE_DATA, ...RACES];

const StewardDashboard: React.FC = () => {
  const [selectedRace, setSelectedRace] = useState<Race>(allRaces[0]);
  const [openIncidentId, setOpenIncidentId] = useState<number | null>(null);
  const [isAddingIncident, setIsAddingIncident] = useState(false);
  const { user } = useAuth();

  const handleRaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raceId = parseInt(e.target.value);
    const newRace = allRaces.find(r => r.id === raceId);
    if (newRace) {
      setSelectedRace(newRace);
      setOpenIncidentId(null);
      setIsAddingIncident(false);
    }
  };

  const handleAddIncident = (newIncidentData: Omit<RaceIncident, 'id'>) => {
    const newIncident: RaceIncident = {
      ...newIncidentData,
      id: Math.max(...selectedRace.incidents.map(i => i.id)) + 1,
    };

    setSelectedRace(prevRace => ({
      ...prevRace,
      incidents: [newIncident, ...prevRace.incidents],
    }));

    setIsAddingIncident(false);
  };

  const handleApplyPenalty = (incidentId: number, penaltyValue: string) => {
     setSelectedRace(prevRace => {
      const raceCopy = { ...prevRace };
      const incident = raceCopy.incidents.find(i => i.id === incidentId);
      if (!incident) return prevRace;

      const driverIdToPenalize = incident.driver.id;
      
      const newResults = raceCopy.results.map(result => {
        if (result.driver.id === driverIdToPenalize) {
          // In a real app, you'd properly calculate time, for now we just append.
          const existingPenalty = result.penalty === '0s' ? 0 : parseInt(result.penalty);
          const newPenalty = existingPenalty + parseInt(penaltyValue);
          return { ...result, penalty: `+${newPenalty}s` };
        }
        return result;
      });

      return { ...raceCopy, results: newResults };
    });
  };

  const raceDrivers = useMemo(() => {
    return Array.from(new Set(TEAMS.flatMap(t => t.drivers)));
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 sm:p-8 text-gray-200 pt-28 font-inter">
      <div className="max-w-7xl mx-auto">

        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-wide">Steward Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
             <select onChange={handleRaceChange} value={selectedRace.id} className="bg-[#161b22] border border-gray-700 rounded-md px-3 py-2 font-semibold text-base">
                {allRaces.map(race => (
                  <option key={race.id} value={race.id}>{race.name}</option>
                ))}
             </select>
            <div className="bg-yellow-500 text-black text-base font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
              Race Status: {selectedRace.id === LIVE_RACE_DATA.id ? 'Pending' : 'Finished'}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Race Standings */}
          <div className="lg:col-span-2 bg-[#161b22] p-6 rounded-lg border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Race Standings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="p-3 text-base font-semibold uppercase text-gray-400">Pos</th>
                    <th className="p-3 text-base font-semibold uppercase text-gray-400">Driver</th>
                    <th className="p-3 text-base font-semibold uppercase text-gray-400">Team</th>
                    <th className="p-3 text-base font-semibold uppercase text-gray-400">Total Time</th>
                    <th className="p-3 text-base font-semibold uppercase text-gray-400">Penalty</th>
                    <th className="p-3 text-base font-semibold uppercase text-gray-400">Fastest Lap</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  {selectedRace.results.map((result: RaceResult) => (
                    <tr key={result.position} className="border-b border-gray-700/50">
                      <td className="p-3 font-bold text-lg">{result.position}</td>
                      <td className="p-3 font-semibold">{result.driver.name}</td>
                      <td className="p-3 text-gray-400">{result.team.name}</td>
                      <td className="p-3 font-mono">{result.time}</td>
                      <td className={`p-3 font-mono font-bold ${result.penalty !== '0s' ? 'text-red-500' : ''}`}>{result.penalty}</td>
                      <td className="p-3 font-mono">{result.fastestLap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incident Review */}
          <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Incident Review</h2>
              <button onClick={() => setIsAddingIncident(prev => !prev)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded transition-colors text-base">
                <PlusIcon className="w-4 h-4" />
                <span>{isAddingIncident ? 'Cancel' : 'Add Incident'}</span>
              </button>
            </div>
             {isAddingIncident && <AddIncidentForm drivers={raceDrivers} onAddIncident={handleAddIncident} onCancel={() => setIsAddingIncident(false)} />}
            <div className="space-y-3">
              {selectedRace.incidents.map((incident) => (
                 <IncidentReviewCard 
                  key={incident.id} 
                  incident={incident}
                  isOpen={openIncidentId === incident.id}
                  onToggle={() => setOpenIncidentId(openIncidentId === incident.id ? null : incident.id)}
                  onApplyPenalty={handleApplyPenalty}
                 />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-xl">
            Finalize & Publish Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default StewardDashboard;