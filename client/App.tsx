import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import StewardDashboard from './components/StewardDashboard';
import Header from './components/common/Header';
import { TEAMS, RACES } from './data/mockData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

type Page = 'landing' | 'dashboard';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuth();

  const isDashboard = currentPage === 'dashboard' && !!user;

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };
  
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      if (user?.role === UserRole.ADMIN) {
        return <AdminDashboard />;
      }
      if (user?.role === UserRole.STEWARD) {
        return <StewardDashboard />;
      }
      // Fallback in case user is somehow on dashboard without a role
      // or if more roles are added later. Redirect to landing.
      setCurrentPage('landing');
    }
    
    // Default to landing page
    return <LandingPage teams={TEAMS} races={RACES} />;
  };

  return (
    <div className="bg-gray-900">
      <Header 
        onNavigate={handleNavigate} 
        onLoginClick={() => setIsLoginModalOpen(true)}
        isDashboard={isDashboard}
      />
      {isLoginModalOpen && (
        <LoginModal 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      )}
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;