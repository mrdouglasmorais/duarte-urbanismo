export interface ReciboData {
  numero: string;
  valor: number;
  valorExtenso: string;
  recebidoDe: string;
  cpfCnpj: string;
  referente: string;
  data: string; // Data de pagamento/vencimento
  dataEmissao?: string; // Data de emissão do recibo
  formaPagamento: string;
  emitidoPor: string;
  emitidoPorNome?: string; // Nome do usuário que emitiu o recibo
  cpfEmitente: string;
  cepEmitente: string;
  enderecoEmitente: string;
  telefoneEmitente: string;
  emailEmitente: string;
  // Informações do empreendimento
  empreendimentoNome?: string;
  empreendimentoUnidade?: string;
  empreendimentoMetragem?: number;
  empreendimentoFase?: string;
  // Informações do lote
  numeroLote?: string;
  // Informações da parcela
  numeroParcela?: number;
  totalParcelas?: number;
  // Informações do corretor
  corretorNome?: string;
  corretorCreci?: string;
  // Status da parcela
  status?: 'Paga' | 'Pendente';
  // Se está em aberto, conta para crédito
  contaParaCredito?: boolean;
  // Informações bancárias para pagamento (quando pendente)
  bancoNome?: string;
  bancoAgencia?: string;
  bancoConta?: string;
  bancoTipoConta?: string;
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
  cepEmitente?: string;
}

