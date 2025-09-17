import React, { useState } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import DashboardPage from './components/pages/DashboardPage';
import LoadingSpinner from './components/atoms/LoadingSpinner';
import Hero from './components/Hero';
import './App.css';

function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'login', 'register'
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Show dashboard if authenticated
  if (isAuthenticated && currentView === 'dashboard') {
    return (
      <NotificationProvider>
        <div className="App">
          <DashboardPage user={user} />
        </div>
      </NotificationProvider>
    );
  }
  
  // Show landing page with Hero component
  return (
    <NotificationProvider>
      <div className="App">
        <Hero />
        
        {/* Demo Navigation */}
        <div className="bg-gray-50 py-8">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Explore Our Modern Interface
            </h2>
            <p className="text-gray-600 mb-6">
              Check out our new React-based dashboard with responsive design and modern UX
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              View Dashboard Demo
            </button>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;