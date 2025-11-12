'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { SgciProvider } from '@/contexts/sgci-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SgciProvider>{children}</SgciProvider>
    </AuthProvider>
  );
}
