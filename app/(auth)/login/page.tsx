'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { toastSuccess, toastError, handleApiError } from '@/lib/toast';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInEmail, signInGoogle, signInAnonymous } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setTokenCookie = async (token: string) => {
    await fetch('/api/auth/set-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const userCredential = await signInEmail(email, password);
      const token = await userCredential.user.getIdToken();
      await setTokenCookie(token);

      toastSuccess('Login realizado com sucesso!');

      const redirectTo = searchParams.get('redirectTo') || '/painel';
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const userCredential = await signInGoogle();
      const token = await userCredential.user.getIdToken();
      await setTokenCookie(token);

      toastSuccess('Login com Google realizado com sucesso!');

      const redirectTo = searchParams.get('redirectTo') || '/painel';
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login com Google.';
      setError(errorMessage);
      toastError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const userCredential = await signInAnonymous();
      const token = await userCredential.user.getIdToken();
      await setTokenCookie(token);

      toastSuccess('Acesso como visitante realizado!');

      const redirectTo = searchParams.get('redirectTo') || '/painel';
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login anônimo.';
      setError(errorMessage);
      toastError(errorMessage);
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
              src="/logo.png"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/95 px-2 text-slate-500">ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>

          <button
            type="button"
            onClick={handleAnonymousSignIn}
            disabled={isSubmitting}
            className="w-full rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Continuar como visitante
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
