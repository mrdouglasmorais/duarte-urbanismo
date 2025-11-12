const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const dbName = 'duarte-urbanismo';

// Seed data simplificado
const seedData = {
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
      endereco: 'Rua das Bromélias, 102 - Florianópolis/SC',
      cep: '88000-000'
    },
    {
      id: 'cli-aurora-holdings',
      tipo: 'PJ',
      nome: 'Aurora Holdings Ltda.',
      documento: '47.200.760/0001-06',
      email: 'financeiro@auroraholdings.com',
      telefone: '48 4000-3010',
      contatoSecundario: 'Thiago Monteiro',
      endereco: 'Av. Beira-Mar Norte, 1800 - Florianópolis/SC',
      cep: '88015-700'
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
      descricao: 'Contrato fechado para residência unifamiliar de alto padrão.',
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
          reciboShareUrl: 'https://duarte-urbanismo.vercel.app/recibos/share/9f739e26-98a8-4e5c-a1dd-9d5c70feaf1e',
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
          reciboShareUrl: 'https://duarte-urbanismo.vercel.app/recibos/share/cb486d48-d9a1-4c5b-b443-e62ab6966480',
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
          reciboShareUrl: 'https://duarte-urbanismo.vercel.app/recibos/share/b1ad3a6f-93d8-4fae-948d-dceb8590b47e',
          reciboNumero: 'NEG-AURORA-PAR-003',
          reciboEmitidoEm: '2024-04-11'
        }
      ],
      criadoEm: '2024-01-15'
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

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(dbName);

    // Limpar coleções existentes
    console.log('🧹 Limpando coleções existentes...');
    await Promise.all([
      db.collection('sgci_empreendimentos').deleteMany({}),
      db.collection('sgci_clientes').deleteMany({}),
      db.collection('sgci_negociacoes').deleteMany({}),
      db.collection('sgci_corretores').deleteMany({}),
      db.collection('recibos').deleteMany({})
    ]);
    console.log('✅ Coleções limpas');

    // Inserir dados
    console.log('📝 Inserindo dados...');
    await Promise.all([
      db.collection('sgci_empreendimentos').insertMany(seedData.empreendimentos),
      db.collection('sgci_clientes').insertMany(seedData.clientes),
      db.collection('sgci_negociacoes').insertMany(seedData.negociacoes),
      db.collection('sgci_corretores').insertMany(seedData.corretores)
    ]);

    console.log(`✅ ${seedData.empreendimentos.length} empreendimentos inseridos`);
    console.log(`✅ ${seedData.clientes.length} clientes inseridos`);
    console.log(`✅ ${seedData.negociacoes.length} negociações inseridas`);
    console.log(`✅ ${seedData.corretores.length} corretores inseridos`);

    // Verificar dados inseridos
    const counts = await Promise.all([
      db.collection('sgci_empreendimentos').countDocuments(),
      db.collection('sgci_clientes').countDocuments(),
      db.collection('sgci_negociacoes').countDocuments(),
      db.collection('sgci_corretores').countDocuments()
    ]);

    console.log('\n📊 Resumo:');
    console.log(`   Empreendimentos: ${counts[0]}`);
    console.log(`   Clientes: ${counts[1]}`);
    console.log(`   Negociações: ${counts[2]}`);
    console.log(`   Corretores: ${counts[3]}`);

    await client.close();
    console.log('\n✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase();

