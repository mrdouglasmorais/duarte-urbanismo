import { Db, MongoClient, MongoServerError } from 'mongodb';

const DEFAULT_URI = 'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const DEFAULT_DB = 'duarte-urbanismo';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

const uri = DEFAULT_URI;
const dbName = DEFAULT_DB;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000, // 10 segundos
    socketTimeoutMS: 45000, // 45 segundos
    connectTimeoutMS: 10000, // 10 segundos
  });
  global._mongoClientPromise = client.connect().catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
    global._mongoClientPromise = undefined;
    throw error;
  });
}

const clientPromise = global._mongoClientPromise;

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && (error instanceof MongoServerError || error instanceof Error)) {
      const isRetryable =
        error instanceof MongoServerError &&
        (error.code === 6 || // HostUnreachable
          error.code === 7 || // HostNotFound
          error.code === 89 || // NetworkTimeout
          error.code === 91); // ShutdownInProgress

      if (isRetryable || error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        console.warn(`Tentativa de reconexão (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryOperation(operation, retries - 1);
      }
    }
    throw error;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  try {
    return await retryOperation(() => clientPromise);
  } catch (error) {
    console.error('Erro ao obter cliente MongoDB:', error);
    throw new Error('Não foi possível conectar ao banco de dados. Tente novamente mais tarde.');
  }
}

export async function getDb(): Promise<Db> {
  try {
    const client = await getMongoClient();
    // Verificar se a conexão está ativa
    await client.db('admin').admin().ping();
    return client.db(dbName);
  } catch (error) {
    console.error('Erro ao obter banco de dados:', error);
    throw new Error('Erro ao acessar o banco de dados. Tente novamente mais tarde.');
  }
}


