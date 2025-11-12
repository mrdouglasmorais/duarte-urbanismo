'use client';

import { PageTransition } from '@/components/PageTransition';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace('/painel');
    }
  }, [user, isReady, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await login(email, password);
      const redirectTo = searchParams.get('redirectTo') || '/painel';
      router.replace(redirectTo);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível efetuar o login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4">
      <PageTransition>
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Acesso restrito</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Sistema de Gestão de Contratos</h1>
          <p className="mt-2 text-sm text-slate-500">
            Utilize o acesso corporativo para administrar empreendimentos, clientes e negociações.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">E-mail corporativo</label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="voce@empresa.com.br"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isSubmitting ? 'Validando...' : 'Entrar no sistema'}
            </button>
          </form>

        </div>
      </PageTransition>
    </div>
  );
}
