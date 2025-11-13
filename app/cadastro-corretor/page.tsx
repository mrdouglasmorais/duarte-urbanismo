'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, ChangeEvent } from 'react';

interface FormData {
  nome: string;
  creci: string;
  email: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  foto: File | null;
  fotoPreview: string | null;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  bancoNome: string;
  bancoAgencia: string;
  bancoConta: string;
  bancoTipoConta: string;
  bancoPix: string;
  areaAtuacao: string;
  observacoes: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export default function CadastroCorretorPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    creci: '',
    email: '',
    telefone: '',
    whatsapp: '',
    instagram: '',
    foto: null,
    fotoPreview: null,
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    bancoNome: '',
    bancoAgencia: '',
    bancoConta: '',
    bancoTipoConta: '',
    bancoPix: '',
    areaAtuacao: '',
    observacoes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('A foto deve ter no máximo 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor, selecione uma imagem válida');
        return;
      }
      setFormData(prev => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file)
      }));
      setErrorMessage('');
    }
  };

  const handleRemovePhoto = () => {
    if (formData.fotoPreview) {
      URL.revokeObjectURL(formData.fotoPreview);
    }
    setFormData(prev => ({
      ...prev,
      foto: null,
      fotoPreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Primeiro, criar usuário no sistema de autenticação
      const password = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`; // Senha temporária

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: password, // Senha temporária, será alterada no primeiro login
          name: formData.nome,
          phone: formData.telefone
        })
      });

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerResult.error || 'Erro ao criar conta de usuário');
      }

      // Depois, salvar dados adicionais do corretor
      const formDataToSend = new FormData();
      formDataToSend.append('userId', registerResult.user.id);
      formDataToSend.append('nome', formData.nome);
      formDataToSend.append('creci', formData.creci);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telefone', formData.telefone);
      formDataToSend.append('whatsapp', formData.whatsapp || formData.telefone);
      formDataToSend.append('instagram', formData.instagram);
      formDataToSend.append('endereco', formData.endereco);
      formDataToSend.append('cep', formData.cep);
      formDataToSend.append('cidade', formData.cidade);
      formDataToSend.append('estado', formData.estado);
      formDataToSend.append('bancoNome', formData.bancoNome);
      formDataToSend.append('bancoAgencia', formData.bancoAgencia);
      formDataToSend.append('bancoConta', formData.bancoConta);
      formDataToSend.append('bancoTipoConta', formData.bancoTipoConta);
      formDataToSend.append('bancoPix', formData.bancoPix);
      formDataToSend.append('areaAtuacao', formData.areaAtuacao);
      formDataToSend.append('observacoes', formData.observacoes);

      if (formData.foto) {
        formDataToSend.append('foto', formData.foto);
      }

      const corretorResponse = await fetch('/api/corretores/cadastro', {
        method: 'POST',
        body: formDataToSend
      });

      const corretorResult = await corretorResponse.json();

      if (!corretorResponse.ok) {
        // Se falhar ao salvar dados do corretor, o usuário já foi criado
        // Isso pode ser tratado depois pelo admin
        console.warn('Usuário criado mas dados do corretor não foram salvos:', corretorResult.error);
      }

      setSubmitStatus('success');
      // Limpar formulário
      setFormData({
        nome: '',
        creci: '',
        email: '',
        telefone: '',
        whatsapp: '',
        instagram: '',
        foto: null,
        fotoPreview: null,
        endereco: '',
        cep: '',
        cidade: '',
        estado: '',
        bancoNome: '',
        bancoAgencia: '',
        bancoConta: '',
        bancoTipoConta: '',
        bancoPix: '',
        areaAtuacao: '',
        observacoes: ''
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao cadastrar corretor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link href="/" className="inline-block">
            <Image
              src="/logo_duarte_sem_fundo.png"
              alt="Duarte Urbanismo"
              width={180}
              height={56}
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950 py-16">
        {/* Background com efeito de luz natural */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent" />

        {/* Imagem de fundo */}
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm uppercase tracking-[0.5em] text-emerald-300 mb-4">Cadastro</p>
            <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              CORRETOR PARCEIRO
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Faça parte da nossa equipe de corretores e ajude a transformar sonhos em realidade
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative py-16 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/20">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[40px] border border-slate-200/70 bg-white/95 backdrop-blur-sm p-8 shadow-[0_35px_80px_rgba(15,23,42,0.15)] md:p-12"
          >
            {/* Background pattern overlay */}
            <div className="absolute inset-0 rounded-[40px] opacity-5">
              <Image
                src="/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg"
                alt="Pattern"
                fill
                className="object-cover rounded-[40px]"
              />
            </div>

            <div className="relative z-10">
              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-emerald-50 p-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Cadastro Enviado com Sucesso!
                  </h2>
                  <p className="mt-2 text-emerald-700">
                    Seu cadastro foi recebido e será analisado pela nossa equipe. Entraremos em contato em breve.
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-block rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700"
                  >
                    Voltar ao Início
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Dados Pessoais */}
                  <motion.div {...fadeInUp}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                      <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Dados Pessoais
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="nome" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          id="nome"
                          name="nome"
                          required
                          value={formData.nome}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div>
                        <label htmlFor="creci" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          CRECI *
                        </label>
                        <input
                          type="text"
                          id="creci"
                          name="creci"
                          required
                          value={formData.creci}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Ex: 123456-SC"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="telefone" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          id="telefone"
                          name="telefone"
                          required
                          value={formData.telefone}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="(48) 99999-9999"
                        />
                      </div>

                      <div>
                        <label htmlFor="whatsapp" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          id="whatsapp"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="(48) 99999-9999"
                        />
                      </div>

                      <div>
                        <label htmlFor="instagram" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Instagram
                        </label>
                        <input
                          type="text"
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="@seuinstagram"
                        />
                      </div>
                    </div>

                    {/* Foto */}
                    <div className="mt-8">
                      <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Foto Profissional
                      </label>
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        {formData.fotoPreview ? (
                          <div className="relative group">
                            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 shadow-lg">
                              <Image
                                src={formData.fotoPreview}
                                alt="Preview"
                                width={200}
                                height={200}
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600 shadow-lg"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="mt-2 text-sm text-slate-500">Sem foto</p>
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="foto"
                          />
                          <label
                            htmlFor="foto"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50 shadow-sm"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formData.fotoPreview ? 'Alterar Foto' : 'Selecionar Foto'}
                          </label>
                          <p className="mt-3 text-xs text-slate-500">Máximo 5MB. Formatos: JPG, PNG, WEBP</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Endereço */}
                  <motion.div {...fadeInUp}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                      <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Endereço
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="cep" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          CEP
                        </label>
                        <input
                          type="text"
                          id="cep"
                          name="cep"
                          value={formData.cep}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="00000-000"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="endereco" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Endereço Completo
                        </label>
                        <input
                          type="text"
                          id="endereco"
                          name="endereco"
                          value={formData.endereco}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Rua, número, complemento"
                        />
                      </div>

                      <div>
                        <label htmlFor="cidade" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Cidade
                        </label>
                        <input
                          type="text"
                          id="cidade"
                          name="cidade"
                          value={formData.cidade}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Sua cidade"
                        />
                      </div>

                      <div>
                        <label htmlFor="estado" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Estado
                        </label>
                        <select
                          id="estado"
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                        >
                          <option value="">Selecione</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  {/* Dados Bancários */}
                  <motion.div {...fadeInUp}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                      <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Dados Bancários
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="bancoNome" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Nome do Banco
                        </label>
                        <input
                          type="text"
                          id="bancoNome"
                          name="bancoNome"
                          value={formData.bancoNome}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Ex: Banco do Brasil"
                        />
                      </div>

                      <div>
                        <label htmlFor="bancoAgencia" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Agência
                        </label>
                        <input
                          type="text"
                          id="bancoAgencia"
                          name="bancoAgencia"
                          value={formData.bancoAgencia}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="0000"
                        />
                      </div>

                      <div>
                        <label htmlFor="bancoConta" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Conta
                        </label>
                        <input
                          type="text"
                          id="bancoConta"
                          name="bancoConta"
                          value={formData.bancoConta}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="00000-0"
                        />
                      </div>

                      <div>
                        <label htmlFor="bancoTipoConta" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Tipo de Conta
                        </label>
                        <select
                          id="bancoTipoConta"
                          name="bancoTipoConta"
                          value={formData.bancoTipoConta}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                        >
                          <option value="">Selecione</option>
                          <option value="Corrente">Corrente</option>
                          <option value="Poupança">Poupança</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="bancoPix" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Chave PIX
                        </label>
                        <input
                          type="text"
                          id="bancoPix"
                          name="bancoPix"
                          value={formData.bancoPix}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="CPF, e-mail, telefone ou chave aleatória"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Informações Adicionais */}
                  <motion.div {...fadeInUp}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                      <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Informações Adicionais
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="areaAtuacao" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Área de Atuação
                        </label>
                        <input
                          type="text"
                          id="areaAtuacao"
                          name="areaAtuacao"
                          value={formData.areaAtuacao}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Ex: Florianópolis e região metropolitana"
                        />
                      </div>

                      <div>
                        <label htmlFor="observacoes" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Observações
                        </label>
                        <textarea
                          id="observacoes"
                          name="observacoes"
                          rows={4}
                          value={formData.observacoes}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Informações adicionais sobre sua experiência ou especialidades..."
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-2xl bg-red-50 border-2 border-red-200 p-6 text-red-700"
                    >
                      <p className="font-semibold mb-1">Erro:</p>
                      <p>{errorMessage}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    className="flex flex-col gap-4 sm:flex-row sm:justify-between pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/"
                      className="rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50 text-center shadow-sm"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
                    </button>
                  </motion.div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 py-12 text-white">
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
                <br />
                Contato: +55 47 9211-2284
              </p>
            </div>
            <div className="flex flex-col gap-4 text-center md:text-right">
              <Link
                href="/"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition hover:bg-white/20"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
