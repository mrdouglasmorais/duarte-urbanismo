const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const dbName = 'duarte-urbanismo';

async function testConnection() {
  console.log('🔌 Testando conexão com MongoDB...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`📊 Coleções encontradas: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Testar escrita
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Teste de escrita bem-sucedido');

    await testCollection.deleteMany({ test: true });
    console.log('✅ Teste de limpeza bem-sucedido');

    await client.close();
    console.log('✅ Conexão fechada');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testConnection();

