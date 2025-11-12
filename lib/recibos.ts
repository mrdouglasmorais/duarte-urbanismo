import { ReciboData } from '@/types/recibo';
import { numeroParaExtenso } from '@/lib/utils';
import { EMISSOR_CNPJ, EMISSOR_NOME } from '@/lib/constants';
import {
  validarCampoTexto,
  validarCPFouCNPJ,
  validarData,
  validarEmail,
  validarTelefone,
  validarValor
} from '@/lib/validators';

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

export function sanitizeReciboData(payload: ReciboPayload): ReciboData {
  const valor = typeof payload?.valor === 'number' ? payload.valor : Number(payload?.valor) || 0;

  return {
    numero: sanitizeNumeroRecibo(payload?.numero),
    valor,
    valorExtenso: numeroParaExtenso(valor),
    recebidoDe: sanitizeText(payload?.recebidoDe),
    cpfCnpj: sanitizeText(payload?.cpfCnpj),
    referente: sanitizeText(payload?.referente),
    data: sanitizeText(payload?.data).slice(0, 10),
    formaPagamento: sanitizeText(payload?.formaPagamento),
    emitidoPor: EMISSOR_NOME,
    cpfEmitente: EMISSOR_CNPJ,
    enderecoEmitente: sanitizeText(payload?.enderecoEmitente),
    telefoneEmitente: sanitizeText(payload?.telefoneEmitente),
    emailEmitente: sanitizeText(payload?.emailEmitente).toLowerCase()
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
  collect(validarCampoTexto(data.enderecoEmitente, 'Endereço', 10));
  collect(validarTelefone(data.telefoneEmitente));
  collect(validarEmail(data.emailEmitente));
  collect(validarCPFouCNPJ(data.cpfEmitente));

  return errors;
}
