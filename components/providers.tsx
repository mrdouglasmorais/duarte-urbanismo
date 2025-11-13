'use client';

import { FirebaseAuthProvider } from '@/contexts/firebase-auth-context';
import { SgciProvider } from '@/contexts/sgci-context';
import { ToastProvider } from '@/components/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      <SgciProvider>
        <ToastProvider />
        {children}
      </SgciProvider>
    </FirebaseAuthProvider>
  );
}
