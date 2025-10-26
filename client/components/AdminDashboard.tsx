import React, { useState } from 'react';
import type { Team, Driver, Sponsor, Car } from '../types';
import { TEAMS } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

// Sub-components for the Team Editor
const EditorTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-base font-semibold rounded-md transition-colors ${active ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700/50'}`}
  >
    {children}
  </button>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-2xl font-bold mb-4 text-yellow-500">{title}</h3>
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {children}
    </form>
  </div>
);

const FormInput: React.FC<{ label: string; id: string; type?: string; placeholder?: string; value?: string | number; }> = ({ label, id, type = 'text', placeholder, value }) => (
  <div>
    <label htmlFor={id} className="block text-base font-medium text-gray-300 mb-1">{label}</label>
    <input 
      type={type} 
      id={id}
      placeholder={placeholder}
      defaultValue={value}
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
const TeamEditor: React.FC<{ team: Team; onBack: () => void }> = ({ team, onBack }) => {
  const [activeTab, setActiveTab] = useState('details');

  const renderEditorContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <FormSection title="Team Details">
            <FormInput id="teamName" label="Team Name" value={team.name} />
            <FormInput id="fullName" label="Full Name" value={team.fullName} />
            <FormInput id="base" label="Base" value={team.base} />
            <FormInput id="teamChief" label="Team Chief" value={team.teamChief} />
            <SaveButton />
          </FormSection>
        );
      case 'drivers':
        return (
          <FormSection title={`Manage Drivers for ${team.name}`}>
            {team.drivers.map(driver => (
               <div key={driver.id} className="bg-gray-900/50 p-3 rounded-md text-base">
                <p className="font-bold">{driver.name}</p>
                <p className="text-gray-400">#{driver.number} | {driver.nationality}</p>
               </div>
            ))}
            <button className="mt-4 text-base bg-gray-600 hover:bg-gray-500 p-2 rounded">Add New Driver</button>
          </FormSection>
        );
      case 'sponsors':
        return (
          <FormSection title={`Manage Sponsors for ${team.name}`}>
            {team.sponsors.map(sponsor => (
              <div key={sponsor.id} className="bg-gray-900/50 p-3 rounded-md text-base">
                 <p className="font-bold">{sponsor.name}</p>
              </div>
            ))}
            <button className="mt-4 text-base bg-gray-600 hover:bg-gray-500 p-2 rounded">Add New Sponsor</button>
          </FormSection>
        );
      case 'car':
        return (
          <FormSection title={`Car Details for ${team.name}`}>
            <FormInput id="carModel" label="Model" value={team.car.model} />
            <FormInput id="engine" label="Engine" value={team.car.engine} />
            <FormInput id="chassis" label="Chassis" value={team.car.chassis} />
            <SaveButton />
          </FormSection>
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
  const [activeView, setActiveView] = useState('teams'); // 'teams' or 'stewards'
  const [teams, setTeams] = useState<Team[]>(TEAMS);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { user } = useAuth();


  const renderMainContent = () => {
    if (activeView === 'stewards') {
      return (
         <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
           <FormSection title="Create New Steward">
              <FormInput id="stewardUser" label="Username" />
              <FormInput id="stewardPass" label="Password" type="password" />
              <SaveButton />
            </FormSection>
         </div>
      );
    }

    // Team Management View
    if (editingTeam) {
      return <TeamEditor team={editingTeam} onBack={() => setEditingTeam(null)} />;
    }

    return (
      <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Team Management</h2>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors text-base">
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
    <div className="min-h-screen bg-[#0d1117] p-4 sm:p-8 text-gray-200 pt-28 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-8 uppercase tracking-wide">Admin Dashboard</h1>
        
        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          <aside className="md:w-1/3 lg:w-1/4 bg-[#161b22] p-4 rounded-lg border border-gray-700 self-stretch">
            <nav className="flex flex-col gap-2">
              <SidebarButton viewName="teams" label="Team Management" />
              <SidebarButton viewName="stewards" label="Steward Management" />
            </nav>
          </aside>
          <main className="flex-1">
            {renderMainContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;