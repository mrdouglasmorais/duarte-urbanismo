"use client";

import { useState, useMemo, useEffect } from "react";
import { useSgci } from "@/contexts/sgci-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { toastSuccess, toastError } from "@/lib/toast";
import Image from "next/image";

const initialForm = {
  nome: "",
  creci: "",
  email: "",
  telefone: "",
  contatoSecundario: "",
  areaAtuacao: "",
  observacoes: ""
};

export default function CorretoresPage() {
  const { corretores, addCorretor, updateCorretor, deleteCorretor } = useSgci();
  const { profile } = useFirebaseAuth();
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  const corretoresAprovados = useMemo(() =>
    corretores.filter(c => c.status === 'Aprovado' || !c.status),
    [corretores]
  );

  const corretoresPendentes = useMemo(() =>
    corretores.filter(c => c.status === 'Pendente'),
    [corretores]
  );

  // Mostrar pendentes automaticamente quando houver algum
  useEffect(() => {
    if (isAdmin && corretoresPendentes.length > 0) {
      setShowPending(true);
    }
  }, [isAdmin, corretoresPendentes.length]);

  const handleApprove = async (corretorId: string, status: 'Aprovado' | 'Rejeitado') => {
    if (!confirm(`Deseja ${status === 'Aprovado' ? 'aprovar' : 'rejeitar'} este corretor?`)) {
      return;
    }

    setIsApproving(corretorId);
    try {
      const response = await fetch('/api/corretores/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corretorId, status }),
      });

      const data = await response.json();

      if (response.ok) {
        toastSuccess(data.message || `Corretor ${status === 'Aprovado' ? 'aprovado' : 'rejeitado'} com sucesso`);
        // Recarregar dados do contexto
        window.location.reload();
      } else {
        toastError(data.error || 'Erro ao processar aprovação');
      }
    } catch (error) {
      toastError('Erro ao processar aprovação');
      console.error(error);
    } finally {
      setIsApproving(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      nome: form.nome.trim(),
      creci: form.creci.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      contatoSecundario: form.contatoSecundario.trim() || undefined,
      areaAtuacao: form.areaAtuacao.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined
    };

    if (editingId) {
      updateCorretor(editingId, payload);
    } else {
      addCorretor(payload);
    }

    setForm({ ...initialForm });
    setEditingId(null);
  };

  const handleEdit = (corretorId: string) => {
    const corretor = corretores.find(c => c.id === corretorId);
    if (!corretor) return;
    setEditingId(corretor.id);
    setForm({
      nome: corretor.nome,
      creci: corretor.creci,
      email: corretor.email,
      telefone: corretor.telefone,
      contatoSecundario: corretor.contatoSecundario ?? "",
      areaAtuacao: corretor.areaAtuacao ?? "",
      observacoes: corretor.observacoes ?? ""
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja remover este corretor?")) {
      deleteCorretor(id);
      if (editingId === id) {
        setEditingId(null);
        setForm({ ...initialForm });
      }
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Equipe Comercial</p>
        <h1 className="text-3xl font-semibold text-slate-900">Corretores credenciados</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre e organize os corretores responsáveis pelas negociações do empreendimento, com CRECI e áreas de atuação.
        </p>
        {isAdmin && corretoresPendentes.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-amber-900">
                    {corretoresPendentes.length} corretor{corretoresPendentes.length > 1 ? 'es' : ''} aguardando aprovação
                  </p>
                  <p className="text-sm text-amber-700">Revise e aprove os novos cadastros abaixo</p>
                </div>
              </div>
              <button
                onClick={() => setShowPending(!showPending)}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                {showPending ? 'Ocultar' : 'Ver pendentes'}
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-lg font-semibold text-slate-900">{editingId ? "Editar corretor" : "Novo corretor"}</p>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...initialForm });
                }}
                className="text-sm text-slate-500 underline whitespace-nowrap"
              >
                Cancelar edição
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">CRECI</label>
              <input
                type="text"
                value={form.creci}
                onChange={event => setForm(prev => ({ ...prev, creci: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Telefone</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={event => setForm(prev => ({ ...prev, telefone: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Contato secundário</label>
              <input
                type="text"
                value={form.contatoSecundario}
                onChange={event => setForm(prev => ({ ...prev, contatoSecundario: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="(00) 00000-0000 / email@secundario.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Área de atuação</label>
              <input
                type="text"
                value={form.areaAtuacao}
                onChange={event => setForm(prev => ({ ...prev, areaAtuacao: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Litoral Norte, Costa Esmeralda..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Observações internas</label>
              <textarea
                value={form.observacoes}
                onChange={event => setForm(prev => ({ ...prev, observacoes: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                rows={3}
                placeholder="Destaques do corretor, certificações, performance..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white"
          >
            {editingId ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <div className="space-y-6 relative z-10">
          {/* Corretores Pendentes (apenas para admins) */}
          {isAdmin && showPending && corretoresPendentes.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-amber-900">Corretores pendentes de aprovação</p>
                  <p className="text-sm text-amber-700 mt-1">{corretoresPendentes.length} aguardando revisão</p>
                </div>
              </div>
              <div className="space-y-4">
                {corretoresPendentes.map(corretor => (
                  <div key={corretor.id} className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {corretor.foto && (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-amber-300">
                          <Image
                            src={corretor.foto}
                            alt={corretor.nome}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="text-base font-semibold text-slate-900 break-words">{corretor.nome}</p>
                              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap">
                                PENDENTE
                              </span>
                            </div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-1">CRECI {corretor.creci}</p>
                            <p className="text-sm text-slate-600 mt-2 break-words">{corretor.email}</p>
                            <p className="text-sm text-slate-600 break-words">{corretor.telefone}</p>
                            {corretor.areaAtuacao && (
                              <p className="text-sm text-slate-500 mt-1 break-words">Área: {corretor.areaAtuacao}</p>
                            )}
                            {corretor.observacoes && (
                              <p className="text-sm text-slate-500 mt-1 break-words">{corretor.observacoes}</p>
                            )}
                            {corretor.criadoEm && (
                              <p className="text-xs text-slate-400 mt-2">
                                Cadastrado em: {new Date(corretor.criadoEm).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleApprove(corretor.id, 'Aprovado')}
                              disabled={isApproving === corretor.id}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {isApproving === corretor.id ? 'Aprovando...' : 'Aprovar'}
                            </button>
                            <button
                              onClick={() => handleApprove(corretor.id, 'Rejeitado')}
                              disabled={isApproving === corretor.id}
                              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {isApproving === corretor.id ? 'Rejeitando...' : 'Rejeitar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Corretores Aprovados */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Corretores Aprovados</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-[0.2em]">{corretoresAprovados.length} {corretoresAprovados.length === 1 ? 'corretor credenciado' : 'corretores credenciados'}</p>
              </div>
            </div>
            <div className="space-y-4">
              {corretoresAprovados.map(corretor => (
                <div key={corretor.id} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-emerald-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col sm:flex-row">
                    {/* Foto e Status */}
                    <div className="flex flex-col items-center sm:items-start gap-3 flex-shrink-0 mb-4 sm:mb-0 sm:mr-12">
                      {corretor.foto ? (
                        <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-emerald-200 shadow-md ring-2 ring-emerald-50">
                          <Image
                            src={corretor.foto}
                            alt={corretor.nome}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-24 w-24 flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md">
                          <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Aprovado
                      </span>
                    </div>

                    {/* Informações Principais */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-1 break-words">{corretor.nome}</h3>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>CRECI {corretor.creci}</span>
                        </div>
                      </div>

                      {/* Informações de Contato */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2 text-sm">
                          <svg className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-slate-500 uppercase tracking-[0.1em] block mb-0.5">E-mail</span>
                            <span className="text-slate-900 break-words">{corretor.email}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <svg className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-slate-500 uppercase tracking-[0.1em] block mb-0.5">Telefone</span>
                            <span className="text-slate-900 break-words">{corretor.telefone}</span>
                          </div>
                        </div>

                        {corretor.whatsapp && (
                          <div className="flex items-start gap-2 text-sm">
                            <svg className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-slate-500 uppercase tracking-[0.1em] block mb-0.5">WhatsApp</span>
                              <span className="text-slate-900 break-words">{corretor.whatsapp}</span>
                            </div>
                          </div>
                        )}

                        {corretor.instagram && (
                          <div className="flex items-start gap-2 text-sm">
                            <svg className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-slate-500 uppercase tracking-[0.1em] block mb-0.5">Instagram</span>
                              <span className="text-slate-900 break-words">@{corretor.instagram.replace('@', '')}</span>
                            </div>
                          </div>
                        )}

                        {corretor.areaAtuacao && (
                          <div className="flex items-start gap-2 text-sm">
                            <svg className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-slate-500 uppercase tracking-[0.1em] block mb-0.5">Área de Atuação</span>
                              <span className="text-slate-900 break-words">{corretor.areaAtuacao}</span>
                            </div>
                          </div>
                        )}

                        {corretor.cidade && corretor.estado && (
                          <div className="flex items-start gap-2 text-sm">
                            <svg className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-slate-500 uppercase tracking-[0.1em] block mb-0.5">Localização</span>
                              <span className="text-slate-900 break-words">{corretor.cidade}, {corretor.estado}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Observações */}
                      {corretor.observacoes && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-start gap-2">
                            <svg className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <div className="flex-1">
                              <span className="text-xs text-slate-500 uppercase tracking-[0.1em] block mb-1.5">Observações</span>
                              <p className="text-sm text-slate-700 leading-relaxed break-words">{corretor.observacoes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações do Admin */}
                    {isAdmin && (
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 sm:items-end">
                        <button
                          onClick={() => handleEdit(corretor.id)}
                          className="group/btn flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition whitespace-nowrap"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(corretor.id)}
                          className="group/btn flex items-center justify-center gap-1.5 rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 hover:border-rose-400 transition whitespace-nowrap"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {corretoresAprovados.length === 0 && (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <svg className="h-12 w-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-600">Nenhum corretor aprovado</p>
                  <p className="text-xs text-slate-500 mt-1">Os corretores aprovados aparecerão aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
