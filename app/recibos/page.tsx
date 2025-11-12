'use client';

import Logo from '@/components/Logo';
import ReciboPreview from '@/components/ReciboPreview';
import { EMISSOR_CNPJ, EMISSOR_NOME, EMPRESA_CEP, EMPRESA_EMAIL, EMPRESA_ENDERECO, EMPRESA_TELEFONE } from '@/lib/constants';
import { numeroParaExtenso } from '@/lib/utils';
import { validarCampoTexto, validarCEP, validarCPFouCNPJ, validarData, validarEmail, validarTelefone, validarValor } from '@/lib/validators';
import { ReciboData, ReciboQrCodePayload } from '@/types/recibo';
import { useState } from 'react';

const heroHighlights = [
  { label: 'Área (m²)', value: '9.560' },
  { label: 'Dormitórios', value: '4' },
  { label: 'Banheiros', value: '2' }
];

const metodologiaCards = [
  {
    tag: 'Etapa 01',
    title: 'Briefing guiado',
    description: 'Coleta assistida dos dados do pagador, contrato e valores com máscaras inteligentes para CPF/CNPJ e datas.'
  },
  {
    tag: 'Etapa 02',
    title: 'Assinatura e QR Code',
    description: 'Geração automática do hash com segredo SHA-256, criação do QR Code e link público de verificação.'
  },
  {
    tag: 'Etapa 03',
    title: 'Entrega premium',
    description: 'PDF com layout boutique, linha de assinatura corporativa e registro permanente no MongoDB da Duarte.'
  }
];

const segurancaHighlights = [
  {
    title: 'Assinatura SHA-256 + segredo',
    description: 'Cada recibo recebe um hash único calculado no servidor com segredo privado, impedindo adulterações.'
  },
  {
    title: 'Consulta pública com QR Code',
    description: 'O QR direciona para a API /api/recibos/[numero], que valida hash, data e status diretamente no banco.'
  },
  {
    title: 'Registro imutável',
    description: 'Os recebimentos ficam versionados no MongoDB da Duarte, com histórico de criação e atualização.'
  }
];

const faqs = [
  {
    question: 'Como garanto que o recibo não seja editado?',
    answer: 'Os dados críticos são revalidados e normalizados no backend antes de assinar e salvar, e o hash impede alterações posteriores.'
  },
  {
    question: 'Posso confirmar um recibo recebido em PDF?',
    answer: 'Sim. Basta ler o QR Code ou acessar o endpoint público de verificação com o número informado no documento.'
  },
  {
    question: 'O formulário aceita multicanais?',
    answer: 'O formulário contempla PIX, TED, cartões e combinações customizadas. Novas opções podem ser incluídas rapidamente.'
  },
  {
    question: 'E se eu perder o PDF?',
    answer: 'É possível regenerar com o mesmo número. A plataforma mantém o histórico e reapresenta o documento com a mesma assinatura.'
  }
];

interface FormErrors {
  [key: string]: string;
}

