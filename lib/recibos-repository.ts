import { randomUUID } from 'crypto';
import { getDb } from '@/lib/mongodb';
import { ReciboData, ReciboRecord } from '@/types/recibo';

const COLLECTION_NAME = 'recibos';

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

