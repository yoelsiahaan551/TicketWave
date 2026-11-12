"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    const token = api.getAccessToken();
    const refreshToken = api.getRefreshToken();
    if (!token && !refreshToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get('/auth/me', {}, { silent: true });
      if (response && response.success && response.data) {
        const userData = response.data.user || response.data;
        api.setStoredUser(userData, api.isPersistentSession());
        setUser(userData);
        setLoading(false);
        return userData;
      }
      setUser(null);
      setLoading(false);
      return null;
    } catch (error) {
      const status = error?.status;

      if (status === 401) {
        api.clearTokens();
        setUser(null);
      } else if (status === 422) {
        if (api.isInvalidTokenError(error)) {
          api.clearTokens();
        }
        setUser(null);
      } else {
        setUser(null);
      }

      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchCurrentUser();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchCurrentUser]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success && response.data) {
        const { access_token, refresh_token, user: userData } = response.data;
        
        // Store tokens (default sessionStorage per-tab; localStorage only if rememberMe=true)
        api.setAccessToken(access_token, rememberMe);
        api.setRefreshToken(refresh_token, rememberMe);
        api.setStoredUser(userData, rememberMe);
        setUser(userData);
        setLoading(false);

        return { success: true, user: userData };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, phone, password });
      
      if (response.success && response.data) {
        if (typeof window !== 'undefined' && response.data.verification_token) {
          sessionStorage.setItem('ticketwave_verification_token', response.data.verification_token);
        }
        // Register does not return tokens, only user data + verification_token
        // After successful register, auto login (per-tab session)
        const loginResult = await login(email, password, false);
        return loginResult;
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = useCallback(() => {
    api.clearTokens();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchCurrentUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOfficer: user?.role === 'officer',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
