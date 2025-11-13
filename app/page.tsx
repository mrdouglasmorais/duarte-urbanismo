'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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

const estatisticas = [
  { valor: '1.000', unidade: 'M²', descricao: 'Lotes a partir de' },
  { valor: '3.500', unidade: 'M²', descricao: 'Lotes até' },
  { valor: '32', unidade: '', descricao: 'Áreas de lazer' },
  { valor: '100%', unidade: '', descricao: 'Sustentável' }
];

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
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section - Inspirado no Senna Tower */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Background com efeito de luz natural */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900"
          style={{ opacity, scale }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent" />
          {/* Efeito de luz solar */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-300/10 to-transparent"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />
        </motion.div>

        {/* Imagem de fundo */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [0.4, 0]) }}
        >
          <Image
            src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
            alt="Pôr do Sol Eco Village"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/60 to-transparent" />
        </motion.div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <Image
              src="/logo_duarte_sem_fundo.png"
              alt="Duarte Urbanismo"
              width={280}
              height={90}
              className="mx-auto h-20 w-auto drop-shadow-2xl"
              priority
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 text-6xl font-bold tracking-tight md:text-8xl lg:text-9xl"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            PÔR DO SOL
            <br />
            <span className="bg-linear-to-r from-emerald-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
              ECO VILLAGE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12 max-w-2xl text-xl text-white/90 md:text-2xl"
          >
            O condomínio residencial mais sustentável e elegante de Tijucas
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
              target="_blank"
              rel="noreferrer"
              className="group rounded-full bg-white px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-emerald-900 transition-all hover:scale-105 hover:shadow-2xl"
            >
              Saiba Mais
            </a>
            <Link
              href="/login"
              className="rounded-full border-2 border-white/80 bg-white/10 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition-all hover:bg-white/20"
            >
              Acessar Painel
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="h-8 w-px bg-white/60" />
        </motion.div>
      </section>

      {/* Seção: O Condomínio Mais Sustentável */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950">
        {/* Efeito de luz no horizonte */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/80 to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 lg:grid-cols-2 lg:items-center">
          {/* Imagem à esquerda */}
          <motion.div
            className="relative h-[500px] overflow-hidden rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
              alt="Pôr do Sol Eco Village"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-emerald-950/60 via-transparent to-transparent" />
          </motion.div>

          {/* Texto à direita */}
          <motion.div
            className="space-y-6 text-white"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm uppercase tracking-[0.5em] text-emerald-300">O Condomínio</p>
            <h2 className="text-5xl font-bold leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              O CONDOMÍNIO RESIDENCIAL
              <br />
              <span className="bg-linear-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent">
                MAIS SUSTENTÁVEL
              </span>
              <br />
              DE TIJUCAS
            </h2>
            <p className="text-lg leading-relaxed text-white/90">
              Inspirado na harmonia entre natureza e modernidade, o Pôr do Sol Eco Village representa um novo conceito de
              moradia sustentável. Cada lote foi pensado para preservar a vegetação nativa, enquanto oferece toda a infraestrutura
              necessária para uma vida plena em contato com a natureza.
            </p>
            <p className="text-lg leading-relaxed text-white/90">
              Aqui, você constrói não apenas uma casa, mas um legado de respeito ao meio ambiente e qualidade de vida para as
              futuras gerações.
            </p>
            <a
              href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-white px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-emerald-900 transition-all hover:scale-105"
            >
              Saiba Mais
            </a>
          </motion.div>
        </div>

        {/* Estatísticas */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24">
          <motion.div
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {estatisticas.map((stat, index) => (
              <motion.div
                key={index}
                className="rounded-3xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-white md:text-5xl">
                  {stat.valor}
                  {stat.unidade && <span className="text-2xl text-emerald-300">{stat.unidade}</span>}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.2em] text-white/80">{stat.descricao}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Seção: Inspirado na Harmonia com a Natureza */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-24 lg:grid-cols-2 lg:items-center">
          {/* Texto à esquerda */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm uppercase tracking-[0.5em] text-emerald-600">Filosofia</p>
            <h2 className="text-5xl font-bold leading-tight text-slate-900 md:text-6xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              INSPIRADO NA HARMONIA
              <br />
              <span className="bg-linear-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                COM A NATUREZA
              </span>
            </h2>
            <p className="text-lg leading-relaxed text-slate-700">
              O Pôr do Sol Eco Village nasceu da visão de criar um espaço onde o ser humano e a natureza coexistem em perfeita
              harmonia. Cada detalhe foi planejado para minimizar o impacto ambiental, utilizando tecnologias sustentáveis e
              práticas ecológicas.
            </p>
            <p className="text-lg leading-relaxed text-slate-700">
              Nossos lotes preservam a vegetação nativa, nossos sistemas de energia são renováveis, e nossa infraestrutura foi
              pensada para durar gerações, sempre respeitando o ecossistema local.
            </p>
            <a
              href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105"
            >
              Saiba Mais
            </a>
          </motion.div>

          {/* Imagem à direita */}
          <motion.div
            className="relative h-[600px] overflow-hidden rounded-[40px] shadow-2xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={`/${galleryImages[0]}`}
              alt="Natureza e sustentabilidade"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-emerald-950/40 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Seção: Chácaras */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Imagem à esquerda */}
            <motion.div
              className="relative h-[600px] overflow-hidden rounded-[40px] shadow-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src={`/${galleryImages[1]}`}
                alt="Chácaras Pôr do Sol Eco Village"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Texto à direita */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-[0.5em] text-emerald-600">Residências</p>
              <h2 className="text-5xl font-bold leading-tight text-slate-900 md:text-6xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                CHÁCARAS
              </h2>
              <p className="text-lg leading-relaxed text-slate-700">
                Lotes amplos que permitem construir sua chácara dos sonhos. Com áreas a partir de 1.000 m² até 3.500 m², você
                tem espaço de sobra para criar seu refúgio particular, com jardins, pomares, hortas e áreas de lazer privativas.
              </p>
              <p className="text-lg leading-relaxed text-slate-700">
                Cada lote foi cuidadosamente planejado para oferecer privacidade, segurança e a liberdade de construir
                exatamente como você sempre sonhou, sempre respeitando as normas de sustentabilidade e preservação ambiental.
              </p>
              <a
                href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105"
              >
                Saiba Mais
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Seção: Lazer */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <motion.div
            className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Texto à esquerda */}
            <motion.div
              className="space-y-6 text-white"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-[0.5em] text-emerald-300">Infraestrutura</p>
              <h2 className="text-5xl font-bold leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                LAZER
              </h2>
              <p className="text-lg leading-relaxed text-white/90">
                32 áreas de lazer cuidadosamente planejadas para toda a família. Club house completo com piscinas, quadras
                esportivas, playgrounds, áreas de churrasco, trilhas ecológicas e muito mais.
              </p>
              <p className="text-lg leading-relaxed text-white/90">
                Cada espaço foi projetado para promover o convívio social, o bem-estar e o contato com a natureza, sempre com
                foco na sustentabilidade e no respeito ao meio ambiente.
              </p>
              <a
                href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-full bg-white px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-emerald-900 transition-all hover:scale-105"
              >
                Saiba Mais
              </a>
            </motion.div>

            {/* Imagem à direita */}
            <motion.div
              className="relative h-[600px] overflow-hidden rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src={`/${galleryImages[2]}`}
                alt="Áreas de lazer"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-emerald-950/60 via-transparent to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Seção: Tijucas - O Destino Completo */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="relative mb-12 h-[400px] overflow-hidden rounded-[40px] shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={`/${galleryImages[3]}`}
              alt="Tijucas - Santa Catarina"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <h2 className="text-4xl font-bold md:text-5xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                TIJUCAS
                <br />
                O DESTINO COMPLETO
              </h2>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-slate-700">
                Localizado a apenas 4 km do Centro de Tijucas, no Bairro Itinga, o Pôr do Sol Eco Village oferece o melhor dos
                dois mundos: a tranquilidade do campo com a conveniência da cidade.
              </p>
              <p className="text-lg leading-relaxed text-slate-700">
                Tijucas é uma cidade em constante crescimento, com fácil acesso à BR-101, praias paradisíacas, comércio completo
                e toda a infraestrutura necessária para uma vida plena.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-slate-700">
                A região combina a tradição catarinense com o desenvolvimento moderno, oferecendo qualidade de vida, segurança e
                oportunidades para toda a família.
              </p>
              <p className="text-lg leading-relaxed text-slate-700">
                Aqui você encontra escolas, hospitais, shopping centers e uma vida social ativa, tudo a poucos minutos do seu
                refúgio ecológico.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a
              href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105"
            >
              Saiba Mais
            </a>
          </motion.div>
        </div>
      </section>

      {/* Seção: Um Convite a Viver com Propósito */}
      <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950">
        {/* Efeito de luz dramático */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,_var(--tw-gradient-stops))] from-emerald-300/40 via-transparent to-transparent" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-200/20 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <div className="relative z-10 flex h-full min-h-[600px] flex-col items-center justify-center px-4 text-center text-white">
          <motion.h2
            className="mb-8 max-w-4xl text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            UM CONVITE A VIVER A VIDA
            <br />
            <span className="bg-linear-to-r from-emerald-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
              COM PROPÓSITO
            </span>
            <br />
            E SE ORGULHAR DO SEU LEGADO
          </motion.h2>
        </div>
      </section>

      {/* Galeria */}
      <motion.section className="bg-white py-24" {...fadeInUp}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Galeria</p>
            <h3 className="mt-2 text-4xl font-bold text-slate-900 md:text-5xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Lifestyle Pôr do Sol Eco Village
            </h3>
          </div>
          <div className="relative rounded-[40px] bg-slate-900/5 p-4 shadow-xl">
            <motion.div
              key={galleryImages[currentSlide]}
              className="relative h-[400px] overflow-hidden rounded-[32px] sm:h-[600px]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            >
              <button className="absolute inset-0" onClick={() => setZoomImage(galleryImages[currentSlide])}>
                <Image
                  src={`/${galleryImages[currentSlide]}`}
                  alt="Galeria Pôr do Sol Eco Village"
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-cover"
                  priority={currentSlide === 0}
                />
              </button>
            </motion.div>
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:bg-slate-50"
              >
                Anterior
              </button>
              <span className="text-sm font-semibold text-slate-500">
                {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>
              <button
                onClick={handleNext}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:bg-slate-50"
              >
                Próximo
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
                    className={`overflow-hidden rounded-2xl border-2 transition-all ${
                      isActive ? 'border-emerald-600 ring-2 ring-emerald-600/40' : 'border-slate-200'
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

      {/* Modal de zoom */}
      {zoomImage && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 p-6">
          <button
            className="absolute right-6 top-6 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white backdrop-blur transition hover:bg-white/20"
            onClick={() => setZoomImage(null)}
          >
            Fechar
          </button>
          <div className="relative h-[80vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <Image src={`/${zoomImage}`} alt="Zoom Pôr do Sol Eco Village" fill className="object-contain" />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h4 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              O CONDOMÍNIO RESIDENCIAL MAIS SUSTENTÁVEL DE TIJUCAS
            </h4>
          </div>
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
                <br />
                Contato: +55 47 9211-2284
              </p>
            </div>
            <div className="flex flex-col gap-4 text-center md:text-right">
              <Link
                href="/login"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition hover:bg-white/20"
              >
                Acessar Painel
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Botão WhatsApp flutuante */}
      <a
        href="https://wa.me/554792112284?text=Ol%C3%A1%2C+tenho+interesse+no+empreendimento+P%C3%B4r+do+Sol+Eco+Village."
        target="_blank"
        rel="noreferrer"
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-2xl transition hover:scale-105"
        aria-label="WhatsApp - Falar com especialista"
      >
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/40 opacity-75 animate-ping" />
          <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.5 11.5c0 4.694-3.806 8.5-8.5 8.5a8.52 8.52 0 01-4.106-1.03L3.5 20.5l1.638-4.35A8.47 8.47 0 013.5 11.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.75 8.75s-.25 1.5 1.5 3.25c1.75 1.75 3.25 1.5 3.25 1.5l1-.75" />
          </svg>
        </span>
        WhatsApp
      </a>
    </div>
  );
}
