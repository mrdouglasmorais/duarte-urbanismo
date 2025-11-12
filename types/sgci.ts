export type StatusUnidade = 'Disponível' | 'Reservado' | 'Vendido';
export type PessoaTipo = 'PF' | 'PJ';
export type ParcelaStatus = 'Paga' | 'Pendente';

export interface Empreendimento {
  id: string;
  nome: string;
  metragem: number;
  unidade: string;
  valorBase: number;
  status: StatusUnidade;
}

export interface Cliente {
  id: string;
  tipo: PessoaTipo;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  contatoSecundario?: string;
  referencias?: string;
  observacoes?: string;
  endereco: string;
}

export interface PermutaInfo {
  tipo: 'Veículo' | 'Imóvel' | 'Outro Bem';
  valor: number;
  descricao: string;
}

export interface Parcela {
  id: string;
  numero: number;
  valor: number;
  vencimento: string;
  status: ParcelaStatus;
  reciboShareId?: string;
  reciboShareUrl?: string;
  reciboNumero?: string;
  reciboEmitidoEm?: string;
}

export interface Negociacao {
  id: string;
  clienteId: string;
  unidadeId: string;
  corretorId?: string;
  fase?: string;
  numeroLote?: string;
  metragem?: number;
  valorContrato?: number;
  qtdParcelas?: number;
  descricao: string;
  permuta?: PermutaInfo;
  permutaLista?: PermutaInfo[];
  status: 'Em prospecção' | 'Em andamento' | 'Aguardando aprovação' | 'Fechado';
  shareId: string;
  parcelas: Parcela[];
  criadoEm: string;
}

export interface SgciState {
  empreendimentos: Empreendimento[];
  clientes: Cliente[];
  negociacoes: Negociacao[];
  corretores: Corretor[];
}

export interface Corretor {
  id: string;
  nome: string;
  creci: string;
  email: string;
  telefone: string;
  contatoSecundario?: string;
  areaAtuacao?: string;
  observacoes?: string;
}
