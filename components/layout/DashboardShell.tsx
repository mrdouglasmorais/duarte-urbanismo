'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PageTransition } from '@/components/PageTransition';
import { EMPRESA_TELEFONE } from '@/lib/constants';

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

const navLinks = [
  { href: '/painel', label: 'Home' },
  { href: '/painel/empreendimentos', label: 'Empreendimentos' },
  { href: '/painel/clientes', label: 'Clientes' },
  { href: '/painel/corretores', label: 'Corretores' },
  { href: '/painel/negociacoes', label: 'Negociações' }
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const saudacao = getSaudacao();
  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Gestor';
  const mensagemSaudacao = `${saudacao}${user ? `, ${primeiroNome}!` : '!'}`;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">S.G.C.I</p>
            <p className="text-lg font-semibold">Sistema de Gestão de Contratos Imobiliários</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{mensagemSaudacao}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{user?.nome ?? 'Acesso corporativo'}</p>
              <p className="text-xs text-slate-500">{user?.email ?? 'Informe suas credenciais corporativas'}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
        <div className="border-t border-slate-200 bg-slate-900">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 text-sm text-white sm:px-6">
            {navLinks.map(link => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold uppercase tracking-[0.35em] ${
                    active ? 'text-amber-300' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PageTransition>{children}</PageTransition>
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-4 text-xs uppercase tracking-[0.25em] text-slate-500 sm:px-6">
          <span>Rua José Antonio da Silva, 152 · Sala 03, Escritório 81, Centro</span>
          <span>São João Batista - SC · CEP 88.240-000</span>
          <span>Contato: {EMPRESA_TELEFONE}</span>
        </div>
      </footer>
    </div>
  );
}
