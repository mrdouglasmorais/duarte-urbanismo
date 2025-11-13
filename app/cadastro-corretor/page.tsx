'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, ChangeEvent } from 'react';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';

interface FormData {
  nome: string;
  creci: string;
  email: string;
  senha: string;
  confirmarSenha: string;
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
  aceiteTermos: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export default function CadastroCorretorPage() {
  const { signUpEmail } = useFirebaseAuth();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    creci: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    whatsapp: '',
    instagram: '',
    foto: null,
    fotoPreview: null,
    endereco: '',
    cep: '',
    cidade: '',
    estado: 'SC',
    bancoNome: '',
    bancoAgencia: '',
    bancoConta: '',
    bancoTipoConta: '',
    bancoPix: '',
    areaAtuacao: '',
    observacoes: '',
    aceiteTermos: false
  });
  const [showTermoModal, setShowTermoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

    // Validações de senha
    if (!formData.senha || formData.senha.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErrorMessage('As senhas não coincidem');
      setIsSubmitting(false);
      return;
    }

    // Validação de aceite de termos
    if (!formData.aceiteTermos) {
      setErrorMessage('Você deve aceitar os termos e condições para continuar');
      setIsSubmitting(false);
      return;
    }

    try {
      // Primeiro, criar usuário no Firebase Authentication
      const userCredential = await signUpEmail(
        formData.email,
        formData.senha,
        formData.nome,
        formData.telefone
      );

      // Obter token para autenticação e salvar no cookie
      const token = await userCredential.user.getIdToken();
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      // Depois, salvar dados adicionais do corretor
      const formDataToSend = new FormData();
      formDataToSend.append('userId', userCredential.user.uid);
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
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
        senha: '',
        confirmarSenha: '',
        telefone: '',
        whatsapp: '',
        instagram: '',
        foto: null,
        fotoPreview: null,
        endereco: '',
        cep: '',
        cidade: '',
        estado: 'SC',
        bancoNome: '',
        bancoAgencia: '',
        bancoConta: '',
        bancoTipoConta: '',
        bancoPix: '',
        areaAtuacao: '',
        observacoes: '',
        aceiteTermos: false
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
                        <label htmlFor="senha" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Senha *
                        </label>
                        <input
                          type="password"
                          id="senha"
                          name="senha"
                          required
                          value={formData.senha}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                          placeholder="Mínimo 6 caracteres"
                          minLength={6}
                        />
                        <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres</p>
                      </div>

                      <div>
                        <label htmlFor="confirmarSenha" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Confirmar Senha *
                        </label>
                        <input
                          type="password"
                          id="confirmarSenha"
                          name="confirmarSenha"
                          required
                          value={formData.confirmarSenha}
                          onChange={handleInputChange}
                          className={`w-full rounded-2xl border px-5 py-3.5 text-slate-900 transition focus:outline-none focus:ring-2 shadow-sm ${
                            formData.confirmarSenha && formData.senha !== formData.confirmarSenha
                              ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-slate-200/70 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20'
                          }`}
                          placeholder="Digite a senha novamente"
                          minLength={6}
                        />
                        {formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
                          <p className="mt-1 text-xs text-red-600">As senhas não coincidem</p>
                        )}
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
                          Cidade *
                        </label>
                        <select
                          id="cidade"
                          name="cidade"
                          required
                          value={formData.cidade}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                        >
                          <option value="">Selecione sua cidade</option>
                          <option value="São João Batista">São João Batista</option>
                          <option value="Florianópolis">Florianópolis</option>
                          <option value="Palhoça">Palhoça</option>
                          <option value="São José">São José</option>
                          <option value="Biguaçu">Biguaçu</option>
                          <option value="Governador Celso Ramos">Governador Celso Ramos</option>
                          <option value="Tijucas">Tijucas</option>
                          <option value="Itapema">Itapema</option>
                          <option value="Balneário Camboriú">Balneário Camboriú</option>
                          <option value="Camboriú">Camboriú</option>
                          <option value="Bombinhas">Bombinhas</option>
                          <option value="Porto Belo">Porto Belo</option>
                          <option value="Navegantes">Navegantes</option>
                          <option value="Itajaí">Itajaí</option>
                          <option value="Barra Velha">Barra Velha</option>
                          <option value="Penha">Penha</option>
                          <option value="Piçarras">Piçarras</option>
                          <option value="Balneário Piçarras">Balneário Piçarras</option>
                          <option value="São Francisco do Sul">São Francisco do Sul</option>
                          <option value="Joinville">Joinville</option>
                          <option value="Garopaba">Garopaba</option>
                          <option value="Imbituba">Imbituba</option>
                          <option value="Laguna">Laguna</option>
                          <option value="Tubarão">Tubarão</option>
                          <option value="Imaruí">Imaruí</option>
                          <option value="Paulo Lopes">Paulo Lopes</option>
                          <option value="Anitápolis">Anitápolis</option>
                          <option value="Armazém">Armazém</option>
                          <option value="Braço do Norte">Braço do Norte</option>
                          <option value="Criciúma">Criciúma</option>
                          <option value="Içara">Içara</option>
                          <option value="Jaguaruna">Jaguaruna</option>
                          <option value="Orleans">Orleans</option>
                          <option value="Sangão">Sangão</option>
                          <option value="Siderópolis">Siderópolis</option>
                          <option value="Treze de Maio">Treze de Maio</option>
                          <option value="Urussanga">Urussanga</option>
                        </select>
                        <p className="mt-1 text-xs text-slate-500">Região litorânea de Santa Catarina</p>
                      </div>

                      <div>
                        <label htmlFor="estado" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                          Estado
                        </label>
                        <input
                          type="text"
                          id="estado"
                          name="estado"
                          value="Santa Catarina"
                          readOnly
                          className="w-full rounded-2xl border border-slate-200/70 bg-slate-100/50 px-5 py-3.5 text-slate-600 cursor-not-allowed shadow-sm"
                        />
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

                  {/* Termo de Aceite */}
                  <motion.div {...fadeInUp}>
                    <div className="rounded-2xl border-2 border-slate-200/70 bg-slate-50/50 p-6">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          id="aceiteTermos"
                          name="aceiteTermos"
                          checked={formData.aceiteTermos}
                          onChange={handleInputChange}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                          required
                        />
                        <label htmlFor="aceiteTermos" className="flex-1 text-sm text-slate-700 leading-relaxed">
                          <span className="font-semibold">Declaro que li e aceito os </span>
                          <button
                            type="button"
                            onClick={() => setShowTermoModal(true)}
                            className="font-semibold text-emerald-600 underline hover:text-emerald-700 transition"
                          >
                            Termos e Condições de Parceria
                          </button>
                          <span className="font-semibold"> e o </span>
                          <button
                            type="button"
                            onClick={() => setShowTermoModal(true)}
                            className="font-semibold text-emerald-600 underline hover:text-emerald-700 transition"
                          >
                            Contrato de Corretor Parceiro
                          </button>
                          <span className="font-semibold"> da Duarte Urbanismo LTDA.</span>
                          <span className="block mt-2 text-xs text-slate-500">
                            Ao marcar esta opção, você confirma que leu, compreendeu e concorda com todas as cláusulas do contrato de parceria.
                          </span>
                        </label>
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
                      disabled={isSubmitting || !formData.aceiteTermos}
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

      {/* Modal do Termo */}
      {showTermoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowTermoModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[40px] bg-white p-8 shadow-2xl md:p-12"
          >
            <button
              onClick={() => setShowTermoModal(false)}
              className="absolute right-6 top-6 rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="prose prose-slate max-w-none">
              <h1 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Termo de Aceite e Contrato de Corretor Parceiro
              </h1>

              <div className="space-y-6 text-slate-700">
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">1. PARTES CONTRATANTES</h2>
                  <p>
                    <strong>CONTRATADA:</strong> DUARTE URBANISMO LTDA, inscrita no CNPJ sob o nº 47.200.760/0001-06,
                    com sede na Rua José Antonio da Silva, 152 · Sala 03, Escritório 81, Centro,
                    São João Batista/SC, CEP 88.240-000.
                  </p>
                  <p className="mt-2">
                    <strong>CONTRATANTE:</strong> O corretor de imóveis que preenche este cadastro,
                    devidamente registrado no CRECI (Conselho Regional de Corretores de Imóveis).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">2. OBJETO DO CONTRATO</h2>
                  <p>
                    O presente contrato tem por objeto estabelecer as condições de parceria entre a CONTRATADA
                    e o CONTRATANTE para a comercialização de empreendimentos imobiliários desenvolvidos pela CONTRATADA,
                    mediante a intermediação de negócios imobiliários.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">3. OBRIGAÇÕES DO CONTRATANTE (CORRETOR)</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Manter-se devidamente registrado no CRECI e em situação regular perante o Conselho;</li>
                    <li>Apresentar clientes interessados nos empreendimentos da CONTRATADA;</li>
                    <li>Fornecer informações corretas e atualizadas sobre os empreendimentos;</li>
                    <li>Zelar pela imagem e reputação da CONTRATADA;</li>
                    <li>Manter sigilo sobre informações confidenciais da CONTRATADA;</li>
                    <li>Atuar de forma ética e profissional em todas as negociações;</li>
                    <li>Informar imediatamente a CONTRATADA sobre qualquer irregularidade ou problema identificado;</li>
                    <li>Fornecer dados bancários corretos para recebimento de comissões;</li>
                    <li>Manter atualizados seus dados cadastrais junto à CONTRATADA.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">4. OBRIGAÇÕES DA CONTRATADA</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Fornecer materiais de marketing e informações técnicas sobre os empreendimentos;</li>
                    <li>Realizar o pagamento das comissões devidas, conforme acordado;</li>
                    <li>Manter o CONTRATANTE informado sobre atualizações dos empreendimentos;</li>
                    <li>Respeitar os prazos estabelecidos para pagamento de comissões;</li>
                    <li>Fornecer suporte necessário para a comercialização dos empreendimentos.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">5. COMISSÕES</h2>
                  <p>
                    As comissões serão calculadas e pagas conforme critérios estabelecidos pela CONTRATADA,
                    que serão comunicados ao CONTRATANTE por ocasião da aprovação de seu cadastro e poderão
                    ser atualizados mediante comunicação prévia.
                  </p>
                  <p className="mt-2">
                    <strong>Observação:</strong> Os percentuais e condições específicas de comissão serão
                    definidos e comunicados individualmente após a aprovação do cadastro e análise do perfil
                    do corretor parceiro.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>O pagamento das comissões será realizado mediante crédito na conta bancária informada no cadastro;</li>
                    <li>As comissões serão pagas após a efetivação da venda e cumprimento de todas as condições contratuais;</li>
                    <li>A CONTRATADA se reserva o direito de reter comissões em caso de descumprimento contratual;</li>
                    <li>O CONTRATANTE será responsável pelo pagamento de todos os impostos incidentes sobre as comissões recebidas.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">6. APROVAÇÃO DO CADASTRO</h2>
                  <p>
                    O cadastro do CONTRATANTE está sujeito à aprovação da CONTRATADA. A CONTRATADA se reserva
                    o direito de aprovar ou reprovar cadastros conforme critérios próprios, não sendo obrigada
                    a justificar a decisão.
                  </p>
                  <p className="mt-2">
                    Apenas após a aprovação do cadastro e comunicação ao CONTRATANTE, o presente contrato
                    entrará em vigor.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">7. VIGÊNCIA E RESCISÃO</h2>
                  <p>
                    Este contrato terá vigência indeterminada, podendo ser rescindido por qualquer das partes,
                    mediante comunicação prévia de 30 (trinta) dias.
                  </p>
                  <p className="mt-2">
                    A CONTRATADA poderá rescindir imediatamente o contrato em caso de descumprimento das
                    obrigações pelo CONTRATANTE ou por atos que comprometam a imagem da CONTRATADA.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">8. CONFIDENCIALIDADE</h2>
                  <p>
                    O CONTRATANTE compromete-se a manter absoluto sigilo sobre todas as informações confidenciais
                    da CONTRATADA, incluindo estratégias comerciais, dados de clientes, condições de negociação
                    e demais informações de natureza sigilosa.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">9. PROPRIEDADE INTELECTUAL</h2>
                  <p>
                    Todos os materiais de marketing, marcas, logotipos e demais elementos de propriedade intelectual
                    da CONTRATADA são de uso exclusivo para fins de comercialização dos empreendimentos e não podem
                    ser utilizados para outros fins sem autorização prévia.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">10. DADOS PESSOAIS</h2>
                  <p>
                    A CONTRATADA compromete-se a tratar os dados pessoais do CONTRATANTE em conformidade com a
                    Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), utilizando-os exclusivamente
                    para fins de execução deste contrato e comunicação relacionada à parceria.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">11. FORO</h2>
                  <p>
                    Fica eleito o foro da comarca de São João Batista/SC para dirimir quaisquer controvérsias
                    decorrentes deste contrato.
                  </p>
                </section>

                <section className="border-t-2 border-slate-200 pt-6">
                  <p className="text-sm text-slate-600 italic">
                    Ao marcar a opção de aceite, o CONTRATANTE declara que leu, compreendeu e concorda com
                    todas as cláusulas deste contrato, comprometendo-se a cumpri-las integralmente.
                  </p>
                  <p className="text-sm text-slate-600 italic mt-2">
                    São João Batista/SC, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
                  </p>
                </section>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setShowTermoModal(false)}
                className="rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
