'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import AvatarUpload from '@/components/AvatarUpload';

export default function CorretorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'CORRETOR') {
      router.push('/painel');
      return;
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'CORRETOR') {
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
              <span className="text-sm text-slate-600">{session?.user?.name}</span>
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
      <main className="mx-auto max-w-4xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[40px] border border-slate-200/70 bg-white/95 backdrop-blur-sm p-8 shadow-[0_35px_80px_rgba(15,23,42,0.15)] md:p-12"
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Meu Perfil
            </h1>
            <p className="text-slate-600">
              Gerencie suas informações pessoais e foto de perfil
            </p>
          </div>

          <div className="space-y-8">
            {/* Avatar Upload */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                Foto de Perfil
              </h2>
              <AvatarUpload currentAvatarUrl={session?.user?.avatarUrl} />
            </div>

            {/* Informações do Usuário */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Nome
                  </label>
                  <p className="text-lg text-slate-900">{session?.user?.name}</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    E-mail
                  </label>
                  <p className="text-lg text-slate-900">{session?.user?.email}</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Função
                  </label>
                  <p className="text-lg text-slate-900">Corretor</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Status
                  </label>
                  <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${
                    session?.user?.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : session?.user?.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {session?.user?.status === 'APPROVED' ? 'Aprovado' :
                     session?.user?.status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

