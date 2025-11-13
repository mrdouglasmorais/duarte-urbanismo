"use client";

import { useState, useMemo } from "react";
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
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">{editingId ? "Editar corretor" : "Novo corretor"}</p>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...initialForm });
                }}
                className="text-sm text-slate-500 underline"
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

        <div className="space-y-6">
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
                    <div className="flex gap-4">
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
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-slate-900">{corretor.nome}</p>
                              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                                PENDENTE
                              </span>
                            </div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-1">CRECI {corretor.creci}</p>
                            <p className="text-sm text-slate-600 mt-2">{corretor.email}</p>
                            <p className="text-sm text-slate-600">{corretor.telefone}</p>
                            {corretor.areaAtuacao && (
                              <p className="text-sm text-slate-500 mt-1">Área: {corretor.areaAtuacao}</p>
                            )}
                            {corretor.observacoes && (
                              <p className="text-sm text-slate-500 mt-1">{corretor.observacoes}</p>
                            )}
                            {corretor.criadoEm && (
                              <p className="text-xs text-slate-400 mt-2">
                                Cadastrado em: {new Date(corretor.criadoEm).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(corretor.id, 'Aprovado')}
                              disabled={isApproving === corretor.id}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isApproving === corretor.id ? 'Aprovando...' : 'Aprovar'}
                            </button>
                            <button
                              onClick={() => handleApprove(corretor.id, 'Rejeitado')}
                              disabled={isApproving === corretor.id}
                              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900">Corretores aprovados</p>
              <span className="text-sm text-slate-500">{corretoresAprovados.length} registros</span>
            </div>
            <div className="mt-4 space-y-4">
              {corretoresAprovados.map(corretor => (
                <div key={corretor.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {corretor.foto && (
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-200">
                          <Image
                            src={corretor.foto}
                            alt={corretor.nome}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-base font-semibold text-slate-900">{corretor.nome}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CRECI {corretor.creci}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button onClick={() => handleEdit(corretor.id)} className="text-slate-600 underline">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(corretor.id)} className="text-rose-600 underline">
                        Remover
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{corretor.email}</p>
                  <p className="text-sm text-slate-600">{corretor.telefone}</p>
                  {corretor.contatoSecundario && (
                    <p className="text-sm text-slate-500">Contato secundário: {corretor.contatoSecundario}</p>
                  )}
                  {corretor.areaAtuacao && (
                    <p className="text-sm text-slate-500">Área de atuação: {corretor.areaAtuacao}</p>
                  )}
                  {corretor.observacoes && (
                    <p className="text-sm text-slate-500">Notas: {corretor.observacoes}</p>
                  )}
                </div>
              ))}
              {corretoresAprovados.length === 0 && <p className="text-sm text-slate-500">Nenhum corretor aprovado.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
