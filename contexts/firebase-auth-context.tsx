'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInAnonymouslyAuth,
  signOut,
  onAuthStateChange,
  getUserProfile,
  UserProfile,
} from '@/lib/firebase/auth';
import { UserCredential } from 'firebase/auth';

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpEmail: (email: string, password: string, name: string, phone?: string) => Promise<UserCredential>;
  signInGoogle: () => Promise<UserCredential>;
  signInAnonymous: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  isApproved: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInEmail = async (email: string, password: string) => {
    return signInWithEmail(email, password);
    // O estado será atualizado pelo onAuthStateChange
  };

  const signUpEmail = async (email: string, password: string, name: string, phone?: string) => {
    return signUpWithEmail(email, password, name, phone);
    // O estado será atualizado pelo onAuthStateChange
  };

  const signInGoogle = async () => {
    return signInWithGoogle();
    // O estado será atualizado pelo onAuthStateChange
  };

  const signInAnonymous = async () => {
    return signInAnonymouslyAuth();
    // O estado será atualizado pelo onAuthStateChange
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  };

  const isApproved = useMemo(() => {
    return profile?.status === 'APPROVED' || false;
  }, [profile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signInEmail,
      signUpEmail,
      signInGoogle,
      signInAnonymous,
      logout,
      isApproved,
    }),
    [user, profile, loading, isApproved]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth deve ser usado dentro de FirebaseAuthProvider');
  }
  return context;
}

