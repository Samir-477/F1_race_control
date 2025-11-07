import React, { useState, useEffect } from 'react';
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


// Team Editor Component
const TeamEditor: React.FC<{ team: Team; onBack: () => void; onUpdate?: () => void }> = ({ team, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any, section?: string) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let response;

      // Handle driver creation separately
      if (section === 'drivers') {
        response = await fetch(`http://localhost:3002/api/teams/${team.id}/drivers`, {
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
        response = await fetch(`http://localhost:3002/api/teams/${team.id}/sponsors`, {
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
        response = await fetch(`http://localhost:3002/api/teams/${team.id}`, {
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
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await fetch(`http://localhost:3002/api/teams/${team.id}/drivers/${driver.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        toast.success('Driver removed successfully');
                        if (onUpdate) onUpdate();
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to remove driver');
                      }
                    }}
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
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`http://localhost:3002/api/teams/${team.id}/sponsors/${sponsor.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          toast.success('Sponsor removed successfully');
                          if (onUpdate) onUpdate();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to remove sponsor');
                        }
                      }}
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
     <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold">{team.fullName}</h2>
            <p className="text-lg text-gray-400">Editing Team Profile</p>
          </div>
          <button onClick={onBack} className="text-base text-gray-300 hover:text-white">&larr; Back to Teams</button>
        </div>
        <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-3">
            <EditorTabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</EditorTabButton>
            <EditorTabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')}>Drivers</EditorTabButton>
            <EditorTabButton active={activeTab === 'sponsors'} onClick={() => setActiveTab('sponsors')}>Sponsors</EditorTabButton>
            <EditorTabButton active={activeTab === 'car'} onClick={() => setActiveTab('car')}>Car</EditorTabButton>
        </div>
        <div>
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
      const response = await fetch('http://localhost:3002/api/teams');
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
        />
      );
    }

    return (
      <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Team Management</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors text-base"
          >
            Create New Team
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-[#2d3748] p-4 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl">{team.name}</h3>
                <p className="text-base text-gray-400">{team.fullName}</p>
              </div>
              <button 
                onClick={() => setEditingTeam(team)}
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white text-base font-bold py-2 px-4 rounded transition-colors"
              >
                Manage Team
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
      <div className="h-28"></div> {/* Spacer for fixed navbar */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-12 uppercase tracking-wide">Admin Dashboard</h1>
        
        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          <aside className="md:w-1/3 lg:w-1/4 bg-[#161b22] p-4 rounded-lg border border-gray-700 self-stretch">
            <nav className="flex flex-col gap-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Management</div>
              <SidebarButton viewName="teams" label="Team Management" />
              <SidebarButton viewName="stewards" label="Steward Management" />
              <SidebarButton viewName="races" label="Race Management" />
              
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-4">Analytics & Reports</div>
              <SidebarButton viewName="championship" label="Championship Standings" />
              <SidebarButton viewName="race-report" label="Team Performance" />
              <SidebarButton viewName="penalties" label="Penalty Statistics" />
              <SidebarButton viewName="incidents" label="Drivers with Incidents" />
              
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-4">Database Features</div>
              <SidebarButton viewName="triggers" label="Trigger Management" />
              <SidebarButton viewName="driver-ratings" label="Driver Ratings" />
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