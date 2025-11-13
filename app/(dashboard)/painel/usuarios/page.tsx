'use client';

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { validarEmail } from '@/lib/validators';

interface User {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

const initialForm = {
  nome: '',
  email: '',
  password: '',
  ativo: true
};

export default function UsuariosPage() {
  const { user: currentUser, profile } = useFirebaseAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    const emailValidation = validarEmail(form.email);
    if (emailValidation.mensagem) newErrors.email = emailValidation.mensagem;
    if (!editingId && !form.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }
    if (form.password && form.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = editingId
        ? { nome: form.nome, email: form.email, ativo: form.ativo, ...(form.password && { password: form.password }) }
        : { nome: form.nome, email: form.email, password: form.password, ativo: form.ativo };

      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao salvar usuário');
      }

      await loadUsers();
      setForm({ ...initialForm });
      setEditingId(null);
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      nome: user.nome,
      email: user.email,
      password: '',
      ativo: user.ativo
    });
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    if (id === currentUser?.uid || id === profile?.uid) {
      alert('Você não pode remover seu próprio usuário');
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Falha ao remover usuário');
      }
    } catch (error) {
      alert('Erro ao remover usuário');
    }
  };

  const handleCancel = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setErrors({});
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Gestão de acesso</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Usuários do Sistema</h1>
        <p className="mt-2 text-sm text-slate-600">
          Gerencie os usuários com acesso ao sistema de gestão de contratos imobiliários.
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          {editingId ? 'Editar usuário' : 'Novo usuário'}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
              {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              {editingId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
              required={!editingId}
              minLength={6}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              checked={form.ativo}
              onChange={e => setForm(prev => ({ ...prev, ativo: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-slate-700">
              Usuário ativo
            </label>
          </div>

          {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isLoading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar usuário'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Usuários cadastrados</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm text-slate-900">{user.nome}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        user.ativo
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      {user.id !== currentUser?.uid && user.id !== profile?.uid && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 transition hover:bg-red-50"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Nenhum usuário cadastrado</p>
          )}
        </div>
      </div>
    </div>
  );
}

