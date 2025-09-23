import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/atoms/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import {
  AboutPage,
  AdminPage,
  BillingPage,
  ChatPage,
  DashboardPage,
  LandingPage,
  LoginPage,
  NumbersPage,
  RegisterPage,
  ReviewsPage,
  SearchPage,
  VerificationsPage 
} from './components/LazyComponents';
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
    <ErrorBoundary>
      <NotificationProvider>
        <Router>
          <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard"
                element={isAuthenticated ? <DashboardPage user={user} /> : <Navigate to="/login" />}
              />
              <Route 
                path="/admin"
                element={isAuthenticated ? <AdminPage user={user} /> : <Navigate to="/login" />}
              />
              <Route 
                path="/billing"
                element={isAuthenticated ? <BillingPage user={user} /> : <Navigate to="/login" />}
              />
              <Route 
                path="/chat"
              element={isAuthenticated ? <ChatPage user={user} /> : <Navigate to="/login" />}
            />
            <Route 
              path="/numbers"
              element={isAuthenticated ? <NumbersPage user={user} /> : <Navigate to="/login" />}
            />
            <Route 
              path="/search"
              element={isAuthenticated ? <SearchPage user={user} /> : <Navigate to="/login" />}
            />
            <Route 
              path="/verifications"
              element={isAuthenticated ? <VerificationsPage user={user} /> : <Navigate to="/login" />}
            />
            </Routes>
          </Suspense>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;