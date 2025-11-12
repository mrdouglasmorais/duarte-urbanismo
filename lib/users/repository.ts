import { randomUUID } from 'crypto';
import { getDb } from '@/lib/mongodb';
import type { User, UserInput, UserUpdate } from '@/types/user';
import crypto from 'crypto';

const COLLECTION_NAME = 'usuarios';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createUser(input: UserInput): Promise<User> {
  const db = await getDb();
  const collection = db.collection<User>(COLLECTION_NAME);

  // Verificar se email já existe
  const existing = await collection.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new Error('Email já cadastrado');
  }

  const now = new Date();
  const user: User = {
    id: randomUUID(),
    nome: input.nome.trim(),
    email: input.email.toLowerCase().trim(),
    password: hashPassword(input.password),
    ativo: input.ativo ?? true,
    createdAt: now,
    updatedAt: now
  };

  await collection.insertOne(user);
  const { password: _ignoredPassword, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const collection = db.collection<User>(COLLECTION_NAME);
  const user = await collection.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  const { _id: _ignoredMongoId, ...rest } = user;
  return rest as User;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const collection = db.collection<User>(COLLECTION_NAME);
  const user = await collection.findOne({ id });
  if (!user) return null;
  const { _id: _ignoredMongoId, ...rest } = user;
  return rest as User;
}

export async function findAllUsers(): Promise<Omit<User, 'password'>[]> {
  const db = await getDb();
  const collection = db.collection<User>(COLLECTION_NAME);
  const users = await collection.find({}).toArray();
  return users.map(user => {
    const { _id: _ignoredMongoId, password: _ignoredPassword, ...rest } = user;
    return rest as Omit<User, 'password'>;
  });
}

export async function updateUser(id: string, update: UserUpdate): Promise<User | null> {
  const db = await getDb();
  const collection = db.collection<User>(COLLECTION_NAME);

  const updateData: Partial<User> = {
    updatedAt: new Date()
  };

  if (update.nome !== undefined) {
    updateData.nome = update.nome.trim();
  }
  if (update.email !== undefined) {
    updateData.email = update.email.toLowerCase().trim();
    // Verificar se novo email já existe
    const existing = await collection.findOne({ email: updateData.email, id: { $ne: id } });
    if (existing) {
      throw new Error('Email já cadastrado');
    }
  }
  if (update.password !== undefined) {
    updateData.password = hashPassword(update.password);
  }
  if (update.ativo !== undefined) {
    updateData.ativo = update.ativo;
  }

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  const { _id: _ignoredMongoId, password: _ignoredPassword, ...rest } = result;
  return rest as User;
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = await getDb();
  const collection = db.collection<User>(COLLECTION_NAME);
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.ativo) return null;

  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) return null;

  const { password: _ignoredPassword, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

