'use client';

import { createContext, useContext, useEffect, useMemo, useState, startTransition } from 'react';

interface User {
  nome: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'sgci-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const demoUser: User = {
      nome: 'Carolina Duarte',
      email: 'carolina.duarte@duarteurbanismo.com'
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        startTransition(() => setUser(parsed));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
        startTransition(() => setUser(demoUser));
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      startTransition(() => setUser(demoUser));
    }

    startTransition(() => setIsReady(true));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? 'Falha ao autenticar.');
    }

    const data = await response.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, isReady, login, logout }), [user, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
}
