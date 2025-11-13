'use client';

import Image from 'next/image';
import Link from 'next/link';

interface FooterProps {
  variant?: 'light' | 'dark';
  showFullFooter?: boolean;
}

export function Footer({ variant = 'dark', showFullFooter = true }: FooterProps) {
  const isDark = variant === 'dark';
  const logoHabitvs = isDark ? '/habitvs-light.png' : '/habitvs-dark.png';

  return (
    <footer className={`relative ${isDark ? 'border-t border-emerald-800/30 bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 py-16 text-white' : 'border-t border-slate-200 bg-white py-12 text-slate-900'}`}>
      {isDark && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {showFullFooter && (
          <>
            {/* Título */}
            <div className="mb-12 text-center">
              <h4 className={`text-2xl font-bold md:text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                O CONDOMÍNIO RESIDENCIAL MAIS SUSTENTÁVEL DE TIJUCAS
              </h4>
              <div className={`mx-auto mt-4 h-px w-24 ${isDark ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent' : 'bg-gradient-to-r from-transparent via-emerald-600 to-transparent'}`} />
            </div>

            {/* Conteúdo principal */}
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16">
              {/* Logo e Informações */}
              <div className="text-center md:text-left">
                <Image
                  src="/logo_duarte_sem_fundo.png"
                  alt="Duarte Urbanismo"
                  width={200}
                  height={65}
                  className="mx-auto h-14 w-auto md:mx-0"
                />
                <p className={`mt-6 text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
                  Construindo sonhos com sustentabilidade e excelência.
                </p>
              </div>

              {/* Contato */}
              <div className={`space-y-4 text-center md:text-left`}>
                <h5 className={`text-lg font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Contato</h5>
                <div className="space-y-3">
                  <a
                    href="tel:+554792112284"
                    className={`flex items-center justify-center gap-3 text-sm transition ${isDark ? 'text-white/80 hover:text-emerald-300' : 'text-slate-600 hover:text-emerald-600'} md:justify-start`}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+55 47 9211-2284</span>
                  </a>
                  <a
                    href="https://wa.me/554792112284"
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-3 text-sm transition ${isDark ? 'text-white/80 hover:text-emerald-300' : 'text-slate-600 hover:text-emerald-600'} md:justify-start`}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                  <div className={`flex items-start justify-center gap-3 text-sm ${isDark ? 'text-white/80' : 'text-slate-600'} md:justify-start`}>
                    <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-semibold">Escritório:</p>
                      <p>Rua José Antonio da Silva, 152</p>
                      <p>Sala 03, Escritório 81, Centro</p>
                      <p>São João Batista/SC · CEP 88.240-000</p>
                      <p className="mt-4 font-semibold">Empreendimento:</p>
                      <p>Estrada Geral Rio da Dona, s/n</p>
                      <p>Bairro Rio da Dona</p>
                      <p>Tijucas - SC</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Links Rápidos */}
              <div className="space-y-4 text-center md:text-left">
                <h5 className={`text-lg font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Links Rápidos</h5>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/area-cliente"
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${isDark ? 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-emerald-400/50' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-emerald-400'} md:justify-start`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Área do Cliente
                  </Link>
                  <Link
                    href="/login"
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${isDark ? 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-emerald-400/50' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-emerald-400'} md:justify-start`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Acessar Painel
                  </Link>
                  <Link
                    href="/cadastro-corretor"
                    className={`inline-flex items-center justify-center gap-2 text-sm transition ${isDark ? 'text-white/80 hover:text-emerald-300' : 'text-slate-600 hover:text-emerald-600'} md:justify-start`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Cadastro de Corretor
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Rodapé inferior com logo Habitvs */}
        <div className={`mt-12 border-t ${isDark ? 'border-emerald-800/30' : 'border-slate-200'} pt-8`}>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                © {new Date().getFullYear()} Duarte Urbanismo. Todos os direitos reservados.
              </p>
              {showFullFooter && (
                <p className={`mt-2 text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  Desenvolvido com dedicação para construir seu futuro sustentável.
                </p>
              )}
            </div>

            {/* Logo Habitvs */}
            <div className="flex flex-col items-center gap-2">
              <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                Tecnologia por{' '}
                <a
                  href="https://habitvs.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-semibold transition ${isDark ? 'text-white/70 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  Habitvs
                </a>
                {' '}empoderando o setor imobiliário.
              </p>
              <a
                href="https://habitvs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block"
              >
                <div className="absolute inset-0 rounded-lg bg-emerald-500/30 opacity-75 blur-xl animate-pulse" style={{ animationDuration: '2s' }} />
                <Image
                  src={logoHabitvs}
                  alt="Habitvs - Tecnologia para o setor imobiliário"
                  width={120}
                  height={40}
                  className="relative h-8 w-auto transition-transform duration-300 group-hover:scale-110 animate-pulse"
                  style={{ animationDuration: '2s', animationTimingFunction: 'ease-in-out' }}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

