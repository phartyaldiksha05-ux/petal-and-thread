import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('petal_thread_admin_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('petal_thread_admin_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    async function checkAuth() {
      const savedToken = localStorage.getItem('petal_thread_admin_token');
      if (!savedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.auth.me();
        setUser(data.user);
        localStorage.setItem('petal_thread_admin_user', JSON.stringify(data.user));
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err.message);
        localStorage.removeItem('petal_thread_admin_token');
        localStorage.removeItem('petal_thread_admin_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    const data = await api.auth.login(identifier, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('petal_thread_admin_token', data.token);
    localStorage.setItem('petal_thread_admin_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    try {
      api.auth.logout().catch(() => {});
    } catch {}
    localStorage.removeItem('petal_thread_admin_token');
    localStorage.removeItem('petal_thread_admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user && user.role === 'admin',
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
