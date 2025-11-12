import type { ReciboSeedInput } from '@/lib/recibos-repository';
import { EMISSOR_NOME, EMPRESA_ENDERECO, EMPRESA_TELEFONE, EMPRESA_EMAIL } from '@/lib/constants';
import { buildStaticPixPayload, DEFAULT_PIX_KEY } from '@/lib/pix';

const MERCHANT_CITY = 'Florianopolis';

const createPixPayload = (amount: number, txId: string) =>
  buildStaticPixPayload({
    key: DEFAULT_PIX_KEY,
    amount,
    merchantName: EMISSOR_NOME,
    merchantCity: MERCHANT_CITY,
    txId
  });

const reciboSeeds: ReciboSeedInput[] = [
  {
    shareId: '9f739e26-98a8-4e5c-a1dd-9d5c70feaf1e',
    data: {
      numero: 'NEG-AURORA-PAR-001',
      valor: 20000,
      recebidoDe: 'Lívia Martinez',
      cpfCnpj: '123.456.789-09',
      referente: 'Parcela 1 do lote Pôr do Sol Eco Village',
      data: '2024-02-10',
      formaPagamento: 'PIX',
      enderecoEmitente: EMPRESA_ENDERECO,
      telefoneEmitente: EMPRESA_TELEFONE,
      emailEmitente: EMPRESA_EMAIL,
      pixKey: DEFAULT_PIX_KEY,
      pixPayload: createPixPayload(20000, 'NEG-AURORA-PAR-001')
    },
    createdAt: '2024-02-10T12:00:00.000Z',
    updatedAt: '2024-02-10T12:00:00.000Z'
  },
  {
    shareId: 'cb486d48-d9a1-4c5b-b443-e62ab6966480',
    data: {
      numero: 'NEG-AURORA-PAR-002',
      valor: 20000,
      recebidoDe: 'Lívia Martinez',
      cpfCnpj: '123.456.789-09',
      referente: 'Parcela 2 do lote Pôr do Sol Eco Village',
      data: '2024-03-10',
      formaPagamento: 'PIX',
      enderecoEmitente: EMPRESA_ENDERECO,
      telefoneEmitente: EMPRESA_TELEFONE,
      emailEmitente: EMPRESA_EMAIL,
      pixKey: DEFAULT_PIX_KEY,
      pixPayload: createPixPayload(20000, 'NEG-AURORA-PAR-002')
    },
    createdAt: '2024-03-10T12:00:00.000Z',
    updatedAt: '2024-03-10T12:00:00.000Z'
  },
  {
    shareId: 'b1ad3a6f-93d8-4fae-948d-dceb8590b47e',
    data: {
      numero: 'NEG-AURORA-PAR-003',
      valor: 20000,
      recebidoDe: 'Lívia Martinez',
      cpfCnpj: '123.456.789-09',
      referente: 'Parcela 3 do lote Pôr do Sol Eco Village',
      data: '2024-04-10',
      formaPagamento: 'PIX',
      enderecoEmitente: EMPRESA_ENDERECO,
      telefoneEmitente: EMPRESA_TELEFONE,
      emailEmitente: EMPRESA_EMAIL,
      pixKey: DEFAULT_PIX_KEY,
      pixPayload: createPixPayload(20000, 'NEG-AURORA-PAR-003')
    },
    createdAt: '2024-04-10T12:00:00.000Z',
    updatedAt: '2024-04-10T12:00:00.000Z'
  },
  {
    shareId: 'f79862dd-4108-4dde-8a07-f3f27154796a',
    data: {
      numero: 'NEG-BOSQUE-PAR-001',
      valor: 15000,
      recebidoDe: 'Aurora Holdings Ltda',
      cpfCnpj: '47.200.760/0001-06',
      referente: 'Parcela 1 do lote Vista Verde Residencial',
      data: '2024-02-20',
      formaPagamento: 'PIX',
      enderecoEmitente: EMPRESA_ENDERECO,
      telefoneEmitente: EMPRESA_TELEFONE,
      emailEmitente: EMPRESA_EMAIL,
      pixKey: DEFAULT_PIX_KEY,
      pixPayload: createPixPayload(15000, 'NEG-BOSQUE-PAR-001')
    },
    createdAt: '2024-02-20T12:00:00.000Z',
    updatedAt: '2024-02-20T12:00:00.000Z'
  }
];

export default reciboSeeds;
