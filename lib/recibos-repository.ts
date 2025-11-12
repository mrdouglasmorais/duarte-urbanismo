import { generateReciboHash } from '@/lib/authenticity';
import { getDb } from '@/lib/mongodb';
import type { ReciboPayload } from '@/lib/recibos';
import { sanitizeReciboData } from '@/lib/recibos';
import { ReciboData, ReciboRecord } from '@/types/recibo';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'recibos';

export interface ReciboSeedInput {
  shareId: string;
  data: ReciboPayload;
  createdAt?: string;
  updatedAt?: string;
}

export async function saveRecibo(data: ReciboData, hash: string): Promise<{ shareId: string }> {
  try {
    if (!data || !hash) {
      throw new Error('Dados do recibo ou hash não fornecidos');
    }

    const db = await getDb();
    const collection = db.collection<ReciboRecord>(COLLECTION_NAME);

    const now = new Date();
    let existing: ReciboRecord | null = null;

    try {
      existing = await collection.findOne({ numero: data.numero });
    } catch (error) {
      console.error('Erro ao buscar recibo existente:', error);
      // Continua mesmo se a busca falhar
    }

    const shareId = existing?.shareId ?? randomUUID();

    try {
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
    } catch (error) {
      console.error('Erro ao salvar recibo:', error);
      throw new Error('Não foi possível salvar o recibo no banco de dados');
    }

    return { shareId };
  } catch (error) {
    console.error('Erro em saveRecibo:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido ao salvar recibo');
  }
}

export async function findReciboByNumero(numero: string): Promise<ReciboRecord | null> {
  try {
    if (!numero || typeof numero !== 'string' || numero.trim().length === 0) {
      return null;
    }

    const db = await getDb();
    const collection = db.collection<ReciboRecord>(COLLECTION_NAME);
    const record = await collection.findOne({ numero: numero.trim() });

    if (!record) return null;

    const { _id: _ignoredMongoId, ...rest } = record as unknown as ReciboRecord & { _id?: unknown };
    void _ignoredMongoId;
    return rest as ReciboRecord;
  } catch (error) {
    console.error('Erro ao buscar recibo por número:', error);
    throw new Error('Erro ao buscar recibo no banco de dados');
  }
}

export async function findReciboByShareId(shareId: string): Promise<ReciboRecord | null> {
  try {
    if (!shareId || typeof shareId !== 'string' || shareId.trim().length === 0) {
      return null;
    }

    const db = await getDb();
    const collection = db.collection<ReciboRecord>(COLLECTION_NAME);
    const record = await collection.findOne({ shareId: shareId.trim() });

    if (!record) return null;

    const { _id: _ignoredMongoId, ...rest } = record as unknown as ReciboRecord & { _id?: unknown };
    void _ignoredMongoId;
    return rest as ReciboRecord;
  } catch (error) {
    console.error('Erro ao buscar recibo por shareId:', error);
    throw new Error('Erro ao buscar recibo no banco de dados');
  }
}

export async function seedRecibosDatabase(seeds: ReciboSeedInput[]): Promise<ReciboRecord[]> {
  try {
    if (!Array.isArray(seeds)) {
      throw new Error('Seeds deve ser um array');
    }

    const db = await getDb();
    const collection = db.collection<ReciboRecord>(COLLECTION_NAME);

    try {
      await collection.deleteMany({});
    } catch (error) {
      console.error('Erro ao limpar coleção:', error);
      throw new Error('Erro ao limpar dados existentes');
    }

    const now = new Date();
    const records: ReciboRecord[] = seeds
      .filter(seed => seed && seed.data && seed.shareId)
      .map(seed => {
        try {
          const data = sanitizeReciboData(seed.data);
          const hash = generateReciboHash(data);
          const createdAt = seed.createdAt ? new Date(seed.createdAt) : now;
          const updatedAt = seed.updatedAt ? new Date(seed.updatedAt) : createdAt;

          if (!hash || !seed.shareId) {
            throw new Error('Hash ou shareId ausente');
          }

          return {
            ...data,
            shareId: seed.shareId,
            hash,
            createdAt,
            updatedAt
          };
        } catch (error) {
          console.error('Erro ao processar seed:', error, seed);
          throw error;
        }
      });

    if (records.length === 0) {
      console.warn('Nenhum registro válido para inserir');
      return [];
    }

    try {
      await collection.insertMany(records);
    } catch (error) {
      console.error('Erro ao inserir registros:', error);
      throw new Error('Erro ao inserir dados no banco');
    }

    return records;
  } catch (error) {
    console.error('Erro em seedRecibosDatabase:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido ao popular banco de dados');
  }
}

