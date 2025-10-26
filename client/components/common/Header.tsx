import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import F1Logo from '../../assets/F1Logo';
import type { UserRole } from '../../types';

interface HeaderProps {
  onNavigate: (page: 'landing' | 'dashboard') => void;
  onLoginClick: () => void;
  isDashboard?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLoginClick, isDashboard }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const headerBaseClasses = "fixed top-0 left-0 w-full z-20 transition-colors duration-300";
  const dashboardClasses = "bg-[#0d1117] shadow-lg";
  const landingClasses = "bg-transparent";

  return (
    <header className={`${headerBaseClasses} ${isDashboard ? dashboardClasses : landingClasses}`}>
      <div className="mx-auto w-[90%] max-w-7xl">
        <nav className="flex justify-between items-center h-24">
          <div className="flex items-center gap-12 pointer-events-auto">
            <button onClick={() => onNavigate('landing')} className="focus:outline-none">
              <F1Logo className="w-24 h-auto" />
            </button>
          </div>
          <div className="flex items-center gap-8 pointer-events-auto">
            {user ? (
              <>
                <button onClick={() => onNavigate('dashboard')} className="text-white uppercase font-semibold text-sm tracking-wider hover:text-yellow-500 transition-colors">Dashboard</button>
                <button onClick={handleLogout} className="text-white uppercase font-semibold text-sm tracking-wider hover:text-yellow-500 transition-colors">Logout</button>
              </>
            ) : (
              <button onClick={onLoginClick} className="text-white uppercase font-semibold text-sm tracking-wider hover:text-red-500 transition-colors">Login</button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;