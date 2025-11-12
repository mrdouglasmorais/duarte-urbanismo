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
  shareId?: string;
  pixKey?: string;
  pixPayload?: string;
}

export interface ReciboRecord extends ReciboData {
  hash: string;
  shareId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReciboQrCodePayload {
  numero: string;
  valor: number;
  data: string;
  emitente: string;
  hash: string;
  verifyUrl: string;
  shareUrl?: string;
  pixKey?: string;
  pixPayload?: string;
}

