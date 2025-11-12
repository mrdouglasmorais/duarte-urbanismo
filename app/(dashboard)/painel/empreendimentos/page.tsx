"use client";

import { useState } from "react";
import { useSgci } from "@/contexts/sgci-context";
import type { Empreendimento, StatusUnidade } from "@/types/sgci";

const statusOptions: StatusUnidade[] = ["Disponível", "Reservado", "Vendido"];

const initialForm = {
  nome: "",
  metragem: "",
  unidade: "",
  valorBase: "",
  status: "Disponível" as StatusUnidade
};

export default function EmpreendimentosPage() {
  const { empreendimentos, addEmpreendimento, updateEmpreendimento, deleteEmpreendimento } = useSgci();
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      nome: form.nome.trim(),
      metragem: Number(form.metragem),
      unidade: form.unidade.trim(),
      valorBase: Number(form.valorBase),
      status: form.status
    };

    if (!payload.nome || !payload.unidade || payload.metragem <= 0 || payload.valorBase <= 0) {
      setMensagem("Preencha todos os campos com valores válidos.");
      return;
    }

    if (editingId) {
      updateEmpreendimento(editingId, payload);
      setMensagem("Empreendimento atualizado com sucesso.");
    } else {
      addEmpreendimento(payload);
      setMensagem("Empreendimento cadastrado!");
    }

    setForm({ ...initialForm });
    setEditingId(null);
  };

  const handleEdit = (item: Empreendimento) => {
    setEditingId(item.id);
    setForm({
      nome: item.nome,
      metragem: String(item.metragem),
      unidade: item.unidade,
      valorBase: String(item.valorBase),
      status: item.status
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja remover este registro?")) {
      deleteEmpreendimento(id);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Cadastro</p>
        <h1 className="text-3xl font-semibold text-slate-900">Empreendimentos e unidades</h1>
        <p className="mt-2 text-sm text-slate-600">
          Registre lotes com metragem, valor base e status comercial para manter a disponibilidade atualizada.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">
              {editingId ? "Editar empreendimento" : "Novo empreendimento"}
            </p>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...initialForm });
                  setEditingId(null);
                }}
                className="text-sm text-slate-500 underline"
              >
                Cancelar edição
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nome do Empreendimento</label>
              <input
                type="text"
                value={form.nome}
                onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Ex: Pôr do Sol Eco Village"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Metragem (m²)</label>
              <input
                type="number"
                min={1}
                value={form.metragem}
                onChange={event => setForm(prev => ({ ...prev, metragem: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Lote / Unidade</label>
              <input
                type="text"
                value={form.unidade}
                onChange={event => setForm(prev => ({ ...prev, unidade: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Ex: Lote 12"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Valor base (R$)</label>
              <input
                type="number"
                min={1}
                step="0.01"
                value={form.valorBase}
                onChange={event => setForm(prev => ({ ...prev, valorBase: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={event => setForm(prev => ({ ...prev, status: event.target.value as StatusUnidade }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mensagem && <p className="mt-4 text-sm text-slate-500">{mensagem}</p>}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white"
          >
            {editingId ? "Atualizar registro" : "Cadastrar unidade"}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Unidades cadastradas</p>
            <span className="text-sm text-slate-500">{empreendimentos.length} registros</span>
          </div>

          <div className="mt-4 space-y-4">
            {empreendimentos.map(item => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{item.nome}</p>
                    <p className="text-sm text-slate-500">
                      {item.unidade} · {item.metragem} m²
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "Disponível"
                        ? "bg-emerald-100 text-emerald-700"
                        : item.status === "Reservado"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {item.valorBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <div className="mt-3 flex gap-3 text-sm">
                  <button onClick={() => handleEdit(item)} className="text-slate-600 underline">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-rose-600 underline">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
            {empreendimentos.length === 0 && <p className="text-sm text-slate-500">Nenhum empreendimento cadastrado.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
