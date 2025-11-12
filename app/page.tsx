'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const dadosEmpreendimento = {
  titulo: 'Pôr do Sol Eco Village',
  descricao:
    'Seu refúgio de natureza e lazer em Tijucas/SC. Construa sua chácara em um condomínio exclusivo que une tranquilidade, segurança e infraestrutura completa!',
  localizacao: ['Apenas 4 km do Centro de Tijucas (Bairro Itinga).', 'Fácil acesso à BR-101 e praias.'],
  caracteristicas: ['Lotes amplos, a partir de 1.000 m² (até 3.500 m²).', '32 áreas de lazer com club house completo.'],
  investimento: [
    'Valor base do m²: R$ 350,00',
    'Entrada mínima: 10%',
    'Saldo em até 120 parcelas',
    'Correção: IPCA + 0,85% a.m. direto com a incorporadora'
  ],
  contato: '+55 48 9669-6009'
};

const galleryImages = [
  'images/page_2_img_2.jpg',
  'images/page_2_img_3.jpg',
  'images/page_2_img_4.jpg',
  'images/page_3_img_2.jpg',
  'images/page_3_img_3.jpg',
  'images/page_3_img_4.jpg',
  'images/page_3_img_5.jpg',
  'images/page_3_img_6.jpg',
  'images/page_3_img_7.jpg',
  'images/page_3_img_8.jpg',
  'images/page_4_img_2.jpg',
  'images/page_4_img_3.jpg',
  'images/page_4_img_4.jpg',
  'images/page_4_img_5.jpg',
  'images/page_4_img_6.jpg',
  'images/page_5_img_2.jpg',
  'images/page_5_img_3.jpg',
  'images/page_5_img_4.jpg',
  'images/page_5_img_5.jpg',
  'images/page_5_img_6.jpg',
  'images/page_5_img_7.jpg',
  'images/page_6_img_2.jpg',
  'images/page_6_img_3.jpg',
  'images/page_6_img_4.jpg',
  'images/page_6_img_5.jpg',
  'images/page_7_img_2.jpg',
  'images/page_9_img_1.jpg',
  'images/page_9_img_8.jpg',
  'images/page_9_img_9.jpg',
  'images/page_9_img_10.jpg',
  'images/page_10_img_2.jpg',
  'images/page_10_img_3.jpg',
  'images/page_10_img_4.jpg',
  'images/page_10_img_5.jpg',
  'images/page_11_img_1.jpg'
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const totalSlides = galleryImages.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(timer);
  }, [totalSlides]);

  const handlePrev = () => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  const handleNext = () => setCurrentSlide(prev => (prev + 1) % totalSlides);
  const goToSlide = (targetIndex: number) => setCurrentSlide((targetIndex + totalSlides) % totalSlides);

  const previewThumbnails = Array.from({ length: 5 }, (_, index) => galleryImages[(currentSlide + index) % totalSlides]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="bg-slate-900 text-white">
        <motion.div
          className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl bg-white/10 px-4 py-2 backdrop-blur inline-flex">
              <Image src="/logo_duarte_sem_fundo.png" alt="Logo Duarte Urbanismo" width={180} height={56} className="h-12 w-auto" />
            </div>
            <h1 className="mt-2 text-3xl font-semibold">Pôr do Sol Eco Village</h1>
            <p className="mt-3 text-sm text-white/80">
              Controle empreendimentos, clientes, negociações e recibos em um único lugar seguro.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.35em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Link href="/login" className="rounded-full bg-white px-6 py-3 text-slate-900">
              Acessar painel
            </Link>
          </motion.div>
        </motion.div>
      </header>

      <motion.section
        className="relative isolate overflow-hidden"
        {...fadeInUp}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Image
          src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
          alt="Vista aérea da residência Pôr do Sol"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-800/80" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 text-white sm:px-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6 rounded-[36px] bg-white/10 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-right text-xs uppercase tracking-[0.6em] text-white/60">
                <p>Lançamento</p>
                <p>Fase 1 · Tijucas-SC</p>
              </div>
            </div>
            <h2 className="text-5xl font-semibold leading-snug text-white" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              {dadosEmpreendimento.titulo}
            </h2>
            <p className="text-lg text-white/85">{dadosEmpreendimento.descricao}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                className="group rounded-2xl border border-white/30 bg-white/10 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
                    <span className="absolute inset-0 rounded-full bg-white/30 opacity-70 group-hover:animate-ping" />
                    <span className="relative text-lg font-semibold">L</span>
                  </span>
                  <p className="text-sm uppercase tracking-[0.35em] text-white/70">Localização estratégica</p>
                </div>
                <ul className="mt-4 space-y-2 text-base font-semibold text-white">
                  {dadosEmpreendimento.localizacao.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-white/80 animate-pulse" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="group rounded-2xl border border-white/30 bg-white/10 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
                    <span className="absolute inset-0 rounded-full bg-white/30 opacity-70 group-hover:animate-ping" />
                    <span className="relative text-lg font-semibold">I</span>
                  </span>
                  <p className="text-sm uppercase tracking-[0.35em] text-white/70">Infraestrutura completa</p>
                </div>
                <ul className="mt-4 space-y-2 text-base font-semibold text-white">
                  {dadosEmpreendimento.caracteristicas.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-white/80 animate-pulse" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
          <div className="w-full rounded-[28px] bg-white/95 p-6 text-slate-900 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Condições de investimento</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {dadosEmpreendimento.investimento.map(item => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4 text-sm shadow-inner">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Contato exclusivo</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">+55 47 9211-2284</p>
              <p className="text-slate-500">WhatsApp · Consultor dedicado</p>
              <div className="mt-4 rounded-2xl border border-amber-200 bg-white/80 p-3 text-xs text-amber-900">
                <p className="font-semibold uppercase tracking-[0.3em]">Correção especial</p>
                <p className="mt-1 text-sm">
                  IPCA + <strong>0,85% a.m.</strong> direto com a incorporadora · negociação transparente e sem bancos intermediários.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-16" {...fadeInUp}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Memórias visuais</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">Lifestyle Pôr do Sol Eco Village</h3>
            <p className="mt-3 text-sm text-slate-500">
              Transite pelos ambientes do empreendimento e apresente o clima resort aos seus clientes.
            </p>
          </div>
          <div className="relative mt-10 rounded-[36px] bg-slate-900/5 p-4 shadow-xl">
            <motion.div
              key={galleryImages[currentSlide]}
              className="relative h-[320px] overflow-hidden rounded-[28px] sm:h-[460px]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 25px 60px rgba(15,23,42,0.3))' }}
            >
              <button className="absolute inset-0" onClick={() => setZoomImage(galleryImages[currentSlide])}>
                <Image
                  src={`/${galleryImages[currentSlide]}`}
                  alt="Galeria Pôr do Sol Eco Village"
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                  priority={currentSlide === 0}
                />
              </button>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
            </motion.div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:bg-white"
              >
                Anterior
              </button>
              <span className="text-sm font-semibold text-slate-500">
                {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>
              <button
                onClick={handleNext}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:bg-white"
              >
                Próximo
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {previewThumbnails.map(image => {
                const slideIndex = galleryImages.indexOf(image);
                const isActive = slideIndex === currentSlide;
                return (
                  <button
                    key={image}
                    onClick={() => {
                      goToSlide(slideIndex);
                      setZoomImage(image);
                    }}
                    className={`overflow-hidden rounded-2xl border ${isActive ? 'border-slate-900 ring-2 ring-slate-900/40' : 'border-slate-200'
                      }`}
                    aria-label={`Ir para imagem ${slideIndex + 1}`}
                  >
                    <Image
                      src={`/${image}`}
                      alt="Miniatura Pôr do Sol Eco Village"
                      width={120}
                      height={80}
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-slate-900 py-16 text-white" {...fadeInUp}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">Imersão audiovisual</p>
            <h3 className="text-3xl font-semibold leading-snug">Experimente o lifestyle Pôr do Sol em movimento</h3>
            <p className="text-sm text-white/80">
              Um passeio guiado pela infraestrutura completa do empreendimento para potencializar apresentações comerciais e
              despertar o desejo dos seus leads.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.35em]">
              <Link
                href="/login"
                className="rounded-full border border-white/30 px-6 py-3 text-white transition hover:bg-white/10"
              >
                Acessar painel
              </Link>
              <a
                href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-6 py-3 text-slate-900 transition hover:-translate-y-1"
              >
                Apresentar vídeo
              </a>
            </div>
          </div>
          <motion.div
            className="relative w-full overflow-hidden rounded-[32px] border border-white/10 shadow-[0_35px_80px_rgba(0,0,0,0.4)]"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <video
              src="/videos/video.mp4"
              autoPlay
              muted
              loop
              playsInline
              poster="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="pointer-events-none absolute bottom-6 left-6 rounded-full bg-white/20 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white">
              vídeo oficial
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" {...fadeInUp}>
        <motion.div
          className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_35px_80px_rgba(15,23,42,0.08)]"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Fluxo do S.G.C.I</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Transforme a gestão do empreendimento</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                titulo: 'Cadastre e monitore',
                texto: 'Unidades com metragem, valor e status em tempo real, prontas para negociação.'
              },
              {
                titulo: 'Negocie com segurança',
                texto: 'Associe clientes, registre condições contratuais e detalhe permutas (veículo, imóvel, outros bens).'
              },
              {
                titulo: 'Controle financeiro',
                texto: 'Crie cronogramas de parcelas, marque pagamentos e gere recibos oficiais com QR Code.'
              }
            ].map((card, index) => (
              <motion.div
                key={card.titulo}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <h4 className="text-lg font-semibold text-slate-900">{card.titulo}</h4>
                <p className="mt-2 text-sm text-slate-600">{card.texto}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.35em]">
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-6 py-3 text-white transition hover:-translate-y-1 hover:bg-slate-800"
            >
              Acessar painel interno
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {zoomImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-6">
          <button
            className="absolute right-6 top-6 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-white/10"
            onClick={() => setZoomImage(null)}
          >
            Fechar
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <Image src={`/${zoomImage}`} alt="Zoom Pôr do Sol Eco Village" fill className="object-cover" />
          </div>
        </div>
      )}

      <motion.section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-14 text-white" {...fadeInUp}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 text-center sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">Marcas envolvidas</p>
            <h4 className="mt-2 text-2xl font-semibold">Experiência assinada por quem entende de alto padrão</h4>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="rounded-[24px] border border-white/10 bg-white/10 px-6 py-4 backdrop-blur">
              <img
                src="/logo_duarte_sem_fundo.png"
                alt="Logo Duarte Urbanismo"
                className="h-16 w-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs uppercase tracking-[0.3em] text-slate-500 sm:px-6">
          Rua José Antonio da Silva, 152 · Sala 03, Escritório 81, Centro · São João Batista/SC · CEP 88.240-000 ·
          Contato: +55 47 9211-2284
        </div>
      </footer>

      <a
        href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village.+Sou+%5BSeu+Nome%5D."
        target="_blank"
        rel="noreferrer"
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-2xl transition hover:scale-105"
        aria-label="WhatsApp - Falar com especialista"
      >
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/40 opacity-75 animate-ping" />
          <svg
            viewBox="0 0 24 24"
            className="relative h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.5 11.5c0 4.694-3.806 8.5-8.5 8.5a8.52 8.52 0 01-4.106-1.03L3.5 20.5l1.638-4.35A8.47 8.47 0 013.5 11.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.75 8.75s-.25 1.5 1.5 3.25c1.75 1.75 3.25 1.5 3.25 1.5l1-.75"
            />
          </svg>
        </span>
        WhatsApp
      </a>
    </div>
  );
}
