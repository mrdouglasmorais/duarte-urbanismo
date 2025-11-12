import { EMISSOR_CNPJ, EMISSOR_NOME, EMPRESA_CEP, EMPRESA_EMAIL, EMPRESA_ENDERECO, EMPRESA_TELEFONE } from '@/lib/constants';
import { formatarCEP, numeroParaExtenso } from '@/lib/utils';
import {
  validarCampoTexto,
  validarCEP,
  validarCPFouCNPJ,
  validarData,
  validarEmail,
  validarTelefone,
  validarValor
} from '@/lib/validators';
import { ReciboData } from '@/types/recibo';

export type ReciboPayload = Partial<ReciboData>;

const sanitizeText = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return value.toString().trim();
};

const sanitizeNumeroRecibo = (numero: string | number | undefined): string => {
  const normalized = sanitizeText(numero)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 32);

  if (normalized) {
    return normalized;
  }

  return `REC-${Date.now().toString().slice(-6)}`;
};

const sanitizeCep = (valor: string | undefined): string => {
  if (!valor) return formatarCEP(EMPRESA_CEP);
  return formatarCEP(valor);
};

export function sanitizeReciboData(payload: ReciboPayload): ReciboData {
  const valor = typeof payload?.valor === 'number' ? payload.valor : Number(payload?.valor) || 0;

  return {
    numero: sanitizeNumeroRecibo(payload?.numero),
    valor,
    valorExtenso: payload?.valorExtenso || numeroParaExtenso(valor),
    recebidoDe: sanitizeText(payload?.recebidoDe),
    cpfCnpj: sanitizeText(payload?.cpfCnpj),
    referente: sanitizeText(payload?.referente),
    data: sanitizeText(payload?.data).slice(0, 10),
    dataEmissao: payload?.dataEmissao ? sanitizeText(payload.dataEmissao).slice(0, 10) : undefined,
    formaPagamento: sanitizeText(payload?.formaPagamento),
    emitidoPor: payload?.emitidoPor || EMISSOR_NOME,
    emitidoPorNome: payload?.emitidoPorNome ? sanitizeText(payload.emitidoPorNome) : undefined,
    cpfEmitente: payload?.cpfEmitente || EMISSOR_CNPJ,
    cepEmitente: sanitizeCep(payload?.cepEmitente),
    enderecoEmitente: payload?.enderecoEmitente ? sanitizeText(payload.enderecoEmitente) : EMPRESA_ENDERECO,
    telefoneEmitente: payload?.telefoneEmitente ? sanitizeText(payload.telefoneEmitente) : EMPRESA_TELEFONE,
    emailEmitente: payload?.emailEmitente ? sanitizeText(payload.emailEmitente).toLowerCase() : EMPRESA_EMAIL,
    // Informações do empreendimento
    empreendimentoNome: payload?.empreendimentoNome ? sanitizeText(payload.empreendimentoNome) : undefined,
    empreendimentoUnidade: payload?.empreendimentoUnidade ? sanitizeText(payload.empreendimentoUnidade) : undefined,
    empreendimentoMetragem: typeof payload?.empreendimentoMetragem === 'number' ? payload.empreendimentoMetragem : (payload?.empreendimentoMetragem ? Number(payload.empreendimentoMetragem) : undefined),
    empreendimentoFase: payload?.empreendimentoFase ? sanitizeText(payload.empreendimentoFase) : undefined,
    // Informações do lote
    numeroLote: payload?.numeroLote ? sanitizeText(payload.numeroLote) : undefined,
    // Informações da parcela
    numeroParcela: typeof payload?.numeroParcela === 'number' ? payload.numeroParcela : (payload?.numeroParcela ? Number(payload.numeroParcela) : undefined),
    totalParcelas: typeof payload?.totalParcelas === 'number' ? payload.totalParcelas : (payload?.totalParcelas ? Number(payload.totalParcelas) : undefined),
    // Informações do corretor
    corretorNome: payload?.corretorNome ? sanitizeText(payload.corretorNome) : undefined,
    corretorCreci: payload?.corretorCreci ? sanitizeText(payload.corretorCreci) : undefined,
    // Status da parcela
    status: payload?.status === 'Paga' || payload?.status === 'Pendente' ? payload.status : undefined,
    contaParaCredito: typeof payload?.contaParaCredito === 'boolean' ? payload.contaParaCredito : undefined,
    // Informações bancárias
    bancoNome: payload?.bancoNome ? sanitizeText(payload.bancoNome) : undefined,
    bancoAgencia: payload?.bancoAgencia ? sanitizeText(payload.bancoAgencia) : undefined,
    bancoConta: payload?.bancoConta ? sanitizeText(payload.bancoConta) : undefined,
    bancoTipoConta: payload?.bancoTipoConta ? sanitizeText(payload.bancoTipoConta) : undefined,
    // PIX
    pixKey: payload?.pixKey ? sanitizeText(payload.pixKey) : undefined,
    pixPayload: payload?.pixPayload ? sanitizeText(payload.pixPayload) : undefined,
    // Share
    shareId: payload?.shareId ? sanitizeText(payload.shareId) : undefined
  };
}

export function validateReciboData(data: ReciboData): string[] {
  const errors: string[] = [];

  const collect = (result: { mensagem?: string } | { valido: boolean; mensagem?: string }) => {
    if ('mensagem' in result && result.mensagem) {
      errors.push(result.mensagem);
    }
  };

  collect(validarCampoTexto(data.numero, 'Número do recibo'));
  collect(validarValor(data.valor));
  collect(validarCampoTexto(data.recebidoDe, 'Nome/Razão Social'));
  collect(validarCPFouCNPJ(data.cpfCnpj));
  collect(validarCampoTexto(data.referente, 'Referente a', 10));
  collect(validarData(data.data));
  collect(validarCampoTexto(data.formaPagamento, 'Forma de pagamento'));
  collect(validarCEP(data.cepEmitente));
  collect(validarCampoTexto(data.enderecoEmitente, 'Endereço', 10));
  collect(validarTelefone(data.telefoneEmitente));
  collect(validarEmail(data.emailEmitente));
  collect(validarCPFouCNPJ(data.cpfEmitente));

  return errors;
}