export default function Home() {
  const [formData, setFormData] = useState<ReciboData>({
    numero: `REC-${Date.now().toString().slice(-6)}`,
    valor: 0,
    valorExtenso: '',
    recebidoDe: '',
    cpfCnpj: '',
    referente: '',
    data: new Date().toISOString().split('T')[0],
    formaPagamento: 'PIX',
    emitidoPor: EMISSOR_NOME,
    cpfEmitente: EMISSOR_CNPJ,
    cepEmitente: EMPRESA_CEP,
    enderecoEmitente: EMPRESA_ENDERECO,
    telefoneEmitente: EMPRESA_TELEFONE,
    emailEmitente: EMPRESA_EMAIL
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [valorDisplay, setValorDisplay] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<string | null>(null);

  const formatarValorBRL = (valor: string): string => {
    // Remove tudo que não é dígito
    const numeros = valor.replace(/\D/g, '');

    if (!numeros) return '';

    // Converte para centavos e depois para reais
    const valorEmCentavos = parseInt(numeros);
    const valorEmReais = valorEmCentavos / 100;

    // Formata como moeda brasileira
    return valorEmReais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const converterParaNumero = (valorFormatado: string): number => {
    if (!valorFormatado) return 0;

    // Remove pontos de milhar e substitui vírgula por ponto
    const numero = valorFormatado.replace(/\./g, '').replace(',', '.');
    return parseFloat(numero) || 0;
  };

  const maskCep = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) {
      return digits;
    }
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCep(event.target.value);
    setFormData(prev => ({
      ...prev,
      cepEmitente: masked
    }));
    setCepStatus(null);
    setErrors(prev => {
      if (!prev.cepEmitente) return prev;
      const newErrors = { ...prev };
      delete newErrors.cepEmitente;
      return newErrors;
    });
  };

  const consultarCep = async (masked: string, digits: string) => {
    try {
      setIsCepLoading(true);
      setCepStatus('Consultando CEP...');
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) {
        throw new Error('Falha na consulta do CEP.');
      }
      const data = await response.json();

      if (data.erro) {
        setErrors(prev => ({ ...prev, cepEmitente: 'CEP não encontrado.' }));
        setCepStatus('CEP não encontrado.');
        return;
      }

      const parts = [data.logradouro, data.bairro, `${data.localidade} - ${data.uf}`].filter(Boolean);
      const formattedAddress = parts.join(', ');

      setFormData(prev => ({
        ...prev,
        cepEmitente: masked,
        enderecoEmitente: formattedAddress || prev.enderecoEmitente
      }));

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cepEmitente;
        if (formattedAddress) {
          delete newErrors.enderecoEmitente;
        }
        return newErrors;
      });

      setCepStatus(formattedAddress ? 'Endereço preenchido automaticamente via ViaCEP.' : 'CEP válido.');
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      setErrors(prev => ({ ...prev, cepEmitente: 'Não foi possível consultar o CEP no momento.' }));
      setCepStatus('Não foi possível consultar o CEP no momento.');
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleCepBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const masked = maskCep(event.target.value);
    const digits = masked.replace(/\D/g, '');

    setFormData(prev => ({
      ...prev,
      cepEmitente: masked
    }));

    const validationMessage = validateField('cepEmitente', masked);
    if (validationMessage) {
      setErrors(prev => ({ ...prev, cepEmitente: validationMessage }));
      setCepStatus(null);
      return;
    }

    if (digits.length !== 8) {
      setCepStatus('Informe os 8 dígitos do CEP para consultar.');
      return;
    }

    await consultarCep(masked, digits);
  };

  const handleCepLookupClick = async () => {
    const masked = maskCep(formData.cepEmitente);
    const digits = masked.replace(/\D/g, '');

    setFormData(prev => ({
      ...prev,
      cepEmitente: masked
    }));

    const validationMessage = validateField('cepEmitente', masked);
    if (validationMessage) {
      setErrors(prev => ({ ...prev, cepEmitente: validationMessage }));
      setCepStatus(null);
      return;
    }

    if (digits.length !== 8) {
      setErrors(prev => ({ ...prev, cepEmitente: 'CEP deve ter 8 dígitos' }));
      setCepStatus('Informe os 8 dígitos do CEP para consultar.');
      return;
    }

    await consultarCep(masked, digits);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Formata o valor
    const valorFormatado = formatarValorBRL(input);
    setValorDisplay(valorFormatado);

    // Converte para número e salva no formData
    const valorNumerico = converterParaNumero(valorFormatado);
    setFormData(prev => ({
      ...prev,
      valor: valorNumerico,
      valorExtenso: numeroParaExtenso(valorNumerico)
    }));

    // Limpar erro
    if (errors.valor) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.valor;
        return newErrors;
      });
    }
  };

  const validateField = (name: keyof ReciboData, value: string | number): string | undefined => {
    switch (name) {
      case 'valor':
        const valorNumerico = typeof value === 'number' ? value : parseFloat(value);
        const resultValor = validarValor(Number.isNaN(valorNumerico) ? 0 : valorNumerico);
        return resultValor.mensagem;

      case 'cpfCnpj':
        const resultCpfCnpj = validarCPFouCNPJ(String(value));
        return resultCpfCnpj.mensagem;

      case 'cpfEmitente':
        const resultCpfEmitente = validarCPFouCNPJ(String(value));
        return resultCpfEmitente.mensagem;

      case 'emailEmitente':
        const resultEmail = validarEmail(String(value));
        return resultEmail.mensagem;

      case 'telefoneEmitente':
        const resultTelefone = validarTelefone(String(value));
        return resultTelefone.mensagem;

      case 'data':
        const resultData = validarData(String(value));
        return resultData.mensagem;

      case 'recebidoDe':
        const resultRecebido = validarCampoTexto(String(value), 'Nome/Razão Social');
        return resultRecebido.mensagem;

      case 'referente':
        const resultReferente = validarCampoTexto(String(value), 'Referente a', 10);
        return resultReferente.mensagem;

      case 'emitidoPor':
        const resultEmitente = validarCampoTexto(String(value), 'Nome do emitente');
        return resultEmitente.mensagem;

      case 'cepEmitente':
        const resultCep = validarCEP(String(value));
        return resultCep.mensagem;

      case 'enderecoEmitente':
        const resultEndereco = validarCampoTexto(String(value), 'Endereço', 10);
        return resultEndereco.mensagem;

      default:
        return undefined;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cepEmitente') {
      handleCepChange(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    if (name === 'emitidoPor' || name === 'cpfEmitente') {
      return;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Atualizar valor por extenso automaticamente
      if (name === 'valor') {
        const numValue = parseFloat(value) || 0;
        updated.valorExtenso = numeroParaExtenso(numValue);
      }

      return updated;
    });

    // Limpar erro do campo quando usuário digita
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof ReciboData, value || '');
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const fieldsToValidate: Array<keyof ReciboData> = [
      'valor',
      'recebidoDe',
      'cpfCnpj',
      'referente',
      'data',
      'emitidoPor',
      'cpfEmitente',
      'cepEmitente',
      'enderecoEmitente',
      'telefoneEmitente',
      'emailEmitente'
    ];

    fieldsToValidate.forEach(field => {
      const value = formData[field] ?? '';
      const error = validateField(field, value as string | number);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = async () => {
    if (!validateForm()) {
      alert('Por favor, corrija os erros no formulário antes de visualizar.');
      return;
    }

    setIsPreviewLoading(true);

    try {
      const response = await fetch('/api/recibos/assinatura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Não foi possível gerar o QR Code.');
      }

      const { qrPayload } = (await response.json()) as { qrPayload: ReciboQrCodePayload };
      setQrCodeData(JSON.stringify(qrPayload));
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      alert('Erro ao gerar QR Code de verificação. Tente novamente.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!validateForm()) {
      alert('Por favor, corrija os erros no formulário antes de gerar o PDF.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-${formData.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const backgroundStyle = {
    backgroundImage:
      'linear-gradient(140deg, rgba(10, 14, 29, 0.92) 0%, rgba(16, 29, 61, 0.88) 45%, rgba(26, 44, 80, 0.82) 70%, rgba(38, 50, 72, 0.78) 100%), url("/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg")',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed'
  } as const;

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <header className="bg-black/85 text-white text-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="font-semibold tracking-[0.22em] uppercase text-white/70">Canal premium</span>
              <span className="text-white/50">|</span>
              <span className="text-white/70">Experiência Duarte Urbanismo</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-white/70">
            <span>+55 (11) 3200-7645</span>
            <span className="hidden sm:inline">•</span>
            <span>contato@duarteurbanismo.com</span>
            <span className="hidden sm:inline">•</span>
            <span>Moema, São Paulo</span>
          </div>
        </div>
      </header>

      <nav className="bg-white/92 backdrop-blur-md border-b border-slate-200/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-4">
            <Logo />
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-slate-500">Duarte Urbanismo</p>
              <h1 className="text-2xl font-semibold text-slate-900">Hub de Recibos Oficiais</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a className="text-slate-900" href="#formulario">Início</a>
            <a className="hover:text-slate-900" href="#metodologia">Método</a>
            <a className="hover:text-slate-900" href="#seguranca">Segurança</a>
            <a className="hover:text-slate-900" href="#faq">FAQ</a>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">
              Ver Demo
            </button>
            <button className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)]">
              Agendar Onboarding
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="bg-gradient-to-b from-white/10 via-white/8 to-transparent">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
            <div className="glass-panel relative overflow-hidden rounded-[var(--radius-xl)] px-8 py-12 text-white shadow-[var(--shadow-elevated)]">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/92 via-slate-900/80 to-slate-700/60" />
              <div className="relative flex flex-col gap-6 text-left sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                    Emissão premium
                  </span>
                  <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
                    Recibos autenticados para empreendimentos de alto padrão
                  </h2>
                  <p className="mt-4 text-base text-white/80">
                    Centralize a geração de recibos da Duarte Urbanismo com assinatura criptografada, QR Code de comprovação
                    e consulta instantânea. A experiência visual segue o padrão boutique dos nossos empreendimentos.
                  </p>
                </div>
                <div className="flex flex-col gap-4 text-right">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-left shadow-lg">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">Status Duarte</p>
                    <p className="mt-2 text-3xl font-semibold text-white">Ativo</p>
                    <p className="mt-1 text-sm text-white/70">Validação em MongoDB + QR Ledger</p>
                  </div>
                  <button className="self-end rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-lg hover:bg-[var(--color-primary-dark)]">
                    Iniciar Emissão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="formulario" className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white/30 via-white/18 to-transparent blur-3xl" />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              {/* Formulário */}
              <div className="glass-panel rounded-3xl p-10">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center justify-between">
                  Dados do Recibo
                  <span className="section-label">Formulário</span>
                </h2>

                <form className="space-y-4">
                  {/* Número e Data */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número do Recibo *
                      </label>
                      <input
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-600 text-slate-900 bg-white/60"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        name="data"
                        value={formData.data}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 bg-white/60 ${errors.data ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                          }`}
                        required
                      />
                      {errors.data && (
                        <p className="text-xs text-red-600 mt-1">{errors.data}</p>
                      )}
                    </div>
                  </div>

                  {/* Valor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <input
                        type="text"
                        name="valor"
                        value={valorDisplay}
                        onChange={handleValorChange}
                        onBlur={handleBlur}
                        placeholder="0,00"
                        className={`w-full pl-14 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 placeholder:text-slate-400 bg-white/60 ${errors.valor ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                          }`}
                        required
                      />
                    </div>
                    {errors.valor && (
                      <p className="text-xs text-red-600 mt-1">{errors.valor}</p>
                    )}
                    {formData.valorExtenso && !errors.valor && formData.valor > 0 && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        {formData.valorExtenso}
                      </p>
                    )}
                  </div>

                  {/* Recebido De */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recebido De (Nome/Razão Social) *
                    </label>
                    <input
                      type="text"
                      name="recebidoDe"
                      value={formData.recebidoDe}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 bg-white/60 ${errors.recebidoDe ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                        }`}
                      required
                    />
                    {errors.recebidoDe && (
                      <p className="text-xs text-red-600 mt-1">{errors.recebidoDe}</p>
                    )}
                  </div>

                  {/* CPF/CNPJ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF/CNPJ *
                    </label>
                    <input
                      type="text"
                      name="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 placeholder:text-slate-400 bg-white/60 ${errors.cpfCnpj ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                        }`}
                      required
                    />
                    {errors.cpfCnpj && (
                      <p className="text-xs text-red-600 mt-1">{errors.cpfCnpj}</p>
                    )}
                  </div>

                  {/* Referente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referente A *
                    </label>
                    <textarea
                      name="referente"
                      value={formData.referente}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 placeholder:text-slate-400 bg-white/60 ${errors.referente ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                        }`}
                      placeholder="Descrição do serviço ou produto..."
                      required
                    />
                    {errors.referente && (
                      <p className="text-xs text-red-600 mt-1">{errors.referente}</p>
                    )}
                  </div>

                  {/* Forma de Pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de Pagamento *
                    </label>
                    <select
                      name="formaPagamento"
                      value={formData.formaPagamento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-600 text-slate-900 bg-white/60"
                      required
                    >
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Depósito Bancário">Depósito Bancário</option>
                      <option value="Transferência Bancária">Transferência Bancária</option>
                      <option value="TED">TED</option>
                      <option value="DOC">DOC</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Boleto Bancário">Boleto Bancário</option>
                      <option value="Dinheiro e PIX">Dinheiro e PIX</option>
                      <option value="Parcelado">Parcelado</option>
                      <option value="Permuta">Permuta</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  {/* Dados do Emitente */}
                  <div className="pt-6 border-t border-slate-200/70">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Dados do Emitente</h3>
                      <span className="section-label">Corporativo</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Corporativo
                        </label>
                        <input
                          type="text"
                          name="emitidoPor"
                          value={formData.emitidoPor}
                          readOnly
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Emissor fixo padronizado para toda emissão oficial.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          name="cpfEmitente"
                          value={formData.cpfEmitente}
                          readOnly
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CEP *
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input
                            type="text"
                            name="cepEmitente"
                            value={formData.cepEmitente}
                            onChange={handleCepChange}
                            onBlur={handleCepBlur}
                            placeholder="00000-000"
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 bg-white/60 ${errors.cepEmitente ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                              }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={handleCepLookupClick}
                            disabled={isCepLoading}
                            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                          >
                            {isCepLoading ? 'Consultando...' : 'Buscar CEP'}
                          </button>
                        </div>
                        {errors.cepEmitente && (
                          <p className="text-xs text-red-600 mt-1">{errors.cepEmitente}</p>
                        )}
                        {!errors.cepEmitente && cepStatus && (
                          <p
                            className={`text-xs mt-1 ${cepStatus.toLowerCase().includes('não') || cepStatus.toLowerCase().includes('informe')
                              ? 'text-amber-600'
                              : cepStatus.toLowerCase().includes('consultando')
                                ? 'text-slate-500'
                                : 'text-emerald-600'
                              }`}
                          >
                            {cepStatus}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Endereço *
                        </label>
                        <input
                          type="text"
                          name="enderecoEmitente"
                          value={formData.enderecoEmitente}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 bg-white/60 ${errors.enderecoEmitente ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                            }`}
                          required
                        />
                        {errors.enderecoEmitente && (
                          <p className="text-xs text-red-600 mt-1">{errors.enderecoEmitente}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone *
                          </label>
                          <input
                            type="tel"
                            name="telefoneEmitente"
                            value={formData.telefoneEmitente}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="(00) 00000-0000"
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 placeholder:text-slate-400 bg-white/60 ${errors.telefoneEmitente ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                              }`}
                            required
                          />
                          {errors.telefoneEmitente && (
                            <p className="text-xs text-red-600 mt-1">{errors.telefoneEmitente}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="emailEmitente"
                            value={formData.emailEmitente}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 bg-white/60 ${errors.emailEmitente ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-600'
                              }`}
                            required
                          />
                          {errors.emailEmitente && (
                            <p className="text-xs text-red-600 mt-1">{errors.emailEmitente}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handlePreview}
                      disabled={isPreviewLoading}
                      className="flex-1 bg-slate-900 text-white py-3 px-5 rounded-xl hover:bg-slate-700 transition-colors font-medium disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                      {isPreviewLoading ? 'Gerando...' : 'Visualizar'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePDF}
                      disabled={isGenerating}
                      className="flex-1 bg-amber-500 text-slate-900 py-3 px-5 rounded-xl hover:bg-amber-400 transition-colors font-semibold disabled:bg-amber-200 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? 'Gerando...' : 'Gerar PDF'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div className="lg:sticky lg:top-16 lg:self-start space-y-6">
                {showPreview ? (
                  <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="bg-slate-900 text-white px-8 py-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                          Pré-visualização
                        </p>
                        <h2 className="text-2xl font-semibold mt-1">Recibo em tempo real</h2>
                      </div>
                      <span className="section-label text-white/60">Preview</span>
                    </div>
                    <div className="overflow-auto max-h-[calc(100vh-12rem)] bg-white/85">
                      <ReciboPreview
                        data={formData}
                        qrCodeData={qrCodeData}
                        onPrint={() => window.print()}
                        onGeneratePDF={handleGeneratePDF}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel rounded-3xl p-14 text-center text-slate-700">
                    <svg
                      className="w-24 h-24 mx-auto text-slate-300 mb-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      Nenhum preview disponível
                    </h3>
                    <p className="text-slate-500">
                      Preencha o formulário e clique em &ldquo;Visualizar&rdquo; para ver o recibo
                    </p>
                  </div>
                )}
                <div className="glass-panel rounded-3xl p-8 text-sm text-slate-600 leading-relaxed">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Governança e Autenticidade
                  </h3>
                  <p>
                    Cada recibo é assinado digitalmente pela Duarte Urbanismo LTDA e armazenado em infraestrutura MongoDB com verificação pública.
                    O QR Code direciona para a API de validação, garantindo rastreabilidade e segurança jurídica.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
