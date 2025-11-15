import { getDb } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

export interface EmpreendimentoSeed {
  id: string;
  nome: string;
  metragem: number;
  unidade: string;
  valorBase: number;
  status: 'Disponível' | 'Reservado' | 'Vendido';
}

export interface EmpreendimentoConfig {
  id: string;
  nome: string;
  titulo: string;
  descricao: string;
  localizacao: string[];
  caracteristicas: string[];
  investimento: string[];
  contato: string;
  estatisticas: Array<{
    valor: string;
    unidade: string;
    descricao: string;
  }>;
  galleryImages: string[];
  emDestaque: boolean;
  criadoEm: string;
}

export const getEmpreendimentosSeedData = (): EmpreendimentoSeed[] => [
  {
    id: randomUUID(),
    nome: 'Pôr do Sol Eco Village',
    metragem: 1000,
    unidade: 'Lote 01',
    valorBase: 350000,
    status: 'Disponível',
  },
  {
    id: randomUUID(),
    nome: 'Pôr do Sol Eco Village',
    metragem: 1500,
    unidade: 'Lote 02',
    valorBase: 525000,
    status: 'Disponível',
  },
  {
    id: randomUUID(),
    nome: 'Pôr do Sol Eco Village',
    metragem: 2000,
    unidade: 'Lote 03',
    valorBase: 700000,
    status: 'Disponível',
  },
  {
    id: randomUUID(),
    nome: 'Pôr do Sol Eco Village',
    metragem: 2500,
    unidade: 'Lote 04',
    valorBase: 875000,
    status: 'Disponível',
  },
  {
    id: randomUUID(),
    nome: 'Pôr do Sol Eco Village',
    metragem: 3000,
    unidade: 'Lote 05',
    valorBase: 1050000,
    status: 'Disponível',
  },
  {
    id: randomUUID(),
    nome: 'Pôr do Sol Eco Village',
    metragem: 3500,
    unidade: 'Lote 06',
    valorBase: 1225000,
    status: 'Disponível',
  },
];

export const empreendimentoConfigSeed: EmpreendimentoConfig = {
  id: 'por-do-sol-eco-village',
  nome: 'Pôr do Sol Eco Village',
  titulo: 'Pôr do Sol Eco Village',
  descricao: 'Seu refúgio de natureza e lazer em Tijucas/SC. Construa sua chácara em um condomínio exclusivo que une tranquilidade, segurança e infraestrutura completa!',
  localizacao: [
    'Apenas 4 km do Centro de Tijucas (Bairro Itinga).',
    'Fácil acesso à BR-101 e praias.'
  ],
  caracteristicas: [
    'Lotes amplos, a partir de 1.000 m² (até 3.500 m²).',
    '32 áreas de lazer com club house completo.'
  ],
  investimento: [
    'Valor base do m²: R$ 350,00',
    'Entrada mínima: 10%',
    'Saldo em até 120 parcelas',
    'Correção: IPCA + 0,85% a.m. direto com a incorporadora'
  ],
  contato: '+55 48 9669-6009',
  estatisticas: [
    { valor: '1.000', unidade: 'M²', descricao: 'Lotes a partir de' },
    { valor: '3.500', unidade: 'M²', descricao: 'Lotes até' },
    { valor: '32', unidade: '', descricao: 'Áreas de lazer' },
    { valor: '100%', unidade: '', descricao: 'Sustentável' }
  ],
  galleryImages: [
    'images/page_2_img_2.jpg',
    'images/page_2_img_3.jpg',
    'images/page_2_img_4.jpg',
    'images/page_3_img_2.jpg',
    'images/page_3_img_3.jpg',
    'images/page_3_img_4.jpg',
    'images/page_3_img_5.jpg',
    'images/page_3_img_6.jpg',
    'images/page_3_img_7.jpg',
    'images/page_3_img_8.jpg',
    'images/page_4_img_2.jpg',
    'images/page_4_img_3.jpg',
    'images/page_4_img_4.jpg',
    'images/page_4_img_5.jpg',
    'images/page_4_img_6.jpg',
    'images/page_5_img_2.jpg',
    'images/page_5_img_3.jpg',
    'images/page_5_img_4.jpg',
    'images/page_5_img_5.jpg',
    'images/page_5_img_6.jpg',
    'images/page_5_img_7.jpg',
    'images/page_6_img_2.jpg',
    'images/page_6_img_3.jpg',
    'images/page_6_img_4.jpg',
    'images/page_6_img_5.jpg',
    'images/page_7_img_2.jpg',
    'images/page_9_img_1.jpg',
    'images/page_9_img_8.jpg',
    'images/page_9_img_9.jpg',
    'images/page_9_img_10.jpg',
    'images/page_10_img_2.jpg',
    'images/page_10_img_3.jpg',
    'images/page_10_img_4.jpg',
    'images/page_10_img_5.jpg',
    'images/page_11_img_1.jpg'
  ],
  emDestaque: true,
  criadoEm: new Date().toISOString(),
};

export async function seedEmpreendimentos(): Promise<{ unidades: number; config: boolean }> {
  const db = await getDb();
  const unidadesCollection = db.collection('sgci_empreendimentos');
  const configCollection = db.collection('sgci_empreendimentos_config');

  // Limpar collections
  await unidadesCollection.deleteMany({});
  await configCollection.deleteMany({});

  // Gerar dados com IDs únicos
  const empreendimentosSeedData = getEmpreendimentosSeedData();

  // Inserir unidades
  await unidadesCollection.insertMany(empreendimentosSeedData);

  // Inserir configuração
  await configCollection.insertOne(empreendimentoConfigSeed);

  return {
    unidades: empreendimentosSeedData.length,
    config: true,
  };
}

