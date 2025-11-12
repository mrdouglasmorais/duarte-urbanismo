const { MongoClient } = require('mongodb');

const uri =
  'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const dbName = 'duarte-urbanismo';

async function testConnection() {
  console.log('🔌 Testando conexão com MongoDB...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso');
    await client.db(dbName).admin().ping();
    console.log('✅ Ping ao banco de dados bem-sucedido');
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    return false;
  }
}

async function testCollections() {
  console.log('\n📋 Verificando coleções...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const expectedCollections = [
      'sgci_empreendimentos',
      'sgci_clientes',
      'sgci_negociacoes',
      'sgci_corretores',
      'recibos'
    ];

    console.log('\nColeções encontradas:');
    collectionNames.forEach((name) => {
      const isExpected = expectedCollections.includes(name);
      console.log(`   ${isExpected ? '✅' : '⚠️ '} ${name}`);
    });

    const missing = expectedCollections.filter((name) => !collectionNames.includes(name));
    if (missing.length > 0) {
      console.log('\n⚠️  Coleções esperadas mas não encontradas:');
      missing.forEach((name) => console.log(`   - ${name}`));
    } else {
      console.log('\n✅ Todas as coleções esperadas estão presentes');
    }

    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar coleções:', error.message);
    return false;
  }
}

async function testDataCounts() {
  console.log('\n📊 Verificando contagem de documentos...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

  try {
    await client.connect();
    const db = client.db(dbName);

    const counts = await Promise.all([
      db.collection('sgci_empreendimentos').countDocuments(),
      db.collection('sgci_clientes').countDocuments(),
      db.collection('sgci_negociacoes').countDocuments(),
      db.collection('sgci_corretores').countDocuments(),
      db.collection('recibos').countDocuments()
    ]);

    console.log('\nContagem de documentos:');
    console.log(`   Empreendimentos: ${counts[0]}`);
    console.log(`   Clientes: ${counts[1]}`);
    console.log(`   Negociações: ${counts[2]}`);
    console.log(`   Corretores: ${counts[3]}`);
    console.log(`   Recibos: ${counts[4]}`);

    const total = counts.reduce((sum, count) => sum + count, 0);
    console.log(`\n   Total: ${total} documentos`);

    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Erro ao contar documentos:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Iniciando bateria de testes...\n');

  const results = {
    connection: false,
    collections: false,
    dataCounts: false
  };

  results.connection = await testConnection();
  if (!results.connection) {
    console.log('\n❌ Teste de conexão falhou. Abortando testes restantes.');
    process.exit(1);
  }

  results.collections = await testCollections();
  results.dataCounts = await testDataCounts();

  console.log('\n📋 Resumo dos testes:');
  console.log(`   Conexão: ${results.connection ? '✅' : '❌'}`);
  console.log(`   Coleções: ${results.collections ? '✅' : '❌'}`);
  console.log(`   Contagem: ${results.dataCounts ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every((r) => r === true);
  if (allPassed) {
    console.log('\n✅ Todos os testes passaram!');
    process.exit(0);
  } else {
    console.log('\n❌ Alguns testes falharam.');
    process.exit(1);
  }
}

runAllTests();
