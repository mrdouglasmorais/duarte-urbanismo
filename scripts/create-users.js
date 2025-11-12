const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const { randomUUID } = require('crypto');

const MONGODB_URI = 'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const DB_NAME = 'duarte-urbanismo';
const COLLECTION_NAME = 'usuarios';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const users = [
      {
        nome: 'Gelvane da Silva',
        email: 'gelvane.silva@duarteurbanismo.com',
        password: '123456', // Senha padrão
        ativo: true
      },
      {
        nome: 'Daniel Duarte',
        email: 'daniel.duarte@duarteurbanismo.com',
        password: '123456', // Senha padrão
        ativo: true
      }
    ];

    const now = new Date();

    for (const userData of users) {
      try {
        // Verificar se usuário já existe
        const existing = await collection.findOne({ email: userData.email.toLowerCase() });

        if (existing) {
          console.log(`⚠️  Usuário ${userData.email} já existe. Pulando...`);
          continue;
        }

        const user = {
          id: randomUUID(),
          nome: userData.nome.trim(),
          email: userData.email.toLowerCase().trim(),
          password: hashPassword(userData.password),
          ativo: userData.ativo ?? true,
          createdAt: now,
          updatedAt: now
        };

        await collection.insertOne(user);
        console.log(`✅ Usuário criado: ${userData.nome} (${userData.email})`);
        console.log(`   Senha: ${userData.password}`);
      } catch (error) {
        console.error(`❌ Erro ao criar usuário ${userData.nome}:`, error.message);
      }
    }

    console.log('\n📋 Resumo dos usuários criados:');
    const allUsers = await collection.find({}).toArray();
    allUsers.forEach(user => {
      console.log(`   - ${user.nome} (${user.email}) - ${user.ativo ? 'Ativo' : 'Inativo'}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Conexão fechada');
  }
}

createUsers();

