const { MongoClient } = require('mongodb');

const uri =
  'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const dbName = 'duarte-urbanismo';

const COLLECTIONS_TO_CLEAR = [
  'sgci_empreendimentos',
  'sgci_clientes',
  'sgci_negociacoes',
  'sgci_corretores',
  'recibos',
  'usuarios',
  'test_connection', // Coleção de teste
];

async function clearDatabase() {
  console.log('🗑️  Iniciando limpeza do banco de dados...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(dbName);

    console.log('\n📋 Coleções a serem limpas:');
    COLLECTIONS_TO_CLEAR.forEach((col) => console.log(`   - ${col}`));

    console.log('\n🧹 Limpando coleções...');

    const results = await Promise.all(
      COLLECTIONS_TO_CLEAR.map(async (collectionName) => {
        const collection = db.collection(collectionName);
        const countBefore = await collection.countDocuments();
        const result = await collection.deleteMany({});
        return {
          name: collectionName,
          deleted: result.deletedCount,
          before: countBefore,
        };
      }),
    );

    console.log('\n📊 Resultado da limpeza:');
    results.forEach((r) => {
      console.log(`   ${r.name}: ${r.before} → 0 documentos (${r.deleted} removidos)`);
    });

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    console.log(`\n✅ Total de documentos removidos: ${totalDeleted}`);
    console.log('✅ Banco de dados limpo com sucesso!');

    await client.close();
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

clearDatabase();
