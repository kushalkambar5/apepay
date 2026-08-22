'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Merchant } from '@/types';
import { authApi, RegisterParams, LoginParams } from '@/lib/api/auth';
import { merchantApi } from '@/lib/api/merchant';
import { getAuthToken } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  loading: boolean;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => void;
  refreshMerchant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const loadSession = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await merchantApi.getProfile();
      setMerchant(profile);
      setUser({ id: profile.userId || '', email: '', name: profile.businessName });
    } catch {
      authApi.logout();
      setMerchant(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (params: LoginParams) => {
    const res = await authApi.login(params);
    setUser(res.user);
    setMerchant(res.merchant);
  };

  const register = async (params: RegisterParams) => {
    const res = await authApi.register(params);
    setUser(res.user);
    setMerchant(res.merchant);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setMerchant(null);
    router.push('/login');
  };

  const refreshMerchant = async () => {
    try {
      const profile = await merchantApi.getProfile();
      setMerchant(profile);
    } catch (err) {
      console.error('Failed to refresh merchant profile', err);
    }
  };

  const value = { user, merchant, loading, login, register, logout, refreshMerchant };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
