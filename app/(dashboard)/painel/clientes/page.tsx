"use client";

import { useState } from "react";
import { useSgci } from "@/contexts/sgci-context";
import type { Cliente, PessoaTipo } from "@/types/sgci";
import { validarCEP, validarCPFouCNPJ, validarEmail, validarTelefone } from "@/lib/validators";

const initialForm = {
  tipo: "PF" as PessoaTipo,
  nome: "",
  documento: "",
  email: "",
  telefone: "",
  contatoSecundario: "",
  referencias: "",
  observacoes: "",
  cep: "",
  endereco: ""
};

export default function ClientesPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useSgci();
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<string | null>(null);

  const maskCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const clearCepError = () => {
    setErrors(prev => {
      if (!prev.cep) return prev;
      const clone = { ...prev };
      delete clone.cep;
      return clone;
    });
  };

  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCep(event.target.value);
    setForm(prev => ({ ...prev, cep: masked }));
    setCepStatus(null);
    clearCepError();
  };

  const consultarCep = async (masked: string, digits: string) => {
    try {
      setIsCepLoading(true);
      setCepStatus("Consultando CEP...");
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) {
        throw new Error("Falha na consulta do CEP.");
      }
      const data = await response.json();

      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: "CEP não encontrado." }));
        setCepStatus("CEP não encontrado.");
        return;
      }

      const formattedAddress = [
        data.logradouro,
        data.bairro,
        data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : undefined
      ]
        .filter(Boolean)
        .join(", ");

      setForm(prev => ({
        ...prev,
        cep: masked,
        endereco: formattedAddress || prev.endereco
      }));

      setErrors(prev => {
        const clone = { ...prev };
        delete clone.cep;
        if (formattedAddress) delete clone.endereco;
        return clone;
      });

      setCepStatus(formattedAddress ? "Endereço preenchido automaticamente via ViaCEP." : "CEP válido.");
    } catch (error) {
      console.error("Erro ao consultar CEP:", error);
      setErrors(prev => ({ ...prev, cep: "Não foi possível consultar o CEP no momento." }));
      setCepStatus("Não foi possível consultar o CEP no momento.");
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleCepBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const masked = maskCep(event.target.value);
    const digits = masked.replace(/\D/g, "");
    setForm(prev => ({ ...prev, cep: masked }));

    const validation = validarCEP(masked);
    if (validation.mensagem) {
      setErrors(prev => ({ ...prev, cep: validation.mensagem! }));
      setCepStatus(null);
      return;
    }

    if (digits.length !== 8) {
      setCepStatus("Informe os 8 dígitos do CEP para consultar.");
      return;
    }

    await consultarCep(masked, digits);
  };

  const handleCepLookupClick = async () => {
    const masked = maskCep(form.cep);
    const digits = masked.replace(/\D/g, "");
    setForm(prev => ({ ...prev, cep: masked }));

    const validation = validarCEP(masked);
    if (validation.mensagem) {
      setErrors(prev => ({ ...prev, cep: validation.mensagem! }));
      setCepStatus(null);
      return;
    }

    if (digits.length !== 8) {
      setErrors(prev => ({ ...prev, cep: "CEP deve ter 8 dígitos" }));
      setCepStatus("Informe os 8 dígitos do CEP para consultar.");
      return;
    }

    await consultarCep(masked, digits);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório";
    const docValidation = validarCPFouCNPJ(form.documento);
    if (form.tipo === "PF" && docValidation.tipo !== "CPF") {
      newErrors.documento = "Informe um CPF válido";
    }
    if (form.tipo === "PJ" && docValidation.tipo !== "CNPJ") {
      newErrors.documento = "Informe um CNPJ válido";
    }
    if (docValidation.mensagem) newErrors.documento = docValidation.mensagem;
    const emailValidation = validarEmail(form.email);
    if (emailValidation.mensagem) newErrors.email = emailValidation.mensagem;
    const telefoneValidation = validarTelefone(form.telefone);
    if (telefoneValidation.mensagem) newErrors.telefone = telefoneValidation.mensagem;
    const cepValidation = validarCEP(form.cep);
    if (cepValidation.mensagem) newErrors.cep = cepValidation.mensagem;
    if (!form.endereco.trim()) newErrors.endereco = "Endereço obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const maskedCep = maskCep(form.cep);
    const payload = {
      tipo: form.tipo,
      nome: form.nome.trim(),
      documento: form.documento.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      contatoSecundario: form.contatoSecundario.trim() || undefined,
      referencias: form.referencias.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined,
      cep: maskedCep || undefined,
      endereco: form.endereco.trim()
    };

    if (editingId) {
      updateCliente(editingId, payload);
    } else {
      addCliente(payload);
    }

    setForm({ ...initialForm });
    setEditingId(null);
    setErrors({});
    setCepStatus(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setForm({
      tipo: cliente.tipo,
      nome: cliente.nome,
      documento: cliente.documento,
      email: cliente.email,
      telefone: cliente.telefone,
      contatoSecundario: cliente.contatoSecundario ?? "",
      referencias: cliente.referencias ?? "",
      observacoes: cliente.observacoes ?? "",
      cep: maskCep(cliente.cep ?? ""),
      endereco: cliente.endereco
    });
    setCepStatus(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja remover este cliente?")) {
      deleteCliente(id);
      if (editingId === id) {
        setForm({ ...initialForm });
        setEditingId(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Cadastro</p>
        <h1 className="text-3xl font-semibold text-slate-900">Clientes e pagadores</h1>
        <p className="mt-2 text-sm text-slate-600">
          Registre pessoas físicas ou jurídicas com CPF/CNPJ validado automaticamente e mantenha os contatos organizados.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">
              {editingId ? "Editar cliente" : "Novo cliente/pagador"}
            </p>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...initialForm });
                  setEditingId(null);
                  setErrors({});
                }}
                className="text-sm text-slate-500 underline"
              >
                Cancelar edição
              </button>
            )}
          </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Tipo</label>
              <select
                value={form.tipo}
                onChange={event => setForm(prev => ({ ...prev, tipo: event.target.value as PessoaTipo }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Documento ({form.tipo})</label>
              <input
                type="text"
                value={form.documento}
                onChange={event => setForm(prev => ({ ...prev, documento: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder={form.tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                required
              />
              {errors.documento && <p className="text-xs text-red-600">{errors.documento}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nome completo / Razão Social</label>
              <input
                type="text"
                value={form.nome}
                onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
              {errors.nome && <p className="text-xs text-red-600">{errors.nome}</p>}
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
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Telefone</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={event => setForm(prev => ({ ...prev, telefone: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="(00) 00000-0000"
                required
              />
              {errors.telefone && <p className="text-xs text-red-600">{errors.telefone}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">CEP</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={form.cep}
                  onChange={handleCepChange}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  required
                />
                <button
                  type="button"
                  onClick={handleCepLookupClick}
                  disabled={isCepLoading}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCepLoading ? "Buscando..." : "Buscar CEP"}
                </button>
              </div>
              {errors.cep && <p className="text-xs text-red-600">{errors.cep}</p>}
              {cepStatus && !errors.cep && (
                <p className="text-xs text-slate-500">{cepStatus}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Endereço</label>
              <input
                type="text"
                value={form.endereco}
                onChange={event => setForm(prev => ({ ...prev, endereco: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
              {errors.endereco && <p className="text-xs text-red-600">{errors.endereco}</p>}
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
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Referências / Indicações</label>
              <textarea
                value={form.referencias}
                onChange={event => setForm(prev => ({ ...prev, referencias: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                rows={3}
                placeholder="Indique como o cliente chegou até você ou referências relevantes."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notas internas</label>
              <textarea
                value={form.observacoes}
                onChange={event => setForm(prev => ({ ...prev, observacoes: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                rows={3}
                placeholder="Observações, preferências, histórico de contato..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white"
          >
            {editingId ? "Atualizar cliente" : "Cadastrar cliente"}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Clientes cadastrados</p>
            <span className="text-sm text-slate-500">{clientes.length} registros</span>
          </div>
          <div className="mt-4 space-y-4">
            {clientes.map(cliente => (
              <div key={cliente.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{cliente.nome}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{cliente.tipo}</p>
                  </div>
                  <span className="text-xs text-slate-500">{cliente.documento}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{cliente.email}</p>
                <p className="text-sm text-slate-600">{cliente.telefone}</p>
                {cliente.contatoSecundario && <p className="text-sm text-slate-500">Contato secundário: {cliente.contatoSecundario}</p>}
                <p className="text-xs text-slate-500">
                  {cliente.cep ? `CEP: ${cliente.cep} · ` : ""}
                  {cliente.endereco}
                </p>
                {cliente.referencias && (
                  <p className="mt-2 text-sm text-slate-600">
                    <strong>Referências:</strong> {cliente.referencias}
                  </p>
                )}
                {cliente.observacoes && (
                  <p className="text-sm text-slate-500">
                    <strong>Notas:</strong> {cliente.observacoes}
                  </p>
                )}
                <div className="mt-3 flex gap-3 text-sm">
                  <button onClick={() => handleEdit(cliente)} className="text-slate-600 underline">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(cliente.id)} className="text-rose-600 underline">
                    Remover
                  </button>
                </div>
              </div>
            ))}
            {clientes.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente cadastrado.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
