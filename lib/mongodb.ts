import { Db, MongoClient } from 'mongodb';

const DEFAULT_URI = 'mongodb+srv://Vercel-Admin-duarte-urbanismo:HgenkTT9Ph0lJgr7@duarte-urbanismo.h1knxdi.mongodb.net/?retryWrites=true&w=majority';
const DEFAULT_DB = 'duarte-urbanismo';

const uri = (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) || DEFAULT_URI;
const dbName = (process.env.MONGODB_DB && process.env.MONGODB_DB.trim()) || DEFAULT_DB;

if (!process.env.MONGODB_URI) {
  console.warn('[sgci] Usando credenciais padrão de MongoDB configuradas em código.');
}

let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}


