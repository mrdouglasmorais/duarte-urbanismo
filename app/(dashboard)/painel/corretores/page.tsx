"use client";

import { useState } from "react";
import { useSgci } from "@/contexts/sgci-context";

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
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState<string | null>(null);

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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Corretores cadastrados</p>
            <span className="text-sm text-slate-500">{corretores.length} registros</span>
          </div>
          <div className="mt-4 space-y-4">
            {corretores.map(corretor => (
              <div key={corretor.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{corretor.nome}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CRECI {corretor.creci}</p>
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
            {corretores.length === 0 && <p className="text-sm text-slate-500">Nenhum corretor cadastrado.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
