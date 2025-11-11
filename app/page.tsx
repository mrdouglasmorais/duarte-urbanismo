'use client';

import { useState, useRef } from 'react';
import { ReciboData } from '@/types/recibo';
import { numeroParaExtenso, gerarHash } from '@/lib/utils';
import { validarCPFouCNPJ, validarEmail, validarTelefone, validarValor, validarCampoTexto, validarData } from '@/lib/validators';
import ReciboPreview from '@/components/ReciboPreview';
import Logo from '@/components/Logo';

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
    emitidoPor: '',
    cpfEmitente: '',
    enderecoEmitente: '',
    telefoneEmitente: '',
    emailEmitente: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [valorDisplay, setValorDisplay] = useState<string>('');

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

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'valor':
        const resultValor = validarValor(parseFloat(value) || 0);
        return resultValor.mensagem;

      case 'cpfCnpj':
        const resultCpfCnpj = validarCPFouCNPJ(value);
        return resultCpfCnpj.mensagem;

      case 'cpfEmitente':
        const resultCpfEmitente = validarCPFouCNPJ(value);
        return resultCpfEmitente.mensagem;

      case 'emailEmitente':
        const resultEmail = validarEmail(value);
        return resultEmail.mensagem;

      case 'telefoneEmitente':
        const resultTelefone = validarTelefone(value);
        return resultTelefone.mensagem;

      case 'data':
        const resultData = validarData(value);
        return resultData.mensagem;

      case 'recebidoDe':
        const resultRecebido = validarCampoTexto(value, 'Nome/Razão Social');
        return resultRecebido.mensagem;

      case 'referente':
        const resultReferente = validarCampoTexto(value, 'Referente a', 10);
        return resultReferente.mensagem;

      case 'emitidoPor':
        const resultEmitente = validarCampoTexto(value, 'Nome do emitente');
        return resultEmitente.mensagem;

      case 'enderecoEmitente':
        const resultEndereco = validarCampoTexto(value, 'Endereço', 10);
        return resultEndereco.mensagem;

      default:
        return undefined;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

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
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar todos os campos
    Object.keys(formData).forEach(key => {
      if (key !== 'valorExtenso' && key !== 'numero' && key !== 'formaPagamento') {
        const error = validateField(key, (formData as any)[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      valor: true,
      recebidoDe: true,
      cpfCnpj: true,
      referente: true,
      data: true,
      emitidoPor: true,
      cpfEmitente: true,
      enderecoEmitente: true,
      telefoneEmitente: true,
      emailEmitente: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (!validateForm()) {
      alert('Por favor, corrija os erros no formulário antes de visualizar.');
      return;
    }
    // Gerar dados para QR Code
    const qrData = JSON.stringify({
      numero: formData.numero,
      valor: formData.valor,
      data: formData.data,
      emitente: formData.emitidoPor,
      hash: gerarHash(`${formData.numero}-${formData.valor}-${formData.data}`)
    });

    setQrCodeData(qrData);
    setShowPreview(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gerador de Recibos
          </h1>
          <p className="text-gray-600">
            Preencha os dados e gere seu recibo em PDF com QR Code único
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Dados do Recibo
            </h2>

            <form className="space-y-4">
              {/* Número e Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Recibo *
                  </label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                      errors.data ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="text"
                    name="valor"
                    value={valorDisplay}
                    onChange={handleValorChange}
                    onBlur={handleBlur}
                    placeholder="0,00"
                    className={`w-full pl-12 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                      errors.valor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                </div>
                {errors.valor && (
                  <p className="text-xs text-red-600 mt-1">{errors.valor}</p>
                )}
                {formData.valorExtenso && !errors.valor && formData.valor > 0 && (
                  <p className="text-xs text-gray-500 mt-1 italic">
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                    errors.recebidoDe ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                    errors.cpfCnpj ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                    errors.referente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Dados do Emitente
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="emitidoPor"
                      value={formData.emitidoPor}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                        errors.emitidoPor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {errors.emitidoPor && (
                      <p className="text-xs text-red-600 mt-1">{errors.emitidoPor}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      name="cpfEmitente"
                      value={formData.cpfEmitente}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="000.000.000-00"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                        errors.cpfEmitente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {errors.cpfEmitente && (
                      <p className="text-xs text-red-600 mt-1">{errors.cpfEmitente}</p>
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
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                        errors.enderecoEmitente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {errors.enderecoEmitente && (
                      <p className="text-xs text-red-600 mt-1">{errors.enderecoEmitente}</p>
                    )}
                  </div>

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
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                        errors.telefoneEmitente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                        errors.emailEmitente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {errors.emailEmitente && (
                      <p className="text-xs text-red-600 mt-1">{errors.emailEmitente}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Visualizar
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Gerando...' : 'Gerar PDF'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            {showPreview ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-800 text-white px-6 py-3">
                  <h2 className="text-xl font-semibold">Preview do Recibo</h2>
                </div>
                <div className="overflow-auto max-h-[calc(100vh-12rem)]">
                  <ReciboPreview data={formData} qrCodeData={qrCodeData} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300 mb-4"
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum preview disponível
                </h3>
                <p className="text-gray-500">
                  Preencha o formulário e clique em "Visualizar" para ver o recibo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
