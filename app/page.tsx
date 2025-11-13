'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import SEO from '@/components/SEO';

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

const corretores = [
  {
    id: 'cor-daniel-duarte',
    nome: 'Daniel Duarte',
    cargo: 'Diretor Geral',
    creci: '',
    telefone: '48 9211-2284',
    whatsapp: '554892112284',
    areaAtuacao: 'Direção e Gestão',
    foto: '/corretores/daniel-duarte.JPG',
    destaque: true
  },
  {
    id: 'cor-gelvane-silva',
    nome: 'Gelvane Silva',
    cargo: 'Chefe de Vendas',
    creci: '',
    telefone: '48 9211-2284',
    whatsapp: '554892112284',
    areaAtuacao: 'Vendas e Negociações',
    foto: '/corretores/gelvane-silva.JPG',
    destaque: true
  }
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

const menuItems = [
  { label: 'Início', href: '#hero' },
  { label: 'O Condomínio', href: '#condominio' },
  { label: 'Filosofia', href: '#filosofia' },
  { label: 'Chácaras', href: '#chacaras' },
  { label: 'Lazer', href: '#lazer' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Contato', href: '#contato' }
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
    dataAgendamento: '',
    horarioAgendamento: '',
    corretorId: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
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

  const handlePrev = () => {
    let attempts = 0;
    let newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    while (imageErrors.has(galleryImages[newSlide]) && attempts < totalSlides) {
      newSlide = (newSlide - 1 + totalSlides) % totalSlides;
      attempts++;
    }
    setCurrentSlide(newSlide);
  };

  const handleNext = () => {
    let attempts = 0;
    let newSlide = (currentSlide + 1) % totalSlides;
    while (imageErrors.has(galleryImages[newSlide]) && attempts < totalSlides) {
      newSlide = (newSlide + 1) % totalSlides;
      attempts++;
    }
    setCurrentSlide(newSlide);
  };

  const goToSlide = (targetIndex: number) => {
    if (!imageErrors.has(galleryImages[targetIndex])) {
      setCurrentSlide((targetIndex + totalSlides) % totalSlides);
    }
  };

  // Filtrar apenas imagens válidas que não têm erro
  const validImages = galleryImages.filter(img => !imageErrors.has(img));
  const currentValidIndex = validImages.indexOf(galleryImages[currentSlide]);
  const previewThumbnails = Array.from({ length: Math.min(5, validImages.length) }, (_, index) => {
    const validIndex = currentValidIndex >= 0
      ? (currentValidIndex + index) % validImages.length
      : index % validImages.length;
    return validImages[validIndex];
  });

  const handleScrollTo = (href: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar o formulário
    console.log('Formulário enviado:', formData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: '',
        dataAgendamento: '',
        horarioAgendamento: '',
        corretorId: ''
      });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-white text-slate-900">
        {/* Navegação Sticky */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-20 items-center justify-between">
            <Link href="#hero" className="flex items-center gap-3" onClick={() => handleScrollTo('#hero')}>
              <Image src="/logo_duarte_sem_fundo.png" alt="Duarte Urbanismo" width={140} height={45} className="h-10 w-auto" />
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map(item => (
                <button
                  key={item.href}
                  onClick={() => handleScrollTo(item.href)}
                  className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-700 transition-colors hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Botão Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menu Mobile */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 py-4"
            >
              <div className="flex flex-col gap-2">
                {menuItems.map(item => (
                  <button
                    key={item.href}
                    onClick={() => handleScrollTo(item.href)}
                    className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-700 transition-colors hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section - Inspirado no Senna Tower */}
      <section id="hero" ref={heroRef} className="relative h-screen overflow-hidden">
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
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white pt-20">
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
              href="/area-cliente"
              className="rounded-full border-2 border-white/80 bg-white/10 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition-all hover:bg-white/20"
            >
              Acessar a área do cliente
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
      <section id="condominio" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950">
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
      <section id="filosofia" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/30">
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
            <h2 className="text-5xl font-bold leading-tight text-slate-900 md:text-6xl">
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
      <section id="chacaras" className="bg-white py-24">
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
              <h2 className="text-5xl font-bold leading-tight text-slate-900 md:text-6xl">
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
      <section id="lazer" className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900 py-24">
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
      <section id="localizacao" className="bg-white py-24">
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
                Localizado no Bairro Rio da Dona, o Pôr do Sol Eco Village oferece o melhor dos
                dois mundos: a tranquilidade do campo com a conveniência da cidade.
              </p>
              <p className="text-lg leading-relaxed text-slate-700">
                Tijucas é uma cidade em constante crescimento, com fácil acesso à BR-101, praias paradisíacas, comércio completo
                e toda a infraestrutura necessária para uma vida plena.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-slate-900">Endereço do Empreendimento</p>
                    <p className="text-slate-700">Estrada Geral Rio da Dona, s/n</p>
                    <p className="text-slate-700">Bairro Rio da Dona</p>
                    <p className="text-slate-700">Tijucas - SC</p>
                  </div>
                </div>
              </div>
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

          {/* Mapa e Link Waze */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Como Chegar
              </h3>
              <p className="text-slate-600">Use o mapa abaixo ou abra no Waze para navegação</p>
            </div>

            {/* Mapa Google Maps */}
            <div className="mb-6 overflow-hidden rounded-[40px] shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.5!2d-48.6339!3d-27.2406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDE0JzI2LjIiUyA0OMKwMzgnMDIuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Localização Pôr do Sol Eco Village"
              />
            </div>

            {/* Botão Waze */}
            <div className="flex justify-center">
              <a
                href="https://waze.com/ul?ll=-27.2406,-48.6339&navigate=yes"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-[#33CCFF] px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105 hover:shadow-xl"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11V6h2v5h5v2h-5v5h-2v-5H6v-2h5z"/>
                </svg>
                Abrir no Waze
              </a>
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
      <motion.section id="galeria" className="bg-white py-24" {...fadeInUp}>
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
              {galleryImages[currentSlide] && !imageErrors.has(galleryImages[currentSlide]) ? (
                <button className="absolute inset-0" onClick={() => setZoomImage(galleryImages[currentSlide])}>
                  <Image
                    src={`/${galleryImages[currentSlide]}`}
                    alt="Galeria Pôr do Sol Eco Village"
                    fill
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-cover"
                    priority={currentSlide === 0}
                    onError={() => {
                      console.error('Erro ao carregar imagem:', galleryImages[currentSlide]);
                      setImageErrors(prev => new Set(prev).add(galleryImages[currentSlide]));
                      // Avançar para próxima imagem válida
                      const nextIndex = (currentSlide + 1) % totalSlides;
                      if (nextIndex !== currentSlide) {
                        setTimeout(() => setCurrentSlide(nextIndex), 100);
                      }
                    }}
                  />
                </button>
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100">
                  <p className="text-slate-400">Imagem não disponível</p>
                </div>
              )}
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
                    {!imageErrors.has(image) ? (
                      <Image
                        src={`/${image}`}
                        alt="Miniatura Pôr do Sol Eco Village"
                        width={120}
                        height={80}
                        className="object-cover"
                        onError={() => {
                          console.error('Erro ao carregar miniatura:', image);
                          setImageErrors(prev => new Set(prev).add(image));
                        }}
                      />
                    ) : (
                      <div className="flex h-20 w-[120px] items-center justify-center bg-slate-100 text-xs text-slate-400">
                        Erro
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Seção: Corretores e Formulário de Contato */}
      <section id="contato" className="bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/20 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.5em] text-emerald-600">Contato</p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              CORRETORES DE PLANTÃO
            </h2>
            <p className="mt-4 text-lg text-slate-600">Nossa equipe está pronta para atender você</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Corretores */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-slate-900">Nossa Equipe</h3>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {corretores.map(corretor => (
                  <motion.div
                    key={corretor.id}
                    className={`flex flex-col items-center text-center ${corretor.destaque ? 'relative' : ''}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Badge de Destaque */}
                    {corretor.destaque && (
                      <div className="absolute -top-2 right-0 z-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                        {corretor.cargo}
                      </div>
                    )}

                    {/* Foto Redonda - Maior para destaques */}
                    <div className={`relative mb-4 overflow-hidden rounded-full shadow-lg transition hover:scale-105 hover:shadow-xl ${
                      corretor.destaque
                        ? 'h-40 w-40 border-4 border-emerald-500 ring-4 ring-emerald-100'
                        : 'h-32 w-32 border-4 border-emerald-100'
                    }`}>
                      <Image
                        src={corretor.foto}
                        alt={`${corretor.nome} - ${corretor.cargo}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 128px, 160px"
                        priority={corretor.destaque}
                        unoptimized
                        onError={(e) => {
                          // Fallback para logo se foto não existir
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.getAttribute('src') || '';
                          if (!currentSrc.includes('logo_duarte_sem_fundo.png')) {
                            target.src = '/logo_duarte_sem_fundo.png';
                          }
                        }}
                      />
                    </div>

                    {/* Informações */}
                    <h4 className={`font-bold text-slate-900 ${corretor.destaque ? 'text-2xl' : 'text-xl'}`}>
                      {corretor.nome}
                    </h4>
                    {corretor.cargo && !corretor.destaque && (
                      <p className="mt-1 text-sm font-semibold text-emerald-600">{corretor.cargo}</p>
                    )}
                    {corretor.creci && (
                      <p className="mt-1 text-sm font-semibold text-emerald-600">CRECI: {corretor.creci}</p>
                    )}
                    {corretor.areaAtuacao && (
                      <p className="mt-2 text-sm text-slate-600">{corretor.areaAtuacao}</p>
                    )}

                    {/* Botão WhatsApp */}
                    <div className="mt-4">
                      <a
                        href={`https://wa.me/${corretor.whatsapp}?text=Olá, ${corretor.nome}! Tenho interesse no empreendimento Pôr do Sol Eco Village.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#20BA5A] hover:scale-105 shadow-lg"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Falar no WhatsApp
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Formulário de Contato */}
            <motion.div
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="mb-6 text-2xl font-bold text-slate-900">Agende sua Visita</h3>
              {formSubmitted ? (
                <div className="rounded-2xl bg-emerald-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-emerald-900">Mensagem Enviada!</h4>
                  <p className="mt-2 text-emerald-700">Entraremos em contato em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="nome" className="mb-2 block text-sm font-semibold text-slate-700">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      required
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefone" className="mb-2 block text-sm font-semibold text-slate-700">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      required
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="(48) 99999-9999"
                    />
                  </div>

                  <div>
                    <label htmlFor="corretorId" className="mb-2 block text-sm font-semibold text-slate-700">
                      Preferência de Corretor
                    </label>
                    <select
                      id="corretorId"
                      name="corretorId"
                      value={formData.corretorId}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Selecione um corretor (opcional)</option>
                      {corretores.map(corretor => (
                        <option key={corretor.id} value={corretor.id}>
                          {corretor.nome} - CRECI {corretor.creci}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="dataAgendamento" className="mb-2 block text-sm font-semibold text-slate-700">
                        Data Preferencial *
                      </label>
                      <input
                        type="date"
                        id="dataAgendamento"
                        name="dataAgendamento"
                        required
                        value={formData.dataAgendamento}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label htmlFor="horarioAgendamento" className="mb-2 block text-sm font-semibold text-slate-700">
                        Horário Preferencial *
                      </label>
                      <select
                        id="horarioAgendamento"
                        name="horarioAgendamento"
                        required
                        value={formData.horarioAgendamento}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">Selecione um horário</option>
                        <option value="08:00">08:00</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                        <option value="17:00">17:00</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mensagem" className="mb-2 block text-sm font-semibold text-slate-700">
                      Mensagem
                    </label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      rows={4}
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Conte-nos sobre seu interesse..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105 hover:bg-emerald-700"
                  >
                    Enviar Solicitação
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

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
      <footer className="relative border-t border-emerald-800/30 bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 py-16 text-white">
        {/* Efeito de luz sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          {/* Título */}
          <div className="mb-12 text-center">
            <h4 className="text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              O CONDOMÍNIO RESIDENCIAL MAIS SUSTENTÁVEL DE TIJUCAS
            </h4>
            <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
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
              <p className="mt-6 text-sm leading-relaxed text-white/80">
                Construindo sonhos com sustentabilidade e excelência.
              </p>
            </div>

            {/* Contato */}
            <div className="space-y-4 text-center md:text-left">
              <h5 className="text-lg font-bold text-emerald-300">Contato</h5>
              <div className="space-y-3">
                <a
                  href="tel:+554792112284"
                  className="flex items-center justify-center gap-3 text-sm text-white/80 transition hover:text-emerald-300 md:justify-start"
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
                  className="flex items-center justify-center gap-3 text-sm text-white/80 transition hover:text-emerald-300 md:justify-start"
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <div className="flex items-start justify-center gap-3 text-sm text-white/80 md:justify-start">
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
              <h5 className="text-lg font-bold text-emerald-300">Links Rápidos</h5>
              <div className="flex flex-col gap-3">
                <Link
                  href="/area-cliente"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 hover:border-emerald-400/50 md:justify-start"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Área do Cliente
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 hover:border-emerald-400/50 md:justify-start"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Acessar Painel
                </Link>
                <Link
                  href="/cadastro-corretor"
                  className="inline-flex items-center justify-center gap-2 text-sm text-white/80 transition hover:text-emerald-300 md:justify-start"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Cadastro de Corretor
                </Link>
              </div>
            </div>
          </div>

          {/* Rodapé inferior */}
          <div className="mt-12 border-t border-emerald-800/30 pt-8 text-center">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} Duarte Urbanismo. Todos os direitos reservados.
            </p>
            <p className="mt-2 text-xs text-white/50">
              Desenvolvido com dedicação para construir seu futuro sustentável.
            </p>
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
    </>
  );
}
