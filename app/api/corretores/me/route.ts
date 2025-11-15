import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerUser } from '@/lib/firebase/server-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTION_NAME = 'sgci_corretores';

/**
 * GET /api/corretores/me
 * Retorna os dados completos do corretor logado (usando userId do Firebase)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getServerUser(request);

    if (!user || !user.uid) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar corretor pelo userId (Firebase UID)
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const corretor = await collection.findOne({ userId: user.uid });

    if (!corretor) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

    // Remover _id do MongoDB
    const { _id, ...corretorData } = corretor;

    return NextResponse.json({
      success: true,
      corretor: corretorData
    });
  } catch (error) {
    console.error('Erro ao buscar dados do corretor:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do corretor' },
      { status: 500 }
    );
  }
}

