'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toastSuccess, toastError, toastWarning, handleApiError } from '@/lib/toast';
import { validarCPF } from '@/lib/validators';
import { Footer } from '@/components/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export default function AreaClientePage() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verificar se já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/cliente/session');
        const data = await response.json();
        if (data.cliente) {
          router.push('/area-cliente/dashboard');
        }
      } catch (error) {
        // Ignorar erro, usuário não está autenticado
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validação do CPF
      const cpfLimpo = cpf.replace(/\D/g, '');
      if (!cpfLimpo) {
        const errorMsg = 'Por favor, informe seu CPF.';
        setError(errorMsg);
        toastWarning(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!validarCPF(cpfLimpo)) {
        const errorMsg = 'CPF inválido. Verifique e tente novamente.';
        setError(errorMsg);
        toastWarning(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!senha || senha.length < 4) {
        const errorMsg = 'Por favor, informe sua senha.';
        setError(errorMsg);
        toastWarning(errorMsg);
        setIsLoading(false);
        return;
      }

      // Fazer login
      const response = await fetch('/api/cliente/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf: cpfLimpo, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      toastSuccess('Login realizado com sucesso!');

      // Redirecionar para dashboard
      router.push('/area-cliente/dashboard');
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.';
      setError(errorMsg);
      handleApiError(err, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/60 to-transparent" />
      </div>

      {/* Navegação */}
      <motion.nav
        className="relative z-50 border-b border-emerald-800/30 bg-white/5 backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-white.png"
                alt="Duarte Urbanismo"
                width={140}
                height={45}
                className="h-10 w-auto"
              />
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors hover:text-white"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              ÁREA DO CLIENTE
            </h1>
            <p className="mb-12 text-xl text-white/90 md:text-2xl">
              Acesse suas informações de contrato, parcelas e recibos de forma rápida e segura
            </p>
          </motion.div>

          {/* Formulário de Acesso */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-[40px] bg-white/95 backdrop-blur-sm p-8 shadow-[0_35px_80px_rgba(15,23,42,0.25)] md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="cpf"
                  className="mb-2 block text-left text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
                >
                  CPF
                </label>
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    // Formatar CPF: 000.000.000-00
                    let formatted = value;
                    if (value.length > 3) {
                      formatted = value.slice(0, 3) + '.' + value.slice(3);
                    }
                    if (value.length > 6) {
                      formatted = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6);
                    }
                    if (value.length > 9) {
                      formatted = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9, 11);
                    }
                    setCpf(formatted);
                  }}
                  maxLength={14}
                  required
                  className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-left text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 pr-12 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Esqueceu sua senha? Entre em contato conosco.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Acessando...' : 'Acessar Minha Área'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Recursos Disponíveis */}
      <section className="relative py-24 px-4">
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="mb-4 text-4xl font-bold text-white md:text-5xl"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              O QUE VOCÊ PODE FAZER
            </h2>
            <p className="text-lg text-white/80">
              Gerencie todas as suas informações em um só lugar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: 'Consultar Contrato',
                description: 'Visualize todas as informações do seu contrato, condições e termos acordados.'
              },
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: 'Acompanhar Parcelas',
                description: 'Veja o status de todas as suas parcelas, valores e datas de vencimento.'
              },
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: 'Emitir Recibos',
                description: 'Baixe e imprima seus recibos de pagamento com QR Code para validação.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur transition hover:bg-white/15"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="mb-4 flex justify-center text-emerald-300">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="dark" showFullFooter={false} />
    </div>
  );
}

