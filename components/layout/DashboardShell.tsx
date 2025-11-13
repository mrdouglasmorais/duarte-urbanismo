'use client';

import { PageTransition } from '@/components/PageTransition';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Footer } from '@/components/Footer';
import DashboardSidebar from './DashboardSidebar';

const TIMEZONE_SC = 'America/Sao_Paulo';

const getSaudacao = () => {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: TIMEZONE_SC,
      hour: 'numeric',
      hour12: false
    });
    const hourPart = formatter.formatToParts(new Date()).find(part => part.type === 'hour')?.value ?? '12';
    const hour = Number(hourPart);

    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  } catch {
    return 'Bem-vindo';
  }
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, logout } = useFirebaseAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const saudacao = getSaudacao();
  const primeiroNome = (profile?.name || user?.displayName)?.split(' ')[0] ?? 'Gestor';
  const mensagemSaudacao = `${saudacao}${user ? `, ${primeiroNome}!` : '!'}`;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Limpar cookie de token
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '' }),
      });
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Sistema de Gestão</h1>
                <p className="text-xs text-slate-500">Contratos Imobiliários</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{mensagemSaudacao}</p>
                <p className="text-xs text-slate-500">{profile?.email || user?.email || 'Acesso corporativo'}</p>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 lg:px-6 lg:py-8">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Footer */}
        <Footer variant="light" showFullFooter={false} />
      </div>
    </div>
  );
}
