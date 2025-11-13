'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/auth-context';
import { SgciProvider } from '@/contexts/sgci-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SgciProvider>{children}</SgciProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
