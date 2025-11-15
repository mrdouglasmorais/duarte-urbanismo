'use client';

import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import AvatarUpload from '@/components/AvatarUpload';
import type { Corretor } from '@/types/sgci';
import { toastSuccess } from '@/lib/toast';

export default function CorretorProfilePage() {
  const { user, profile, loading } = useFirebaseAuth();
  const router = useRouter();
  const [corretorData, setCorretorData] = useState<Corretor | null>(null);
  const [loadingCorretor, setLoadingCorretor] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && profile && profile.role !== 'CORRETOR') {
      router.push('/painel');
      return;
    }

    // Carregar dados do corretor do MongoDB
    if (!loading && user && profile?.role === 'CORRETOR') {
      loadCorretorData();
    }
  }, [loading, user, profile, router]);

  const loadCorretorData = async () => {
    try {
      setLoadingCorretor(true);
      const response = await fetch('/api/corretores/me');
      if (response.ok) {
        const data = await response.json();
        setCorretorData(data.corretor || null);
      } else {
        console.error('Erro ao carregar dados do corretor');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do corretor:', error);
    } finally {
      setLoadingCorretor(false);
    }
  };

  const handleAvatarUpload = async (avatarUrl: string) => {
    // Atualizar foto no MongoDB também
    if (corretorData) {
      try {
        const response = await fetch('/api/corretores/update-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ corretorId: corretorData.id, foto: avatarUrl }),
        });

        if (response.ok) {
          await loadCorretorData(); // Recarregar dados
          toastSuccess('Foto atualizada com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao atualizar foto no MongoDB:', error);
      }
    }
  };

  if (loading || loadingCorretor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'CORRETOR') {
    return null;
  }

  // Usar foto do corretor se disponível, senão usar avatar do Firebase
  const fotoPerfil = corretorData?.foto || profile?.avatarUrl || user?.photoURL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/painel" className="inline-block">
              <Image
                src="/logo.png"
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
            {/* Foto de Perfil - Grande e Destacada */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                Foto de Perfil
              </h2>
              <div className="flex flex-col items-center gap-6">
                {/* Foto Grande */}
                {fotoPerfil ? (
                  <div className="relative h-40 w-40 overflow-hidden rounded-2xl border-4 border-emerald-200 shadow-lg">
                    <Image
                      src={fotoPerfil}
                      alt={corretorData?.nome || profile?.name || 'Perfil'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-4 border-slate-200 bg-slate-100">
                    <svg className="h-20 w-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <AvatarUpload
                  currentAvatarUrl={fotoPerfil || undefined}
                  onUploadComplete={handleAvatarUpload}
                />
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Informações Básicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Nome Completo
                  </label>
                  <p className="text-lg text-slate-900">{corretorData?.nome || profile?.name || user?.displayName}</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    CRECI
                  </label>
                  <p className="text-lg text-slate-900 font-semibold">{corretorData?.creci || 'Não informado'}</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    E-mail
                  </label>
                  <p className="text-lg text-slate-900">{corretorData?.email || profile?.email || user?.email}</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Telefone
                  </label>
                  <p className="text-lg text-slate-900">{corretorData?.telefone || profile?.phone || 'Não informado'}</p>
                </div>
                {corretorData?.whatsapp && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      WhatsApp
                    </label>
                    <p className="text-lg text-slate-900">{corretorData.whatsapp}</p>
                  </div>
                )}
                {corretorData?.instagram && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      Instagram
                    </label>
                    <p className="text-lg text-slate-900">@{corretorData.instagram.replace('@', '')}</p>
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Status da Conta
                  </label>
                  <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${
                    profile?.status === 'APPROVED' || corretorData?.status === 'Aprovado'
                      ? 'bg-emerald-100 text-emerald-700'
                      : profile?.status === 'PENDING' || corretorData?.status === 'Pendente'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {profile?.status === 'APPROVED' || corretorData?.status === 'Aprovado' ? 'Aprovado' :
                     profile?.status === 'PENDING' || corretorData?.status === 'Pendente' ? 'Pendente' : 'Rejeitado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Endereço */}
            {(corretorData?.endereco || corretorData?.cidade || corretorData?.cep) && (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  Endereço
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {corretorData.endereco && (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Endereço Completo
                      </label>
                      <p className="text-lg text-slate-900">{corretorData.endereco}</p>
                    </div>
                  )}
                  {corretorData.cep && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        CEP
                      </label>
                      <p className="text-lg text-slate-900">{corretorData.cep}</p>
                    </div>
                  )}
                  {corretorData.cidade && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Cidade / Estado
                      </label>
                      <p className="text-lg text-slate-900">
                        {corretorData.cidade}{corretorData.estado ? `, ${corretorData.estado}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dados Bancários */}
            {(corretorData?.bancoNome || corretorData?.bancoPix) && (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  Dados Bancários
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {corretorData.bancoNome && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Banco
                      </label>
                      <p className="text-lg text-slate-900">{corretorData.bancoNome}</p>
                    </div>
                  )}
                  {corretorData.bancoAgencia && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Agência
                      </label>
                      <p className="text-lg text-slate-900">{corretorData.bancoAgencia}</p>
                    </div>
                  )}
                  {corretorData.bancoConta && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Conta
                      </label>
                      <p className="text-lg text-slate-900">{corretorData.bancoConta}</p>
                    </div>
                  )}
                  {corretorData.bancoTipoConta && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Tipo de Conta
                      </label>
                      <p className="text-lg text-slate-900">{corretorData.bancoTipoConta}</p>
                    </div>
                  )}
                  {corretorData.bancoPix && (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Chave PIX
                      </label>
                      <p className="text-lg text-slate-900 font-mono break-all">{corretorData.bancoPix}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informações Profissionais */}
            {(corretorData?.areaAtuacao || corretorData?.observacoes) && (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  Informações Profissionais
                </h2>
                <div className="space-y-6">
                  {corretorData.areaAtuacao && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Área de Atuação
                      </label>
                      <p className="text-lg text-slate-900">{corretorData.areaAtuacao}</p>
                    </div>
                  )}
                  {corretorData.observacoes && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Observações
                      </label>
                      <p className="text-lg text-slate-900 whitespace-pre-line">{corretorData.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informações do Cadastro */}
            {corretorData?.criadoEm && (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-6">
                <p className="text-xs text-slate-500">
                  Cadastrado em: {new Date(corretorData.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {corretorData.aprovadoEm && (
                  <p className="text-xs text-slate-500 mt-2">
                    Aprovado em: {new Date(corretorData.aprovadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}


