import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Map backend roles to frontend-compatible format
const mapRole = (role) => {
  const roleMap = {
    ADMIN: 'admin',
    STAFF: 'staff',
    WORKER: 'worker',
    CUSTOMER: 'user', // Keep 'user' for backward compat with existing UI components
  };
  return roleMap[role] || role?.toLowerCase() || 'user';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const token = apiClient.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getMe();
        if (data.success && data.user) {
          setUser({
            ...data.user,
            systemRole: mapRole(data.user.role),
            displayName: data.user.name.split(' ')[0],
          });
        }
      } catch (err) {
        console.warn('Session restore failed:', err.message);
        apiClient.setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await apiClient.login(email, password);
      if (data.success && data.user) {
        const userData = {
          ...data.user,
          systemRole: mapRole(data.user.role),
          displayName: data.user.name.split(' ')[0],
        };
        setUser(userData);
        return { success: true, user: userData };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const data = await apiClient.register(userData);
      if (data.success && data.user) {
        const newUser = {
          ...data.user,
          systemRole: mapRole(data.user.role),
          displayName: data.user.name.split(' ')[0],
        };
        setUser(newUser);
        return { success: true, user: newUser };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  const googleLogin = useCallback(async (credential) => {
    setError(null);
    try {
      const data = await apiClient.googleAuth(credential);
      if (data.success && data.user) {
        const userData = {
          ...data.user,
          systemRole: mapRole(data.user.role),
          displayName: data.user.name.split(' ')[0],
        };
        setUser(userData);
        return { success: true, user: userData };
      }
      throw new Error(data.message || 'Google login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // Continue logout even if API call fails
    }
    setUser(null);
    setError(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
