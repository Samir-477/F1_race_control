import React, { useState, useEffect } from 'react';
import API_URL from '../lib/config';
import toast from 'react-hot-toast';
import type { Team, Driver, Sponsor, Car } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CreateTeamModal from './CreateTeamModal';
import StewardManagement from './StewardManagement';
import RaceManagement from './RaceManagement';
import RaceResultsView from './RaceResultsView';
import TeamPerformance from './TeamPerformance';
import TriggerManagement from './TriggerManagement';
import PenaltyStatistics from './PenaltyStatistics';
import DriversWithIncidents from './DriversWithIncidents';
import DriverRatings from './DriverRatings';

// Sub-components for the Team Editor
const EditorTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-base font-semibold rounded-md transition-colors ${active ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700/50'}`}
  >
    {children}
  </button>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode; onSubmit?: (data: any) => void }> = ({ title, children, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData);
      onSubmit(data);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-yellow-500">{title}</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {children}
      </form>
    </div>
  );
};

const FormInput: React.FC<{ label: string; id: string; type?: string; placeholder?: string; value?: string | number; required?: boolean; name?: string; }> = ({ label, id, type = 'text', placeholder, value, required = false, name }) => (
  <div>
    <label htmlFor={id} className="block text-base font-medium text-gray-300 mb-1">{label}</label>
    <input 
      type={type} 
      id={id}
      name={name || id}
      placeholder={placeholder}
      defaultValue={value}
      required={required}
      className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base" 
    />
  </div>
);

const SaveButton: React.FC = () => (
  <div className="pt-2">
    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded transition-colors text-base">
      Save Changes
    </button>
  </div>
);


const demoToast = () => toast.custom((t) => (
  <div className="bg-[#1f2937] border border-yellow-500/40 rounded-lg p-4 shadow-xl flex items-start gap-3 max-w-xs" style={{ zIndex: 9999 }}>
    <span className="text-yellow-400 text-lg mt-0.5">🔒</span>
    <div className="flex-1">
      <p className="text-white font-bold text-sm">Demo Account</p>
      <p className="text-gray-400 text-xs mt-0.5">Log in as admin or steward to make changes.</p>
    </div>
    <button onClick={() => toast.dismiss(t.id)} className="text-gray-500 hover:text-white text-xs">✕</button>
  </div>
), { duration: 3000 });

