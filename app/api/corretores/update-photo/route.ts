import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/firebase/server-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTION_NAME = 'sgci_corretores';

/**
 * POST /api/corretores/update-photo
 * Atualiza a foto do corretor no MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getServerUser(request);

    if (!user || !user.uid) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { corretorId, foto } = body;

    if (!corretorId || !foto) {
      return NextResponse.json(
        { error: 'corretorId e foto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o corretor pertence ao usuário logado
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const corretor = await collection.findOne({ id: corretorId });

    if (!corretor) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o corretor pertence ao usuário (ou se é admin)
    if (corretor.userId !== user.uid) {
      // Verificar se é admin
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 403 }
        );
      }
    }

    // Atualizar foto
    await collection.updateOne(
      { id: corretorId },
      {
        $set: {
          foto,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Foto atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar foto do corretor:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar foto' },
      { status: 500 }
    );
  }
}

