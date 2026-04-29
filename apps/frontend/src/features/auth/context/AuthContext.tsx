'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, logoutUser } from '../lib/auth-api';
import { useRouter } from 'next/navigation';

export type AuthUser = {
  userId: string;
  email: string;
  role: string;
  full_name?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  gender?: string | null;
  last_seen?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (u: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMe().then((result) => {
      if (result.ok) {
        setUser(result.data.user);
      }
      setLoading(false);
    });
  }, []);

  async function logout() {
    await logoutUser();
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