// Team Editor Component
const TeamEditor: React.FC<{ team: Team; onBack: () => void; onUpdate?: () => void; isDemo?: boolean }> = ({ team, onBack, onUpdate, isDemo }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  const guard = (action: () => void) => { if (isDemo) { demoToast(); return; } action(); };

  const handleSubmit = async (formData: any, section?: string) => {
    if (isDemo) { demoToast(); return; }
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let response;

      // Handle driver creation separately
      if (section === 'drivers') {
        response = await fetch(`${API_URL}/api/teams/${team.id}/drivers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      // Handle sponsor creation separately
      else if (section === 'sponsors') {
        response = await fetch(`${API_URL}/api/teams/${team.id}/sponsors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      // Handle team details and car updates
      else {
        response = await fetch(`${API_URL}/api/teams/${team.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(section ? { [section]: formData } : formData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team');
      }

      const updatedTeam = await response.json();
      toast.success('Team updated successfully!');
      
      // Call onUpdate to refresh team data without leaving the page
      if (onUpdate) {
        onUpdate();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const renderEditorContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <>
            <FormSection title="Team Details" onSubmit={handleSubmit}>
              <FormInput id="name" name="name" label="Team Name" value={team.name} required />
              <FormInput id="fullName" name="fullName" label="Full Name" value={team.fullName} required />
              <FormInput id="description" name="description" label="Description" value={team.description} required />
              <FormInput id="base" name="base" label="Base" value={team.base} required />
              <FormInput id="teamChief" name="teamChief" label="Team Chief" value={team.teamChief} required />
              <div>
                <label htmlFor="color" className="block text-base font-medium text-gray-300 mb-1">Team Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    id="color"
                    name="color"
                    defaultValue={team.color}
                    required
                    className="h-12 w-16 bg-gray-800 border border-gray-600 rounded cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    name="color"
                    defaultValue={team.color}
                    required
                    placeholder="#FF0000"
                    className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-base font-mono" 
                  />
                </div>
              </div>
              <SaveButton />
            </FormSection>
          </>
        );
      case 'drivers':
        return (
          <>
            <FormSection title={`Manage Drivers for ${team.name}`} onSubmit={(data) => handleSubmit(data, 'drivers')}>
              {team.drivers.map(driver => (
                <div key={driver.id} className="bg-gray-900/50 p-3 rounded-md text-base flex justify-between items-center">
                  <div>
                    <p className="font-bold">{driver.name}</p>
                    <p className="text-gray-400">#{driver.number} | {driver.nationality}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => guard(async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await fetch(`${API_URL}/api/teams/${team.id}/drivers/${driver.id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        toast.success('Driver removed successfully');
                        if (onUpdate) onUpdate();
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to remove driver');
                      }
                    })}
                    className="text-red-500 hover:text-red-400 p-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {team.drivers.length < 2 ? (
                <div className="mt-4 space-y-4">
                  <FormInput id="driverName" name="name" label="Driver Name" required />
                  <FormInput id="driverNumber" name="number" label="Driver Number" type="number" required />
                  <FormInput id="driverNationality" name="nationality" label="Nationality" required />
                  <button 
                    type="submit" 
                    className="w-full text-base bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded font-bold"
                  >
                    Add New Driver
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-yellow-500">Maximum number of drivers (2) reached</p>
              )}
            </FormSection>
          </>
        );
      case 'sponsors':
        return (
          <>
            <FormSection title={`Manage Sponsors for ${team.name}`} onSubmit={(data) => handleSubmit(data, 'sponsors')}>
              <div className="space-y-3">
                {team.sponsors.map(sponsor => (
                  <div key={sponsor.id} className="bg-gray-900/50 p-3 rounded-md text-base flex justify-between items-center">
                    <div>
                      <p className="font-bold">{sponsor.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => guard(async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`${API_URL}/api/teams/${team.id}/sponsors/${sponsor.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          toast.success('Sponsor removed successfully');
                          if (onUpdate) onUpdate();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to remove sponsor');
                        }
                      })}
                      className="text-red-500 hover:text-red-400 p-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-4">
                <FormInput id="sponsorName" name="name" label="Sponsor Name" required />
                <button 
                  type="submit" 
                  className="w-full text-base bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded font-bold"
                >
                  Add New Sponsor
                </button>
              </div>
            </FormSection>
          </>
        );
      case 'car':
        return (
          <>
            <FormSection key={`car-${team.id}`} title={`Car Details for ${team.name}`} onSubmit={(data) => handleSubmit(data, 'car')}>
              <FormInput key={`model-${team.id}`} id="model" name="model" label="Model" value={team.car?.model} required />
              <FormInput key={`engine-${team.id}`} id="engine" name="engine" label="Engine" value={team.car?.engine} required />
              <FormInput key={`chassis-${team.id}`} id="chassis" name="chassis" label="Chassis" value={team.car?.chassis} required />
              <div className="mt-4">
                {loading ? (
                  <button 
                    disabled
                    className="w-full text-base bg-gray-500 text-black p-2 rounded font-bold cursor-not-allowed"
                  >
                    Updating...
                  </button>
                ) : (
                  <SaveButton />
                )}
              </div>
            </FormSection>
          </>
        );
      default: return null;
    }
  }

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700/60">
      <div className="px-6 py-5 border-b border-gray-700/60 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: team.color }}></div>
          <div>
            <h2 className="text-lg font-bold text-white">{team.fullName}</h2>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Editing Team Profile</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
        >
          ← Back
        </button>
      </div>
      <div className="px-6 pt-4 border-b border-gray-700/60 flex gap-1">
        <EditorTabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</EditorTabButton>
        <EditorTabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')}>Drivers</EditorTabButton>
        <EditorTabButton active={activeTab === 'sponsors'} onClick={() => setActiveTab('sponsors')}>Sponsors</EditorTabButton>
        <EditorTabButton active={activeTab === 'car'} onClick={() => setActiveTab('car')}>Car</EditorTabButton>
      </div>
      <div className="p-6">
        {renderEditorContent()}
      </div>
    </div>
  );
};


const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'teams' | 'stewards' | 'races' | 'championship' | 'race-report' | 'triggers' | 'penalties' | 'incidents' | 'driver-ratings'>('teams');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/teams`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        toast.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Fetch teams error:', error);
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchTeams();
    setShowCreateModal(false);
  };


  const renderMainContent = () => {
    if (activeView === 'stewards') {
      return <StewardManagement />;
    }

    if (activeView === 'races') {
      return <RaceManagement />;
    }

    if (activeView === 'championship') {
      return <RaceResultsView />;
    }

    if (activeView === 'race-report') {
      return <TeamPerformance />;
    }

    if (activeView === 'triggers') {
      return <TriggerManagement />;
    }

    if (activeView === 'penalties') {
      return <PenaltyStatistics />;
    }

    if (activeView === 'incidents') {
      return <DriversWithIncidents />;
    }

    if (activeView === 'driver-ratings') {
      return <DriverRatings />;
    }

    // Team Management View
    if (editingTeam) {
      const currentTeam = teams.find(t => t.id === editingTeam.id) || editingTeam;
      return (
        <TeamEditor
          team={currentTeam}
          onBack={() => { setEditingTeam(null); fetchTeams(); }}
          onUpdate={fetchTeams}
          isDemo={user?.isDemo}
        />
      );
    }

    return (
      <div className="bg-[#161b22] rounded-lg border border-gray-700/60">
        <div className="px-6 py-5 border-b border-gray-700/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
            <h2 className="text-xl font-bold tracking-wide uppercase">Team Management</h2>
          </div>
          <button
            onClick={() => guard(() => setShowCreateModal(true))}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider transition-colors"
          >
            + New Team
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div
              key={team.id}
              className="bg-[#0d1117] rounded-lg border border-gray-700/60 overflow-hidden flex flex-col"
              style={{ borderLeftColor: team.color, borderLeftWidth: 3 }}
            >
              <div className="p-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }}></div>
                  <h3 className="font-bold text-white truncate">{team.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3 truncate">{team.fullName}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{team.drivers?.length ?? 0} driver{(team.drivers?.length ?? 0) !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{team.sponsors?.length ?? 0} sponsor{(team.sponsors?.length ?? 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                onClick={() => guard(() => setEditingTeam(team))}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider border-t border-gray-700/60 text-gray-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all duration-200"
              >
                Manage →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const guard = (action: () => void) => { if (user?.isDemo) { demoToast(); return; } action(); };

  const SidebarButton: React.FC<{ viewName: string; label: string }> = ({ viewName, label }) => (
    <button
      onClick={() => {
        setActiveView(viewName);
        setEditingTeam(null); // Reset team selection when switching main views
      }}
      className={`w-full text-left px-4 py-3 text-base font-semibold rounded-md transition-colors ${activeView === viewName ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700/50'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 sm:px-8 pb-8 text-gray-200 font-inter">
      <div className="h-20"></div> {/* Spacer for fixed navbar */}
      {user?.isDemo && (
        <div className="-mx-4 sm:-mx-8 bg-yellow-500 text-black text-center text-sm font-bold py-2 tracking-wide mb-6">
          DEMO MODE — Read Only. Actions are disabled.
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">FIA Race Control</p>
          <h1 className="text-4xl font-black uppercase tracking-wide">Admin Dashboard</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          <aside className="md:w-56 lg:w-52 flex-shrink-0">
            <nav className="bg-[#161b22] rounded-lg border border-gray-700/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700/60">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Management</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <SidebarButton viewName="teams" label="Teams" />
                <SidebarButton viewName="stewards" label="Stewards" />
                <SidebarButton viewName="races" label="Races" />
              </div>
              <div className="px-4 py-3 border-t border-b border-gray-700/60">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Analytics</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <SidebarButton viewName="championship" label="Championship" />
                <SidebarButton viewName="race-report" label="Team Performance" />
                <SidebarButton viewName="penalties" label="Penalties" />
                <SidebarButton viewName="incidents" label="Incidents" />
              </div>
              <div className="px-4 py-3 border-t border-b border-gray-700/60">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Database</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <SidebarButton viewName="triggers" label="Triggers" />
                <SidebarButton viewName="driver-ratings" label="Driver Ratings" />
              </div>
            </nav>
          </aside>
          <main className="flex-1">
            {renderMainContent()}
          </main>
        </div>
      </div>
      
      {showCreateModal && (
        <CreateTeamModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;