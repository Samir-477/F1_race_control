import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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

  useEffect(() => {
    console.log('User state changed:', user);
    console.log('Current page:', currentPage);
  }, [user, currentPage]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };
  
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setCurrentPage('dashboard');
    console.log('Login successful, user:', user);
  };

  const renderPage = () => {
    if (currentPage === 'dashboard' && user) {
      if (user.role === UserRole.ADMIN || user.role === 'ADMIN') {
        return <AdminDashboard />;
      }
      if (user.role === UserRole.STEWARD || user.role === 'STEWARD') {
        return <StewardDashboard />;
      }
      // Fallback in case user is somehow on dashboard without a role
      // or if more roles are added later. Redirect to landing.
      console.warn('User has unexpected role:', user.role);
      setCurrentPage('landing');
      return null;
    }
    
    // Default to landing page
    return <LandingPage teams={TEAMS} />;
  };

  return (
    <div className="bg-gray-900">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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