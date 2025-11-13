const { MongoClient } = require('mongodb');

const uri =
  'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const dbName = 'duarte-urbanismo';

// Todas as collections do MongoDB
const COLLECTIONS_TO_CLEAR = [
  // SGCI Collections
  'sgci_empreendimentos',
  'sgci_clientes',
  'sgci_negociacoes',
  'sgci_corretores',
  // Recibos
  'recibos',
  // Clientes (área do cliente)
  'clientes',
  // Collections antigas (podem não existir mais)
  'usuarios',
  'users',
  'test_connection',
];

async function clearAllCollections() {
  console.log('🗑️  Iniciando limpeza completa do banco de dados MongoDB...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(dbName);

    // Listar todas as collections existentes
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map((col) => col.name);

    console.log('\n📋 Collections encontradas no banco:');
    existingCollectionNames.forEach((name) => console.log(`   - ${name}`));

    console.log('\n🧹 Limpando collections...');

    const results = await Promise.all(
      COLLECTIONS_TO_CLEAR.map(async (collectionName) => {
        try {
          const collection = db.collection(collectionName);
          const countBefore = await collection.countDocuments();

          if (countBefore === 0) {
            return {
              name: collectionName,
              deleted: 0,
              before: 0,
              status: 'vazia',
            };
          }

          const result = await collection.deleteMany({});
          return {
            name: collectionName,
            deleted: result.deletedCount,
            before: countBefore,
            status: 'limpa',
          };
        } catch (error) {
          // Collection pode não existir
          if (error.code === 26 || error.message.includes('not found')) {
            return {
              name: collectionName,
              deleted: 0,
              before: 0,
              status: 'não existe',
            };
          }
          throw error;
        }
      }),
    );

    console.log('\n📊 Resultado da limpeza:');
    results.forEach((r) => {
      const statusIcon = r.status === 'limpa' ? '✅' : r.status === 'vazia' ? '⚪' : '⚫';
      console.log(
        `   ${statusIcon} ${r.name}: ${r.before} → 0 documentos (${r.deleted} removidos) [${r.status}]`
      );
    });

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    const collectionsCleaned = results.filter((r) => r.status === 'limpa').length;

    console.log(`\n✅ Total de documentos removidos: ${totalDeleted}`);
    console.log(`✅ Collections limpas: ${collectionsCleaned}`);
    console.log('✅ Limpeza concluída com sucesso!');

    await client.close();
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

clearAllCollections();

