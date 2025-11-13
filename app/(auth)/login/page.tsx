'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        const redirectTo = searchParams.get('redirectTo') || '/painel';
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950 px-4">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/60 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-[40px] bg-white/95 backdrop-blur-sm p-8 shadow-[0_35px_80px_rgba(15,23,42,0.25)] md:p-12"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo_duarte_sem_fundo.png"
              alt="Duarte Urbanismo"
              width={180}
              height={56}
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-2">Acesso Restrito</p>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Sistema de Gestão
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Utilize suas credenciais para acessar o painel administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-emerald-600 px-6 py-3.5 text-base font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Não tem uma conta?{' '}
              <Link href="/cadastro-corretor" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Cadastre-se como corretor
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        Carregando...
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
