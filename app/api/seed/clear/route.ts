import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTIONS = {
  empreendimentos: 'sgci_empreendimentos',
  clientes: 'sgci_clientes',
  negociacoes: 'sgci_negociacoes',
  corretores: 'sgci_corretores',
  recibos: 'recibos',
  clientesAuth: 'clientes',
  usuarios: 'usuarios',
  users: 'users',
} as const;

export async function POST() {
  try {
    console.log('🗑️  Iniciando limpeza de todas as collections...');

    const db = await getDb();

    const results = await Promise.all(
      Object.values(COLLECTIONS).map(async (collectionName) => {
        try {
          const result = await db.collection(collectionName).deleteMany({});
          return {
            collection: collectionName,
            deleted: result.deletedCount,
            status: 'success',
          };
        } catch (error: any) {
          if (error.code === 26) {
            // Collection não existe
            return {
              collection: collectionName,
              deleted: 0,
              status: 'not_found',
            };
          }
          return {
            collection: collectionName,
            deleted: 0,
            status: 'error',
            error: error.message,
          };
        }
      })
    );

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    const successful = results.filter((r) => r.status === 'success').length;

    return NextResponse.json({
      success: true,
      message: 'Limpeza concluída',
      summary: {
        totalDeleted,
        collectionsCleaned: successful,
        details: results,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao limpar collections:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

