import type { SgciState } from '@/types/sgci';

const seedData: SgciState = {
  empreendimentos: [
    {
      id: 'por-do-sol-lote-01',
      nome: 'Pôr do Sol Eco Village',
      metragem: 1200,
      unidade: 'Lote 01',
      valorBase: 420000,
      status: 'Disponível'
    },
    {
      id: 'por-do-sol-lote-02',
      nome: 'Pôr do Sol Eco Village',
      metragem: 980,
      unidade: 'Lote 02',
      valorBase: 380000,
      status: 'Disponível'
    },
    {
      id: 'skyline-cobertura-01',
      nome: 'Skyline Residence',
      metragem: 320,
      unidade: 'Cobertura 01',
      valorBase: 2150000,
      status: 'Reservado'
    }
  ],
  clientes: [
    {
      id: 'cli-livia-martinez',
      tipo: 'PF',
      nome: 'Lívia Martinez',
      documento: '123.456.789-09',
      email: 'livia.martinez@email.com',
      telefone: '48 98888-1200',
      contatoSecundario: 'Eduardo Martinez',
      referencias: 'Banco Aurora',
      endereco: 'Rua das Bromélias, 102 - Florianópolis/SC'
    },
    {
      id: 'cli-aurora-holdings',
      tipo: 'PJ',
      nome: 'Aurora Holdings Ltda.',
      documento: '47.200.760/0001-06',
      email: 'financeiro@auroraholdings.com',
      telefone: '48 4000-3010',
      contatoSecundario: 'Thiago Monteiro',
      endereco: 'Av. Beira-Mar Norte, 1800 - Florianópolis/SC'
    }
  ],
  negociacoes: [
    {
      id: 'neg-aurora-village',
      clienteId: 'cli-livia-martinez',
      unidadeId: 'por-do-sol-lote-01',
      corretorId: 'cor-marcos-azevedo',
      fase: 'Entrega de chaves',
      numeroLote: 'Lote 01',
      metragem: 1200,
      valorContrato: 870000,
      qtdParcelas: 36,
      descricao:
        'Contrato fechado para residência unifamiliar de alto padrão. Financiamento interno com correção IPCA + 0,85% a.m. Permutas incorporadas ao fluxo.',
      permuta: {
        tipo: 'Veículo',
        valor: 150000,
        descricao: 'SUV híbrido 2023 com pacote executivo'
      },
      permutaLista: [
        { tipo: 'Veículo', valor: 150000, descricao: 'SUV híbrido 2023 com pacote executivo' },
        { tipo: 'Outro Bem', valor: 85000, descricao: 'Projeto arquitetônico completo com paisagismo' }
      ],
      status: 'Fechado',
      shareId: 'a8a7db0c-9bca-4e58-9e9b-4a8fb45d673c',
      parcelas: [
        {
          id: 'par-aurora-001',
          numero: 1,
          valor: 20000,
          vencimento: '2024-02-10',
          status: 'Paga',
          reciboShareId: '9f739e26-98a8-4e5c-a1dd-9d5c70feaf1e',
          reciboShareUrl: 'http://localhost:3001/recibos/share/9f739e26-98a8-4e5c-a1dd-9d5c70feaf1e',
          reciboNumero: 'NEG-AURORA-PAR-001',
          reciboEmitidoEm: '2024-02-11'
        },
        {
          id: 'par-aurora-002',
          numero: 2,
          valor: 20000,
          vencimento: '2024-03-10',
          status: 'Paga',
          reciboShareId: 'cb486d48-d9a1-4c5b-b443-e62ab6966480',
          reciboShareUrl: 'http://localhost:3001/recibos/share/cb486d48-d9a1-4c5b-b443-e62ab6966480',
          reciboNumero: 'NEG-AURORA-PAR-002',
          reciboEmitidoEm: '2024-03-11'
        },
        {
          id: 'par-aurora-003',
          numero: 3,
          valor: 20000,
          vencimento: '2024-04-10',
          status: 'Paga',
          reciboShareId: 'b1ad3a6f-93d8-4fae-948d-dceb8590b47e',
          reciboShareUrl: 'http://localhost:3001/recibos/share/b1ad3a6f-93d8-4fae-948d-dceb8590b47e',
          reciboNumero: 'NEG-AURORA-PAR-003',
          reciboEmitidoEm: '2024-04-11'
        },
        {
          id: 'par-aurora-004',
          numero: 4,
          valor: 20000,
          vencimento: '2024-05-10',
          status: 'Pendente'
        },
        {
          id: 'par-aurora-005',
          numero: 5,
          valor: 20000,
          vencimento: '2024-06-10',
          status: 'Pendente'
        },
        {
          id: 'par-aurora-006',
          numero: 6,
          valor: 20000,
          vencimento: '2024-07-10',
          status: 'Pendente'
        }
      ],
      criadoEm: '2024-01-15'
    },
    {
      id: 'neg-bosque-lote-02',
      clienteId: 'cli-aurora-holdings',
      unidadeId: 'por-do-sol-lote-02',
      corretorId: 'cor-juliana-santos',
      fase: 'Fundação',
      numeroLote: 'Lote 02',
      metragem: 980,
      valorContrato: 610000,
      qtdParcelas: 48,
      descricao:
        'Negociação corporativa para implantação de residência modelo. Permuta com sala comercial e cronograma flexível em 48 parcelas.',
      permuta: {
        tipo: 'Imóvel',
        valor: 320000,
        descricao: 'Sala comercial Classe A no centro de Florianópolis'
      },
      permutaLista: [
        { tipo: 'Imóvel', valor: 320000, descricao: 'Sala comercial Classe A no centro de Florianópolis' }
      ],
      status: 'Em andamento',
      shareId: '61fda029-41b0-4b63-92f4-1a2fb4c69e6b',
      parcelas: [
        {
          id: 'par-bosque-001',
          numero: 1,
          valor: 15000,
          vencimento: '2024-02-20',
          status: 'Paga',
          reciboShareId: 'f79862dd-4108-4dde-8a07-f3f27154796a',
          reciboShareUrl: 'http://localhost:3001/recibos/share/f79862dd-4108-4dde-8a07-f3f27154796a',
          reciboNumero: 'NEG-BOSQUE-PAR-001',
          reciboEmitidoEm: '2024-02-21'
        },
        {
          id: 'par-bosque-002',
          numero: 2,
          valor: 15000,
          vencimento: '2024-03-20',
          status: 'Pendente'
        }
      ],
      criadoEm: '2024-02-02'
    }
  ],
  corretores: [
    {
      id: 'cor-marcos-azevedo',
      nome: 'Marcos Azevedo',
      creci: '123456-SC',
      email: 'marcos.azevedo@duarteurbanismo.com',
      telefone: '48 99777-2200',
      areaAtuacao: 'Florianópolis e região metropolitana'
    },
    {
      id: 'cor-juliana-santos',
      nome: 'Juliana Santos',
      creci: '654321-SC',
      email: 'juliana.santos@duarteurbanismo.com',
      telefone: '48 99888-3300',
      observacoes: 'Especialista em negociação corporativa'
    }
  ]
};

export default seedData;
