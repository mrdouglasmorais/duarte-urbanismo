export interface ReciboData {
  numero: string;
  valor: number;
  valorExtenso: string;
  recebidoDe: string;
  cpfCnpj: string;
  referente: string;
  data: string;
  formaPagamento: string;
  emitidoPor: string;
  cpfEmitente: string;
  enderecoEmitente: string;
  telefoneEmitente: string;
  emailEmitente: string;
}

export interface QRCodeData {
  numero: string;
  valor: number;
  data: string;
  hash: string;
}

