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
      const formDataToSend = new FormData();
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

      const response = await fetch('/api/corretores/cadastro', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar corretor');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
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

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-12"
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-slate-900 md:text-5xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Cadastro de Corretor
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Preencha o formulário abaixo para se cadastrar como corretor parceiro
            </p>
          </div>

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
              <h2 className="text-2xl font-bold text-emerald-900">Cadastro Enviado com Sucesso!</h2>
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Dados Pessoais</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="creci" className="mb-2 block text-sm font-semibold text-slate-700">
                      CRECI *
                    </label>
                    <input
                      type="text"
                      id="creci"
                      name="creci"
                      required
                      value={formData.creci}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Ex: 123456-SC"
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
                    <label htmlFor="whatsapp" className="mb-2 block text-sm font-semibold text-slate-700">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="(48) 99999-9999"
                    />
                  </div>

                  <div>
                    <label htmlFor="instagram" className="mb-2 block text-sm font-semibold text-slate-700">
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="@seuinstagram"
                    />
                  </div>
                </div>

                {/* Foto */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Foto Profissional</label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {formData.fotoPreview ? (
                      <div className="relative">
                        <Image
                          src={formData.fotoPreview}
                          alt="Preview"
                          width={200}
                          height={200}
                          className="rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
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
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formData.fotoPreview ? 'Alterar Foto' : 'Selecionar Foto'}
                      </label>
                      <p className="mt-2 text-xs text-slate-500">Máximo 5MB. Formatos: JPG, PNG</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Endereço</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="cep" className="mb-2 block text-sm font-semibold text-slate-700">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="endereco" className="mb-2 block text-sm font-semibold text-slate-700">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div>
                    <label htmlFor="cidade" className="mb-2 block text-sm font-semibold text-slate-700">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className="mb-2 block text-sm font-semibold text-slate-700">
                      Estado
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              </div>

              {/* Dados Bancários */}
              <div>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Dados Bancários</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="bancoNome" className="mb-2 block text-sm font-semibold text-slate-700">
                      Nome do Banco
                    </label>
                    <input
                      type="text"
                      id="bancoNome"
                      name="bancoNome"
                      value={formData.bancoNome}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>

                  <div>
                    <label htmlFor="bancoAgencia" className="mb-2 block text-sm font-semibold text-slate-700">
                      Agência
                    </label>
                    <input
                      type="text"
                      id="bancoAgencia"
                      name="bancoAgencia"
                      value={formData.bancoAgencia}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="bancoConta" className="mb-2 block text-sm font-semibold text-slate-700">
                      Conta
                    </label>
                    <input
                      type="text"
                      id="bancoConta"
                      name="bancoConta"
                      value={formData.bancoConta}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="00000-0"
                    />
                  </div>

                  <div>
                    <label htmlFor="bancoTipoConta" className="mb-2 block text-sm font-semibold text-slate-700">
                      Tipo de Conta
                    </label>
                    <select
                      id="bancoTipoConta"
                      name="bancoTipoConta"
                      value={formData.bancoTipoConta}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Selecione</option>
                      <option value="Corrente">Corrente</option>
                      <option value="Poupança">Poupança</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bancoPix" className="mb-2 block text-sm font-semibold text-slate-700">
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      id="bancoPix"
                      name="bancoPix"
                      value={formData.bancoPix}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                    />
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Informações Adicionais</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="areaAtuacao" className="mb-2 block text-sm font-semibold text-slate-700">
                      Área de Atuação
                    </label>
                    <input
                      type="text"
                      id="areaAtuacao"
                      name="areaAtuacao"
                      value={formData.areaAtuacao}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Ex: Florianópolis e região metropolitana"
                    />
                  </div>

                  <div>
                    <label htmlFor="observacoes" className="mb-2 block text-sm font-semibold text-slate-700">
                      Observações
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      rows={4}
                      value={formData.observacoes}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Informações adicionais sobre sua experiência ou especialidades..."
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="rounded-xl bg-red-50 p-4 text-red-700">
                  <p className="font-semibold">Erro:</p>
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Link
                  href="/"
                  className="rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50 text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-600">
          <p>© 2024 Duarte Urbanismo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

