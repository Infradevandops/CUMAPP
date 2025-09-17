import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Simulate checking for existing auth token
    const checkAuth = async () => {
      try {
        // In a real app, this would check localStorage/sessionStorage for tokens
        // and validate them with the backend
        const token = localStorage.getItem('authToken');
        if (token) {
          // Simulate API call to validate token and get user info
          setTimeout(() => {
            setUser({
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              role: 'user'
            });
            setLoading(false);
          }, 500);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API login call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'fake-jwt-token',
            user: {
              id: 1,
              name: 'John Doe',
              email: email,
              role: 'user'
            }
          });
        }, 1000);
      });
      
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };
  
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API register call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'fake-jwt-token',
            user: {
              id: 1,
              name: name,
              email: email,
              role: 'user'
            }
          });
        }, 1000);
      });
      
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };
  
  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
};