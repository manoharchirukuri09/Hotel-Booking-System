import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate from localStorage on app start
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = localStorage.getItem('token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('token',        data.token);
    localStorage.setItem('refreshToken', data.refreshToken || '');
    const u = { userId: data.userId, email: data.email, fullName: data.fullName, role: data.role };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const register = useCallback(async (payload) => {
    const res = await authAPI.register(payload);
    saveSession(res.data.data);
    toast.success(`Welcome, ${res.data.data.fullName}!`);
    return res.data.data;
  }, []);

  const login = useCallback(async (payload) => {
    const res = await authAPI.login(payload);
    saveSession(res.data.data);
    toast.success(`Welcome back, ${res.data.data.fullName}!`);
    return res.data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const isAdmin    = user?.role === 'ADMIN';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLoggedIn, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
