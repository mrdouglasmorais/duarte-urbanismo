'use client';

import { FirebaseAuthProvider } from '@/contexts/firebase-auth-context';
import { SgciProvider } from '@/contexts/sgci-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      <SgciProvider>{children}</SgciProvider>
    </FirebaseAuthProvider>
  );
}
