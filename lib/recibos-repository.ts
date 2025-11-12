import { randomUUID } from 'crypto';
import { getDb } from '@/lib/mongodb';
import { ReciboData, ReciboRecord } from '@/types/recibo';
import { generateReciboHash } from '@/lib/authenticity';
import { sanitizeReciboData } from '@/lib/recibos';
import type { ReciboPayload } from '@/lib/recibos';

const COLLECTION_NAME = 'recibos';

export interface ReciboSeedInput {
  shareId: string;
  data: ReciboPayload;
  createdAt?: string;
  updatedAt?: string;
}

export async function saveRecibo(data: ReciboData, hash: string): Promise<{ shareId: string }> {
  const db = await getDb();
  const collection = db.collection<ReciboRecord>(COLLECTION_NAME);

  const now = new Date();
  const existing = await collection.findOne({ numero: data.numero });
  const shareId = existing?.shareId ?? randomUUID();

  await collection.updateOne(
    { numero: data.numero },
    {
      $set: {
        ...data,
        hash,
        shareId,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  );

  return { shareId };
}

export async function findReciboByNumero(numero: string): Promise<ReciboRecord | null> {
  const db = await getDb();
  const collection = db.collection<ReciboRecord>(COLLECTION_NAME);
  const record = await collection.findOne({ numero });
  if (!record) return null;
  const { _id: _ignoredMongoId, ...rest } = record as ReciboRecord & { _id?: unknown };
  void _ignoredMongoId;
  return rest;
}

export async function findReciboByShareId(shareId: string): Promise<ReciboRecord | null> {
  const db = await getDb();
  const collection = db.collection<ReciboRecord>(COLLECTION_NAME);
  const record = await collection.findOne({ shareId });
  if (!record) return null;
  const { _id: _ignoredMongoId, ...rest } = record as ReciboRecord & { _id?: unknown };
  void _ignoredMongoId;
  return rest;
}

export async function seedRecibosDatabase(seeds: ReciboSeedInput[]): Promise<ReciboRecord[]> {
  const db = await getDb();
  const collection = db.collection<ReciboRecord>(COLLECTION_NAME);

  await collection.deleteMany({});

  const now = new Date();
  const records: ReciboRecord[] = seeds.map(seed => {
    const data = sanitizeReciboData(seed.data);
    const hash = generateReciboHash(data);
    const createdAt = seed.createdAt ? new Date(seed.createdAt) : now;
    const updatedAt = seed.updatedAt ? new Date(seed.updatedAt) : createdAt;

    return {
      ...data,
      shareId: seed.shareId,
      hash,
      createdAt,
      updatedAt
    };
  });

  if (records.length) {
    await collection.insertMany(records);
  }

  return records;
}

