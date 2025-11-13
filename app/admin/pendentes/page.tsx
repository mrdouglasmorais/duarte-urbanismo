'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface PendingUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminPendentesPage() {
  const { user, profile, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && profile && profile.role !== 'SUPER_ADMIN') {
      router.push('/painel');
      return;
    }

    if (!authLoading && user) {
      loadPendingUsers();
    }
  }, [authLoading, user, profile, router]);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/approve-user');

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários pendentes');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessingId(userId);
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao processar solicitação');
      }

      // Recarregar lista
      await loadPendingUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao processar');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/painel" className="inline-block">
              <Image
                src="/logo_duarte_sem_fundo.png"
                alt="Duarte Urbanismo"
                width={180}
                height={56}
                className="h-12 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{profile?.name || user?.displayName}</span>
              <Link
                href="/painel"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50"
              >
                Voltar ao Painel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[40px] border border-slate-200/70 bg-white/95 backdrop-blur-sm p-8 shadow-[0_35px_80px_rgba(15,23,42,0.15)] md:p-12"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Usuários Pendentes
            </h1>
            <p className="text-slate-600">
              Aprove ou rejeite solicitações de cadastro de corretores
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-red-700">
              {error}
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">Nenhum usuário pendente no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-slate-500 mt-1">Telefone: {user.phone}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        Cadastrado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(user.id, 'APPROVED')}
                        disabled={processingId === user.id}
                        className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {processingId === user.id ? 'Processando...' : 'Aprovar'}
                      </button>
                      <button
                        onClick={() => handleApprove(user.id, 'REJECTED')}
                        disabled={processingId === user.id}
                        className="rounded-full border-2 border-red-300 bg-red-50 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === user.id ? 'Processando...' : 'Rejeitar'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

