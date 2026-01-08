import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

// Create context with default value
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.me();
          if (response.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username, password, remember = false) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.login(username, password, remember);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed';
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.is_admin || false;

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export context and provider
export { AuthContext, AuthProvider };

// Default export for better Fast Refresh compatibility
export default AuthProvider;
