import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import DashboardPage from './components/pages/DashboardPage';
import LoadingSpinner from './components/atoms/LoadingSpinner';
import Hero from './components/Hero';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;