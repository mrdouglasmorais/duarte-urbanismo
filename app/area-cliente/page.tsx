'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export default function AreaClientePage() {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [numeroContrato, setNumeroContrato] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Aqui você pode adicionar a lógica de validação e busca de contratos
    // Por enquanto, apenas simula um delay
    setTimeout(() => {
      setIsLoading(false);
      // Exemplo de validação básica
      if (!cpfCnpj || !numeroContrato) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      // Redirecionar para área de consulta ou mostrar dados
      // router.push(`/area-cliente/consulta?cpf=${cpfCnpj}&contrato=${numeroContrato}`);
    }, 1000);
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
                src="/logo_duarte_sem_fundo.png"
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
                  htmlFor="cpfCnpj"
                  className="mb-2 block text-left text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
                >
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  id="cpfCnpj"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>

              <div>
                <label
                  htmlFor="numeroContrato"
                  className="mb-2 block text-left text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
                >
                  Número do Contrato
                </label>
                <input
                  type="text"
                  id="numeroContrato"
                  value={numeroContrato}
                  onChange={(e) => setNumeroContrato(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  placeholder="Número do seu contrato"
                />
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

      {/* Link para Recibos Públicos */}
      <section className="relative py-16 px-4">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3
              className="mb-4 text-2xl font-bold text-white md:text-3xl"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Precisa Validar um Recibo?
            </h3>
            <p className="mb-6 text-white/80">
              Acesse nossa ferramenta pública de validação de recibos usando o número do recibo ou QR Code.
            </p>
            <Link
              href="/recibos"
              className="inline-block rounded-full bg-white px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-emerald-900 transition hover:scale-105 hover:shadow-xl"
            >
              Validar Recibo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-emerald-800/30 bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <Image
                src="/logo_duarte_sem_fundo.png"
                alt="Duarte Urbanismo"
                width={200}
                height={65}
                className="h-12 w-auto"
              />
              <p className="mt-4 text-sm text-white/70">
                Rua José Antonio da Silva, 152 · Sala 03, Escritório 81, Centro
                <br />
                São João Batista/SC · CEP 88.240-000
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-white/60">
                © {new Date().getFullYear()} Duarte Urbanismo. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

