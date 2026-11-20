import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, isInvalidTokenError } from '../api/client';
import { fetchMeApi, loginApi, registerApi } from '../api/endpoints';
import { User } from '../types';
import {
  clearAuthStorage,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setStoredAccessToken,
  setStoredRefreshToken,
  setStoredUser,
} from '../utils/storage';

interface AuthResult {
  success: boolean;
  user?: User;
  message?: string;
  registered?: boolean;
  status?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOfficer: boolean;
  isUser: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, phone: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    await api.init();
    const token = await getStoredAccessToken();
    const refresh = await getStoredRefreshToken();

    if (!token && !refresh) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await fetchMeApi();
      if (response && response.success && response.data) {
        const userData = (response.data as any).user || response.data;
        await setStoredUser(userData);
        setUser(userData);
        setLoading(false);
        return userData;
      }
      setUser(null);
      setLoading(false);
      return null;
    } catch (error: any) {
      const status = error?.status;
      if (status === 401 || (status === 422 && isInvalidTokenError(error))) {
        await clearAuthStorage();
        setUser(null);
      } else {
        const cached = await getStoredUser();
        if (!cached) {
          setUser(null);
        }
      }
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await api.init();
      const token = await getStoredAccessToken();
      const refresh = await getStoredRefreshToken();

      if (!token && !refresh) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetchMeApi();
        if (response && response.success && response.data) {
          const userData = (response.data as any).user || response.data;
          await setStoredUser(userData);
          if (isMounted) {
            setUser(userData);
            setLoading(false);
          }
          return;
        }
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error: any) {
        const status = error?.status;
        if (status === 401 || (status === 422 && isInvalidTokenError(error))) {
          await clearAuthStorage();
          if (isMounted) {
            setUser(null);
          }
        } else {
          const cached = await getStoredUser();
          if (!cached && isMounted) {
            setUser(null);
          }
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await loginApi(email.trim(), password);
      if (response.success && response.data) {
        const { access_token, refresh_token, user: userData } = response.data;
        if (access_token) await setStoredAccessToken(access_token);
        if (refresh_token) await setStoredRefreshToken(refresh_token);
        if (userData) await setStoredUser(userData);
        setUser(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
      return {
        success: false,
        message: response.message || 'Login gagal. Silakan periksa kredensial Anda.',
      };
    } catch (error: any) {
      return {
        success: false,
        status: error?.status,
        message:
          error?.status === 0
            ? 'Tidak dapat terhubung ke layanan TicketWave. Periksa koneksi Anda dan coba lagi.'
            : error?.status >= 500
            ? 'Layanan TicketWave sedang mengalami gangguan. Silakan coba lagi.'
            : error?.message || 'Tidak dapat terhubung ke layanan TicketWave. Periksa koneksi Anda dan coba lagi.',
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const response = await registerApi({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (response.success && response.data) {
        if (response.data.verification_token) {
          await AsyncStorage.setItem(
            'ticketwave_verification_token',
            response.data.verification_token
          );
        }

        // Attempt auto-login like Next.js frontend
        const loginRes = await login(email, password);
        if (loginRes.success) {
          return { ...loginRes, registered: true };
        }
        // Registration succeeded even if auto-login hits backend JWT 500
        return {
          success: false,
          registered: true,
          status: loginRes.status,
          message: `Pendaftaran akun berhasil! Namun auto-login gagal: ${loginRes.message}`,
        };
      }

      return {
        success: false,
        message: response.message || 'Pendaftaran gagal.',
      };
    } catch (error: any) {
      return {
        success: false,
        status: error?.status,
        message: error?.message || 'Pendaftaran gagal.',
      };
    }
  };

  const logout = useCallback(async () => {
    await clearAuthStorage();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isOfficer: user?.role === 'officer',
        isUser: user?.role === 'user',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
